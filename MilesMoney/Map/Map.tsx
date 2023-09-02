import mapStyle from "./mapStyle.json";
import {apiCluster, apiPOI} from "../lib/Miles/apiTypes";
import MapView, {
  enableLatestRenderer,
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import React from "react";
import VehicleMarker from "./VehicleMarker";
import ChargeStationMarker from "./ChargeStationMarker";
import Borders from "./Borders";
import {useUpdateVehicles, useVehicles} from "../state/vehicles.state";
import _ from "lodash";
import {
  parseChargeStations,
  parseVehicles,
} from "../lib/Miles/parseVehiclesResponse";
import {
  fetchChargeStationsForRegion,
  fetchVehiclesForRegion,
} from "../lib/Miles/fetchForRegion";
import Geolocation, {
  GeolocationResponse,
} from "@react-native-community/geolocation";
import {
  useChargeStations,
  useUpdateChargeStations,
} from "../state/chargestations.state";

export interface MapState {
  region: Region;
  clusters: apiCluster[];
  pois: apiPOI[];
  pos: GeolocationResponse | undefined;
}
class Map extends React.Component<{}, MapState> {
  locationInterval: NodeJS.Timeout | null = null;
  map: any;

  constructor(props: any) {
    super(props);
    this.state = {
      region: {
        latitude: 52.5277672,
        longitude: 13.3767757,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
      clusters: [],
      pois: [],
      pos: undefined,
    };
    enableLatestRenderer();

    this.locationInterval = null;
  }

  componentDidMount() {
    this.gotoSelfLocation();
  }

  gotoSelfLocation = async () => {
    const pos = await this.getLocation();

    this.setState({
      region: {
        ...this.state.region,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      },
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
    const data = await fetchVehiclesForRegion(this.state.region);
    // todo fetch vehicles & pois in seperate queries (should be a lot faster)
    useUpdateVehicles(parseVehicles(data));
    this.setState({clusters: data.Data.clusters});
  };

  handleFetchChargeStations = async () => {
    // todo region store && fetch charge stations somewhere else
    const data = await fetchChargeStationsForRegion(this.state.region);
    useUpdateChargeStations(parseChargeStations(data));
  };

  debounceFetchVehicles = _.debounce(this.handleFetchVehicles, 1000);

  onRegionChange = (region: any) => {
    this.setState({region: region});
    this.debounceFetchVehicles();
  };

  render() {
    return (
      <MapView
        ref={ref => (this.map = ref)}
        style={[{height: "100%", width: "100%"}]}
        provider={PROVIDER_GOOGLE}
        initialRegion={this.state.region}
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
              title={station.name}
              description={station.milesId.toString()}
              tracksViewChanges={false}
              flat={true}
              anchor={{x: 0.5, y: 0.5}}>
              <ChargeStationMarker />
            </Marker>
          );
        })}
        <Borders />
      </MapView>
    );
  }
}

export default Map;
