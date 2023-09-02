import mapStyle from "./mapStyle.json";
import {fetchVehicles} from "../lib/Miles/fetchVehicles";
import {
  apiCluster,
  apiPOI,
  apiVehicle,
  VehicleEngine,
  VehicleSize,
} from "../lib/Miles/types";
import _, {set} from "lodash";
import MapView, {
  enableLatestRenderer,
  Marker,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import React from "react";
import GetLocation, {Location} from "react-native-get-location";
import VehicleMarker from "./VehicleMarker";
import ChargeStationMarker from "./ChargeStationMarker";
import Borders from "./Borders";

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
    pos: Location | undefined;
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
      pins: [],
      clusters: [],
      pois: [],
      pos: undefined,
    };
    enableLatestRenderer();

    this.locationInterval = null;
  }

  componentDidMount() {
    this.handleGetLocation().then(pos => {
      this.setState({
        region: {
          ...this.state.region,
          latitude: pos.latitude,
          longitude: pos.longitude,
        },
      });
      this.map.animateCamera({
        center: {
          latitude: pos.latitude,
          longitude: pos.longitude,
        },
      });
      this.handleFetchVehicles();
    });

    //this.locationInterval = setInterval(this.handleGetLocation, 10000);
  }

  componentWillUnmount(): void {
    this.locationInterval && clearInterval(this.locationInterval);
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
        ref={ref => (this.map = ref)}
        style={[{height: "100%", width: "100%"}]}
        provider={PROVIDER_GOOGLE}
        initialRegion={this.state.region}
        onRegionChange={this.onRegionChange}
        showsUserLocation={true}
        showsMyLocationButton={true}
        customMapStyle={mapStyle}>
        {this.state.pins.map((pin, index) => {
          return (
            <Marker
              coordinate={{latitude: pin.Latitude, longitude: pin.Longitude}}
              key={"v_" + index}
              title={pin.LicensePlate}
              description={`${pin.VehicleType}, ${pin.FuelPct}`}
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
