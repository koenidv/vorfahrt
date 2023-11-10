import mapStyle from "./mapStyle.json";
import {apiCluster} from "../lib/Miles/apiTypes";
import MapView, {Marker, PROVIDER_GOOGLE, Polyline} from "react-native-maps";
import React, {forwardRef, useImperativeHandle, useRef, useState} from "react";
import VehicleMarker from "./Markers/VehicleMarker";
import ChargeStationMarker from "./Markers/ChargeStationMarker";
import Borders from "./Borders";
import {debounce} from "lodash";
import {useRegion} from "../state/region.state";
import {getLocation} from "../lib/location/getLocation";
import {useVehicles} from "../state/vehicles.state";
import {useChargeStations} from "../state/chargestations.state";
import {
  fetchChargeStationsCurrentRegionUpdateState,
  fetchVehiclesForRegionUpdateState,
} from "../lib/fetchRegionUpdateState";
import {useFilters} from "../state/filters.state";
import {Text, View} from "react-native";
import {useAppState} from "../state/app.state";
import {
  Route,
  Travelmodes,
  getDirections,
  shouldDisplayWalkingRoute,
} from "../lib/Maps/directions";
import {ChargeStation, Vehicle} from "../lib/Miles/types";

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
    if (filters.alwaysShowChargingStations === true) {
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

  const fetchDrivingDirections = async (
    vehicle: Vehicle | undefined,
    station: ChargeStation | undefined,
  ) => {
    if (!vehicle || !station) return;
    appState.setDrivingDirections(
      await getDirections(
        vehicle.coordinates,
        station.coordinates,
        Travelmodes.DRIVING,
      ),
    );
  };

  const handleVehicleSelected = async (vehicle: any) => {
    appState.setSelectedVehicle(vehicle);
    appState.setWalkingDirections(null);
    appState.setDrivingDirections(null);
    const geolocation = await getLocation();
    const selfpos = {
      lat: geolocation.coords.latitude,
      lng: geolocation.coords.longitude,
    };
    if (shouldDisplayWalkingRoute(selfpos, vehicle.coordinates)) {
      appState.setWalkingDirections(
        await getDirections(selfpos, vehicle.coordinates, Travelmodes.WALKING),
      );
    }
    fetchDrivingDirections(vehicle, appState.selectedChargeStation);
  };

  const handleChargeStationSelected = async (station: any) => {
    appState.setSelectedChargeStation(station);
    appState.setDrivingDirections(null);
    fetchDrivingDirections(appState.selectedVehicle, station);
  };

  const handleDeselect = () => {
    appState.setSelectedVehicle(undefined);
    appState.setSelectedChargeStation(undefined);
    appState.setWalkingDirections(null);
    appState.setDrivingDirections(null);
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
            onPress={handleDeselect}
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
                  onPress={handleVehicleSelected.bind(this, pin)}
                  key={"v_" + pin.id}
                  tracksViewChanges={appState.selectedVehicle?.id === pin.id}>
                  <VehicleMarker
                    vehicle={pin}
                    isSelected={appState.selectedVehicle?.id === pin.id}
                  />
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
            {(!appState.selectedVehicle ||
              appState.selectedVehicle.isElectric) &&
              stations.map(station => {
                return (
                  <Marker
                    key={"p_" + station.milesId}
                    coordinate={{
                      latitude: station.coordinates.lat,
                      longitude: station.coordinates.lng,
                    }}
                    onPress={handleChargeStationSelected.bind(this, station)}
                    tracksViewChanges={appState.selectedChargeStation?.milesId === station.milesId}
                    flat={true}
                    anchor={{x: 0.5, y: 0.5}}
                    calloutAnchor={{x: 0.45, y: 0.25}}>
                    <ChargeStationMarker station={station} isSelected={appState.selectedChargeStation?.milesId === station.milesId} />
                  </Marker>
                );
              })}
            {appState.walkingDirections && (
              <Polyline
                coordinates={appState.walkingDirections.polyline}
                strokeColor="white"
                strokeWidth={2}
              />
            )}
            {appState.drivingDirections && (
              <Polyline
                coordinates={appState.drivingDirections.polyline}
                strokeColor={
                  appState.selectedVehicle?.isElectric ? "#37DFA3" : "#429DF1"
                }
                strokeWidth={2}
              />
            )}
            <Borders displayNoParking={filters.showNoParkingZones} />
          </MapView>
          <Text>Sache</Text>
        </>
      )}
    </View>
  );
});

export default Map;
