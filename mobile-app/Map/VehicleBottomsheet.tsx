import {StyleSheet, View} from "react-native";
import {Vehicle} from "../lib/Miles/types";
import ShareIcon from "../assets/icons/share.svg";
import NavigatePedestrianIcon from "../assets/icons/navigate_pedestrian.svg";
import {Text, TouchableRipple} from "react-native-paper";
import {Travelmodes, shareLocation, startNavigation} from "../lib/mapUtils";

export interface Props {
  vehicle: Vehicle;
}

const VehicleBottomsheet = (props: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.details}>
          <Text variant="titleSmall">{props.vehicle.licensePlate}</Text>
          <Text variant="bodyMedium">
            {props.vehicle.charge}% ({props.vehicle.range})
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableRipple
            onPress={() => startNavigation(props.vehicle.coordinates, Travelmodes.WALKING, false)}
            style={styles.actionbuttoncontainer}>
            <View style={styles.actionbutton}>
              <NavigatePedestrianIcon width={20} height={20} />
              <Text variant="labelMedium">Navigate</Text>
            </View>
          </TouchableRipple>
          <TouchableRipple
            onPress={() => shareLocation(props.vehicle.coordinates, props.vehicle.licensePlate)}
            style={styles.actionbuttoncontainer}>
            <View style={styles.actionbutton}>
              <ShareIcon width={20} height={20} />
              <Text variant="labelMedium">Share</Text>
            </View>
          </TouchableRipple>
          <TouchableRipple
            onPress={() => shareLocation(props.vehicle.coordinates)}
            style={styles.actionbuttoncontainer}>
            <View style={styles.actionbutton}>
              <NavigatePedestrianIcon width={20} height={20} />
              <Text variant="labelMedium">Open Miles</Text>
            </View>
          </TouchableRipple>
        </View>
      </View>
      <View style={styles.arrow} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    alignItems: "center",
    position: "absolute",
    bottom: 24,
    left: 8,
    right: 8,
  },
  content: {
    backgroundColor: "black",
    borderColor: "white",
    borderWidth: 1,
    padding: 16,
    borderRadius: 4,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 12,
    width: "100%",
  },
  details: {
    display: "flex",
    flexDirection: "column",
  },
  actions: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    overflow: "scroll",
  },
  actionbuttoncontainer: {
    backgroundColor: "#1a1a1a",
  },
  actionbutton: {
    height: 36,
    paddingHorizontal: 8,
    gap: 4,
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 4,
    display: "flex",
    flexDirection: "row",
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

export default VehicleBottomsheet;
