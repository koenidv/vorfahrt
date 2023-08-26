import {mapStyle} from "./mapStyle";
import {fetchVehicles} from "../lib/Miles/fetchVehicles";
import {
  apiCluster,
  apiPOI,
  apiVehicle,
  VehicleEngine,
  VehicleSize,
} from "../lib/Miles/types";
import _ from "lodash";
import MapView, {
  enableLatestRenderer,
  Marker,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import React from "react";
import GetLocation, {Location} from "react-native-get-location";

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

class Map extends React.Component<
  {},
  {
    region: Region;
    pins: apiVehicle[];
    clusters: apiCluster[];
    pois: apiPOI[];
    pos: Location;
  }
> {
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
      clusters: [],
      pois: [],
      pos: {
        latitude: 52.5277672,
        longitude: 13.3767757,
        altitude: 0,
        accuracy: 0,
        speed: 0,
        time: 0,
      },
    };
    enableLatestRenderer();
  }

  componentDidMount() {
    this.handleFetchVehicles();
    this.handleGetLocation().then(pos => {
      this.setState({
        region: {
          latitude: pos.latitude,
          longitude: pos.longitude,
          latitudeDelta: this.state.region.latitudeDelta,
          longitudeDelta: this.state.region.longitudeDelta,
        },
      });
    });
  }

  handleGetLocation = async (): Promise<Location> => {
    const pos = await GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    });
    this.setState({pos: pos});
    return pos;
  };

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
      size: [VehicleSize.small, VehicleSize.medium],
      maxFuel: 30,
      showChargingStations: true,
    });
    this.setState({pins: this.joinPins(this.state.pins, res.Data.vehicles)});
    this.setState({clusters: res.Data.clusters});
    this.setState({pois: this.joinPOIs(this.state.pois, res.Data.pois)});
  };

  debounceFetchVehicles = _.debounce(this.handleFetchVehicles, 1000);

  joinPins = (current: apiVehicle[], incoming: apiVehicle[]): apiVehicle[] => {
    // todo inefficient temp stuff
    return _.unionBy(current, incoming, v => v.LicensePlate);
  };
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
        style={[{height: "100%", width: "100%"}]}
        provider={PROVIDER_GOOGLE}
        initialRegion={this.state.region}
        onRegionChange={this.onRegionChange}
        customMapStyle={mapStyle}>
          <Marker
            coordinate={{latitude: this.state.pos.latitude, longitude: this.state.pos.longitude}}
            title="you"
            pinColor="orange"
          />
        {this.state.pins.map((pin, index) => {
          return (
            <Marker
              key={index}
              coordinate={{latitude: pin.Latitude, longitude: pin.Longitude}}
              title={pin.LicensePlate}
              description={`${pin.VehicleType}, ${pin.FuelPct}`}
              pinColor="indigo"
            />
          );
        })}
        {this.state.clusters.map((cluster, index) => {
          return (
            <Marker
              key={index}
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
              key={index}
              coordinate={{
                latitude: poi.Latitude,
                longitude: poi.Longitude,
              }}
              title={poi.Station_Name}
              description={poi.Station_Address}
              pinColor="teal"
            />
          );
        })}
      </MapView>
    );
  }
}

export default Map;
