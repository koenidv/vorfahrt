import {StyleSheet, View} from "react-native";
import {Vehicle} from "../lib/Miles/types";
import ShareIcon from "../assets/icons/share.svg";
import NavigatePedestrianIcon from "../assets/icons/navigate_pedestrian.svg";
import {Text, TouchableRipple} from "react-native-paper";
import {Travelmodes, shareLocation, startNavigation} from "../lib/mapUtils";
import { BottomSheetItem } from "./BottomSheetItem";
import { AppStyles } from "../Map/styles";

interface VehicleBottomSheetItemProps {
  vehicle: Vehicle;
}

const VehicleBottomsheetItem = (props: VehicleBottomSheetItemProps) => {
  return (
    <BottomSheetItem>
      <View style={styles.details}>
        <Text variant="titleSmall">{props.vehicle.licensePlate}</Text>
        <Text variant="bodyMedium">
          {props.vehicle.charge}% ({props.vehicle.range})
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableRipple
          onPress={() =>
            startNavigation(
              props.vehicle.coordinates,
              Travelmodes.WALKING,
              false,
            )
          }
          style={AppStyles.actionbuttoncontainer}>
          <View style={AppStyles.actionbutton}>
            <NavigatePedestrianIcon width={20} height={20} />
            <Text variant="labelMedium">Route</Text>
          </View>
        </TouchableRipple>
        <TouchableRipple
          onPress={() =>
            shareLocation(props.vehicle.coordinates, props.vehicle.licensePlate)
          }
          style={AppStyles.actionbuttoncontainer}>
          <View style={AppStyles.actionbutton}>
            <ShareIcon width={20} height={20} />
            <Text variant="labelMedium">Share</Text>
          </View>
        </TouchableRipple>
        <TouchableRipple
          onPress={() => shareLocation(props.vehicle.coordinates)}
          style={AppStyles.actionbuttoncontainer}>
          <View style={AppStyles.actionbutton}>
            <NavigatePedestrianIcon width={20} height={20} />
            <Text variant="labelMedium">Open Miles</Text>
          </View>
        </TouchableRipple>
      </View>
    </BottomSheetItem>
  );
};

const styles = StyleSheet.create({
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
});

export default VehicleBottomsheetItem;
