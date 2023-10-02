import {MapMethods} from "../Map/Map";
import {StyleSheet, Text, View, useColorScheme} from "react-native";
import {Colors} from "react-native/Libraries/NewAppScreen";
import {PropsWithChildren, useRef} from "react";
import {Checkbox, Divider} from "react-native-paper";
import {useFilters} from "../state/filters.state";

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

      <Section title="Step One">
        Edit <Text style={styles.highlight}>App.js</Text> to change this screen
        and then come back to see your edits.
      </Section>
      <Section title="See Your Changes">
        <Text>Moin</Text>
      </Section>
    </View>
  );
};

export default MapScreen;

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): JSX.Element {
  const isDarkMode = useColorScheme() === "dark";
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "600",
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "400",
  },
  highlight: {
    fontWeight: "700",
  },
});
