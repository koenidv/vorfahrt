import mapStyle from "./mapStyle.json";
import {apiCluster} from "../lib/Miles/apiTypes";
import MapView, {Marker, PROVIDER_GOOGLE, Polyline, Region} from "react-native-maps";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
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
  gotoRegion: (region: Region) => void;
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

  // fetch vehicles when filters change
  useEffect(
    useRef(
      debounce(() => {
        handleFetchVehicles();
      }, 1000),
    ).current,
    [filters.vehicleSize, filters.chargeOverflow, filters.engineType],
  );

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

  const gotoRegion = (region: Region) => {
    map.current?.animateToRegion(region);
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
    gotoRegion,
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
                <VehicleMarker
                  onPress={handleVehicleSelected.bind(this, pin)}
                  vehicle={pin}
                  isSelected={appState.selectedVehicle?.id === pin.id}
                />
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
                  <ChargeStationMarker
                    onPress={handleChargeStationSelected.bind(this, station)}
                    station={station}
                    isSelected={
                      appState.selectedChargeStation?.milesId ===
                      station.milesId
                    }
                  />
                );
              })}
            {appState.walkingDirections && (
              <Polyline
                coordinates={appState.walkingDirections.polyline}
                strokeColor="white"
                strokeWidth={2}
                lineJoin="round"
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
