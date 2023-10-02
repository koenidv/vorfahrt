import {MapMethods} from "../Map/Map";
import {StyleSheet, Text, View, useColorScheme} from "react-native";
import {Colors} from "react-native/Libraries/NewAppScreen";
import {PropsWithChildren, useRef} from "react";
import {Checkbox, Divider, SegmentedButtons} from "react-native-paper";
import {useFilters} from "../state/filters.state";
import { VehicleEngine } from "../lib/Miles/enums";

const MapScreen = () => {
  const mapRef = useRef<MapMethods>(null);
  const filters = useFilters();

  return (
    <View
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
        backgroundColor: Colors.darker,
      }}>
      <Checkbox.Item
        label="Always fetch charging stations"
        position="leading"
        style={{justifyContent: "flex-start"}}
        labelStyle={{textAlign: "left", flexGrow: 0}}
        status={filters.alwaysShowChargingStations ? "checked" : "unchecked"}
        onPress={() => filters.toggleAlwaysShowChargingStations()}
      />
      <Checkbox.Item
        label="Show no parking zones"
        position="leading"
        style={{justifyContent: "flex-start"}}
        labelStyle={{textAlign: "left", flexGrow: 0}}
        status={filters.showNoParkingZones ? "checked" : "unchecked"}
        onPress={() => filters.toggleShowNoParkingZones()}
      />

      <Divider />

      <Text>Vehicle Type</Text>
      <SegmentedButtons
        multiSelect
        value={filters.engineType as string[]}
        onValueChange={val => filters.setEngineType(val as VehicleEngine[])}
        buttons={[
          {
            value: 'E',
            label: 'Electric',
            showSelectedCheck: true,
          },
          {
            value: 'C',
            label: 'Combustion',
            showSelectedCheck: true,
          },
        ]}
      />


    </View>
  );
};

export default MapScreen;