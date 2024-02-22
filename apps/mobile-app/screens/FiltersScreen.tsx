import {MapMethods} from "../Map/Map";
import {StyleSheet, View} from "react-native";
import {Colors} from "react-native/Libraries/NewAppScreen";
import {useRef} from "react";
import {
  Checkbox,
  Divider,
  MD3Colors,
  SegmentedButtons,
  Text,
} from "react-native-paper";
import {useFilters} from "../state/filters.state";
import {VehicleEngine, VehicleSize} from "../lib/Miles/enums";
import {Slider} from "@miblanchard/react-native-slider";

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
      <Text variant="titleMedium" style={styles.section}>
        Appearance
      </Text>
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

      <Divider style={{marginTop: 8}} />

      <View style={styles.section}>
        <Text variant="titleMedium">Vehicle Type</Text>
        <SegmentedButtons
          multiSelect
          value={filters.engineType as string[]}
          onValueChange={val => filters.setEngineType(val as VehicleEngine[])}
          buttons={[
            {
              value: VehicleEngine.electric,
              label: "Electric",
              showSelectedCheck: true,
            },
            {
              value: VehicleEngine.combustion,
              label: "Combustion",
              showSelectedCheck: true,
            },
          ]}
        />
        <SegmentedButtons
          multiSelect
          value={filters.vehicleSize as string[]}
          onValueChange={val => filters.setVehicleSize(val as VehicleSize[])}
          buttons={[
            {
              value: VehicleSize.small,
              label: "S",
              showSelectedCheck: true,
            },
            {
              value: VehicleSize.medium,
              label: "M",
              showSelectedCheck: true,
            },
            {
              value: VehicleSize.premium,
              label: "P",
              showSelectedCheck: true,
            },
            {
              value: VehicleSize.large,
              label: "L",
              showSelectedCheck: true,
            },
            {
              value: VehicleSize.transporter,
              label: "XL",
              showSelectedCheck: true,
            },
          ]}
        />
      </View>

      <Divider style={{marginTop: 24}} />

      <View style={styles.section}>
        <Text variant="titleMedium">Overcharge (Electric)</Text>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "center",
          }}>
          <View style={{flexGrow: 1}}>
            <Slider
              value={filters.chargeOverflow}
              onValueChange={value => filters.setChargeOverflow(value[0])}
              minimumValue={0}
              maximumValue={8}
              step={1}
              thumbTintColor={MD3Colors.primary70}
              minimumTrackTintColor={MD3Colors.primary70}
              maximumTrackTintColor={MD3Colors.neutral30}
            />
          </View>
          <Text variant="labelLarge" style={{flexShrink: 0}}>+{filters.chargeOverflow}%</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    display: "flex",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 16,
  },
});

export default MapScreen;
