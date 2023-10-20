import {Image, StyleSheet, View} from "react-native";
import {Vehicle} from "../lib/Miles/types";
import ShareIcon from "../assets/icons/share.svg";
import NavigatePedestrianIcon from "../assets/icons/navigate_pedestrian.svg";
import MilesMIcon from "../assets/icons/miles_M.svg";
import {Text, TouchableRipple} from "react-native-paper";
import {Travelmodes, openMilesApp, shareLocation, startNavigation} from "../lib/mapUtils";
import {BottomSheetItem} from "./BottomSheetItem";
import {AppStyles} from "../Map/styles";

interface VehicleBottomSheetItemProps {
  vehicle: Vehicle;
}

const VehicleBottomsheetItem = (props: VehicleBottomSheetItemProps) => {
  return (
    <BottomSheetItem>
      <View style={styles.row}>
        <View style={styles.details}>
          <Text variant="titleSmall">{props.vehicle.licensePlate}</Text>
          <Text variant="bodyMedium">
            {props.vehicle.charge}% ({props.vehicle.range})
          </Text>
        </View>
        <Image
          source={{uri: props.vehicle.image}}
          style={{height: "100%", width: 100, resizeMode: "contain"}}
        />
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
          onPress={() => openMilesApp()}
          style={AppStyles.actionbuttoncontainer}>
          <View style={AppStyles.actionbutton}>
            <MilesMIcon width={20} height={20} />
            <Text variant="labelMedium">Open Miles</Text>
          </View>
        </TouchableRipple>
      </View>
    </BottomSheetItem>
  );
};

const styles = StyleSheet.create({
  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
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
    overflow: "scroll",
  },
});

export default VehicleBottomsheetItem;
