import mapStyle from "./mapStyle.json";
import {apiCluster} from "../lib/Miles/apiTypes";
import MapView, {
  Callout,
  enableLatestRenderer,
  Marker,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import React from "react";
import VehicleMarker from "./VehicleMarker";
import ChargeStationMarker from "./ChargeStation/ChargeStationMarker";
import Borders from "./Borders";
import {useUpdateVehicles, useVehicles} from "../state/vehicles.state";
import _ from "lodash";
import {parseVehicles} from "../lib/Miles/parseVehiclesResponse";
import {fetchVehiclesForRegion} from "../lib/Miles/fetchForRegion";
import Geolocation, {
  GeolocationResponse,
} from "@react-native-community/geolocation";
import {useChargeStations} from "../state/chargestations.state";
import {useRegion, useSetRegion, useUpdateRegion} from "../state/region.state";
import { Text } from "react-native";
import ChargeStationCallout from "./ChargeStation/ChargeStationCallout";

export interface MapState {
  clusters: apiCluster[];
  pos: GeolocationResponse | undefined;
}

class Map extends React.Component<{}, MapState> {
  map: any;

  constructor(props: any) {
    super(props);
    this.state = {
      clusters: [],
      pos: undefined,
    };
    enableLatestRenderer();
  }

  componentDidMount() {
    this.gotoSelfLocation();
  }

  gotoSelfLocation = async () => {
    const pos = await this.getLocation();

    useUpdateRegion({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
    });
    this.map.animateCamera({
      center: {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      },
    });

    this.handleFetchVehicles();
  };

  getLocation = async (): Promise<GeolocationResponse> => {
    return new Promise<GeolocationResponse>((resolve, reject) =>
      Geolocation.getCurrentPosition(
        position => {
          this.setState({pos: position});
          resolve(position);
        },
        error => {
          reject(error);
        },
      ),
    );
  };

  handleFetchVehicles = async () => {
    const data = await fetchVehiclesForRegion(useRegion().current);
    // todo region store && fetch charge vehicles somewhere else
    // requires refetching clusters first
    useUpdateVehicles(parseVehicles(data));
    this.setState({clusters: data.Data.clusters});
  };

  debounceFetchVehicles = _.debounce(this.handleFetchVehicles, 1000);

  onRegionChange = (region: any) => {
    useSetRegion(region);
    this.debounceFetchVehicles();
  };

  render() {
    return (
      <MapView
        ref={ref => (this.map = ref)}
        style={[{height: "100%", width: "100%"}]}
        provider={PROVIDER_GOOGLE}
        initialRegion={useRegion().current}
        onRegionChange={this.onRegionChange}
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
        {this.state.clusters.map((cluster, index) => {
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
  }
}

export default Map;
