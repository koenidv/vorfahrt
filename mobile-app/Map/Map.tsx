import mapStyle from "./mapStyle.json";
import {apiCluster} from "../lib/Miles/apiTypes";
import MapView, {Marker, PROVIDER_GOOGLE} from "react-native-maps";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import VehicleMarker from "./VehicleMarker";
import ChargeStationMarker from "./ChargeStation/ChargeStationMarker";
import Borders from "./Borders";
import {useUpdateVehicles, useVehicles} from "../state/vehicles.state";
import _ from "lodash";
import {parseVehicles} from "../lib/Miles/parseVehiclesResponse";
import {fetchVehiclesForRegion} from "../lib/Miles/fetchForRegion";
import {useChargeStations} from "../state/chargestations.state";
import {useRegion, useSetRegion} from "../state/region.state";
import ChargeStationCallout from "./ChargeStation/ChargeStationCallout";
import {getLocation} from "../lib/location/getLocation";

export interface MapMethods {
  gotoSelfLocation: () => void;
  handleFetchVehicles: () => void;
}

const Map = forwardRef<MapMethods>((_props, ref) => {
  const [clusters, setClusters] = useState<apiCluster[]>([]);
  let map = useRef<MapView>(null);

  useEffect(() => {
    gotoSelfLocation();
  }, []);

  const gotoSelfLocation = async () => {
    const pos = await getLocation();
    map.current?.animateCamera({
      center: {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      },
    });
  };

  const handleFetchVehicles = async () => {
    const data = await fetchVehiclesForRegion(useRegion().current);
    // todo region store && fetch charge vehicles somewhere else
    // requires refetching clusters first
    useUpdateVehicles(parseVehicles(data));
    setClusters(data.Data.clusters);
  };
  const debounceFetchVehicles = _.debounce(handleFetchVehicles, 1000);

  const onRegionChange = (region: any) => {
    useSetRegion(region);
    debounceFetchVehicles();
  };

  useImperativeHandle(ref, () => ({
    gotoSelfLocation,
    handleFetchVehicles,
  }));

  return (
    <MapView
      ref={map}
      style={[{height: "100%", width: "100%"}]}
      provider={PROVIDER_GOOGLE}
      initialRegion={useRegion().current}
      onRegionChange={onRegionChange}
      customMapStyle={mapStyle}
      showsUserLocation={true}
      showsMyLocationButton={false}
      showsTraffic={false}
      showsIndoors={false}
      pitchEnabled={false}
      rotateEnabled={false}>
      {useVehicles().vehicles.map((pin, index) => {
        return (
          <Marker
            coordinate={{
              latitude: pin.coordinates.lat,
              longitude: pin.coordinates.lng,
            }}
            key={"v_" + index}
            title={pin.licensePlate}
            description={`${pin.model}, ${pin.charge}`}
            tracksViewChanges={false}>
            <VehicleMarker vehicle={pin} />
          </Marker>
        );
      })}
      {clusters.map((cluster, index) => {
        return (
          <Marker
            key={"c_" + index}
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
      {useChargeStations().stations.map((station, index) => {
        return (
          <Marker
            key={"p_" + index}
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
      <Borders />
    </MapView>
  );
});

export default Map;
