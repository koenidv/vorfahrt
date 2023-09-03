import {StyleSheet, Text, View} from "react-native";
import {ChargeStation} from "../../lib/Miles/types";
import {Callout} from "react-native-maps";

export interface Props {
  station: ChargeStation;
}

const ChargeStationCallout = (props: Props) => {
  return (
    <Callout >
      <View style={styles.container}>
        <Text>{props.station.name}</Text>
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
