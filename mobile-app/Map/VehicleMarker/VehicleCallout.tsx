import {StyleSheet, Text, View} from "react-native";
import {ChargeStation, Vehicle} from "../../lib/Miles/types";
import {Callout} from "react-native-maps";

export interface Props {
  vehicle: Vehicle;
}

const VehicleCallout = (props: Props) => {
  return (
    <Callout tooltip={true}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text>{props.vehicle.licensePlate}</Text>
        </View>
        <View style={styles.arrow} />
      </View>
    </Callout>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  content: {
    backgroundColor: "black",
    padding: 8,
    borderRadius: 4,
  },
  arrow: {
    marginStart: -5,
    borderTopWidth: 5,
    borderBottomWidth: 0,
    borderStartWidth: 5,
    borderEndWidth: 5,
    borderTopColor: "black",
    borderBottomColor: "transparent",
    borderStartColor: "transparent",
    borderEndColor: "transparent",
  },
});

export default VehicleCallout;
