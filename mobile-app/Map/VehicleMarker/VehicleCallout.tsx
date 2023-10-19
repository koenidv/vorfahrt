import {StyleSheet, View} from "react-native";
import {ChargeStation, Vehicle} from "../../lib/Miles/types";
import {Callout} from "react-native-maps";
import ShareIcon from "../../assets/icons/share.svg";
import NavigatePedestrianIcon from "../../assets/icons/navigate_pedestrian.svg";
import {Text, TouchableRipple} from "react-native-paper";
import { shareLocation } from "../../lib/MapUtils";

export interface Props {
  vehicle: Vehicle;
}

const VehicleCallout = (props: Props) => {
  return (
    <Callout tooltip={true}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.details}>
            <Text variant="labelMedium">{props.vehicle.licensePlate}</Text>
            <Text variant="bodySmall">{props.vehicle.charge}%</Text>
          </View>
          <View style={styles.actions}>
            <TouchableRipple onPress={() => shareLocation(props.vehicle.coordinates)}>
              <View style={styles.actionbutton}>
                <ShareIcon width={20} height={20} />
              </View>
            </TouchableRipple>
            <View style={styles.actionbutton}>
              <NavigatePedestrianIcon width={20} height={20} />
            </View>
          </View>
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
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  details: {
    display: "flex",
    flexDirection: "column",
  },
  actions: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
  },
  actionbutton: {
    width: 36,
    height: 36,
    backgroundColor: "#1a1a1a",
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 4,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
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
