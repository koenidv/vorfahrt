import mapStyle from "./mapStyle.json";
import {apiCluster} from "../lib/Miles/apiTypes";
import MapView, {Marker, PROVIDER_GOOGLE} from "react-native-maps";
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import VehicleMarker from "./VehicleMarker/VehicleMarker";
import ChargeStationMarker from "./ChargeStation/ChargeStationMarker";
import Borders from "./Borders";
import {debounce} from "lodash";
import {useRegion} from "../state/region.state";
import ChargeStationCallout from "./ChargeStation/ChargeStationCallout";
import {getLocation} from "../lib/location/getLocation";
import {useVehicles} from "../state/vehicles.state";
import {useChargeStations} from "../state/chargestations.state";
import {
  fetchChargeStationsCurrentRegionUpdateState,
  fetchVehiclesForRegionUpdateState,
} from "../lib/fetchRegionUpdateState";
import {useFilters} from "../state/filters.state";
import {Text, View} from "react-native";
import { useAppState } from "../state/app.state";

export interface MapMethods {
  gotoSelfLocation: () => void;
  handleFetchVehicles: () => void;
}

const Map = forwardRef<MapMethods>((_props, ref) => {
  const [clusters, setClusters] = useState<apiCluster[]>([]);
  let map = useRef<MapView>(null);

  const vehicles = useVehicles(state => state.vehicles);
  const stations = useChargeStations(state => state.stations);
  const appState = useAppState();

  const initialRegion = useRegion.getState().current;

  const filters = useFilters();

  const [isMapReady, setIsMapReady] = useState(false);
  const onContainerLayout = () => {
    console.log("Map is ready");
    setIsMapReady(true);
    gotoSelfLocation();
  };

  const gotoSelfLocation = async () => {
    const pos = await getLocation();
    map.current?.animateCamera({
      center: {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      },
      zoom: 15,
    });
  };

  const handleFetchVehicles = async () => {
    fetchVehiclesForRegionUpdateState(useRegion.getState().current);
    if (useFilters.getState().alwaysShowChargingStations === true) {
      fetchChargeStationsCurrentRegionUpdateState(useRegion.getState().current);
    }
  };

  const debounceFetchVehicles = useRef(
    debounce(handleFetchVehicles, 200),
  ).current;

  const onRegionChange = (region: any) => {
    useRegion.getState().setCurrent(region);
    debounceFetchVehicles();
  };

  useImperativeHandle(ref, () => ({
    gotoSelfLocation,
    handleFetchVehicles,
  }));

  return (
    <View
      style={{backgroundColor: "#000", height: "100%", width: "100%"}}
      onLayout={onContainerLayout}>
      {isMapReady && (
        <>
        <MapView
          ref={map}
          style={[{height: "100%", width: "100%"}]}
          onPress={() => appState.setSelectedVehicle(undefined)}
          loadingBackgroundColor="#000"
          provider={PROVIDER_GOOGLE}
          initialRegion={initialRegion}
          onRegionChange={onRegionChange}
          customMapStyle={mapStyle}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsTraffic={false}
          showsIndoors={false}
          pitchEnabled={false}
          rotateEnabled={false}
          toolbarEnabled={false}
          loadingEnabled={true}
          moveOnMarkerPress={true}>
          {vehicles.map(pin => {
            return (
              <Marker
                coordinate={{
                  latitude: pin.coordinates.lat,
                  longitude: pin.coordinates.lng,
                }}
                onPress={() => {appState.setSelectedVehicle(pin)}}
                key={"v_" + pin.id}
                tracksViewChanges={false}>
                <VehicleMarker vehicle={pin} />
              </Marker>
            );
          })}
          {clusters.map(cluster => {
            return (
              <Marker
                key={"c_" + cluster.idClusterHash}
                coordinate={{
                  latitude: cluster.Latitude,
                  longitude: cluster.Longitude,
                }}
                title={cluster.nUnits.toString()}
                description={cluster.idCluster?.toString()}
                pinColor="yellow"
              />
            );
          })}
          {stations.map(station => {
            return (
              <Marker
                key={"p_" + station.milesId}
                coordinate={{
                  latitude: station.coordinates.lat,
                  longitude: station.coordinates.lng,
                }}
                title="Charger"
                description={
                  station.availability
                    ? station.availability.statusKnown
                      ? `${station.availability.available} available`
                      : "Status unknown"
                    : station.name
                }
                tracksViewChanges={false}
                flat={true}
                anchor={{x: 0.5, y: 0.5}}
                calloutAnchor={{x: 0.45, y: 0.25}}>
                <ChargeStationMarker station={station} />
                <ChargeStationCallout station={station} />
              </Marker>
            );
          })}
          <Borders displayNoParking={filters.showNoParkingZones} />
        </MapView>
        <Text>Sache</Text>
        </>
      )}
    </View>
  );
});

export default Map;
