import {mapStyle} from "./mapStyle";
import {fetchVehicles} from "../lib/Miles/fetchVehicles";
import {apiCluster, apiVehicle, VehicleEngine} from "../lib/Miles/types";
import _, {debounce} from "lodash";
import MapView, {
  enableLatestRenderer,
  Marker,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import React from "react";

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

class Map extends React.Component<{}, {region: Region; pins: apiVehicle[], clusters: apiCluster[]}> {
  constructor(props: any) {
    super(props);
    this.state = {
      region: {
        latitude: 52.5277672,
        longitude: 13.3767757,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
      pins: [],
      clusters: []
    };
    enableLatestRenderer();
  }

  componentDidMount() {
    this.handleFetchVehicles();
  }

  handleFetchVehicles = async () => {
    const res = await fetchVehicles({
      deviceKey: "d15231c7925b4517",
      latitude: this.state.region.latitude,
      longitude: this.state.region.longitude,
      latitudeDelta: this.state.region.latitudeDelta,
      longitudeDelta: this.state.region.longitudeDelta,
      zoomLevel: 20,
      userLatitude: 52.5277672,
      userLongitude: 13.3767757,
      engine: [VehicleEngine.electric],
      maxFuel: 30
    });
    this.setState({pins: this.joinPins(this.state.pins, res.Data.vehicles)});
    this.setState({clusters: res.Data.clusters})
    console.log(res.Data.clusters);
  };

  debounceFetchVehicles = debounce(this.handleFetchVehicles, 1000);

  joinPins = (current: apiVehicle[], incoming: apiVehicle[]): apiVehicle[] => {
    // todo inefficient temp stuff
    return _.unionBy(current, incoming, (v) => v.LicensePlate);
  }

  onRegionChange = (region: any) => {
    this.setState({region: region});
    console.log(this.state.region);
  };

  render() {
    return (
      <MapView
        style={[{height: "100%", width: "100%"}]}
        provider={PROVIDER_GOOGLE}
        initialRegion={this.state.region}
        onRegionChange={this.onRegionChange}
        customMapStyle={mapStyle}>
        {this.state.pins.map((pin, index) => {
          return (
            <Marker
              key={index}
              coordinate={{latitude: pin.Latitude, longitude: pin.Longitude}}
              title={pin.LicensePlate}
              description={pin.VehicleType}
              pinColor="indigo"
            />
          );
        })}
        {this.state.clusters.map((cluster, index) => {
          return (
            <Marker
              key={index}
              coordinate={{latitude: cluster.Latitude, longitude: cluster.Longitude}}
              title={cluster.nUnits.toString()}
              description={cluster.idCluster.toString()}
              pinColor="yellow"
            />
          );
        })}
      </MapView>
    );
  }
}

export default Map;
