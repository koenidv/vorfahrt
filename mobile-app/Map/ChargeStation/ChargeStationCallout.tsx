import {StyleSheet, Text, View} from "react-native";
import {ChargeStation} from "../../lib/Miles/types";
import {Callout} from "react-native-maps";
import { ChargeStationAvailability } from "../../lib/ChargeStationAvailabilityType";

export interface Props {
  station: ChargeStation & Partial<{ "availability": ChargeStationAvailability}>;
}

const ChargeStationCallout = (props: Props) => {
  return (
    <Callout >
      <View style={styles.container}>
        <Text>{props.station.availability?.available}</Text>
      </View>
    </Callout>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "black",
    padding: 4,
  },
});

export default ChargeStationCallout;
