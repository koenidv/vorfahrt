import mapStyle from "./mapStyle.json";
import {apiCluster, apiPOI} from "../lib/Miles/apiTypes";
import MapView, {
  enableLatestRenderer,
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import React from "react";
import {Location} from "react-native-get-location";
import VehicleMarker from "./VehicleMarker";
import ChargeStationMarker from "./ChargeStationMarker";
import Borders from "./Borders";
import {useUpdateVehicles, useVehicles} from "../state/vehicles.state";
import _ from "lodash";
import {parseVehicles} from "../lib/Miles/parseVehiclesResponse";
import {fetchVehiclesForRegion} from "../lib/Miles/fetchVehiclesForRegion";
import Geolocation, {
  GeolocationResponse,
} from "@react-native-community/geolocation";

class Map extends React.Component<
  {},
  {
    region: Region;
    clusters: apiCluster[];
    pois: apiPOI[];
    pos: GeolocationResponse | undefined;
  }
> {
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
    this.getLocation().then(pos => {
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
    });

    //this.locationInterval = setInterval(this.handleGetLocation, 10000);
  }

  componentWillUnmount(): void {
    this.locationInterval && clearInterval(this.locationInterval);
  }

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
    const data = await fetchVehiclesForRegion({region: this.state.region});
    // todo fetch vehicles & pois in seperate queries (should be a lot faster)
    useUpdateVehicles(parseVehicles(data));
    this.setState({clusters: data.Data.clusters});
    this.setState({pois: this.joinPOIs(this.state.pois, data.Data.pois)});
  };

  debounceFetchVehicles = _.debounce(this.handleFetchVehicles, 1000);

  joinPOIs = (current: apiPOI[], incoming: apiPOI[]): apiPOI[] => {
    // todo inefficient temp stuff
    return _.unionBy(current, incoming, p => p.idCityLayer);
  };

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
        showsUserLocation={true}
        showsMyLocationButton={true}
        customMapStyle={mapStyle}>
        {useVehicles.getState().vehicles.map((pin, index) => {
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
        {this.state.pois.map((poi, index) => {
          return (
            <Marker
              key={"p_" + index}
              coordinate={{
                latitude: poi.Latitude,
                longitude: poi.Longitude,
              }}
              title={poi.Station_Name}
              description={poi.idCityLayer.toString()}
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
