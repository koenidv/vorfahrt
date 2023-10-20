import {StyleSheet, View} from "react-native";
import {ChargeStation} from "../lib/Miles/types";
import ShareIcon from "../assets/icons/share.svg";
import NavigateVehicleIcon from "../assets/icons/navigate_vehicle.svg";
import {Text, TouchableRipple} from "react-native-paper";
import {Travelmodes, shareLocation, startNavigation} from "../lib/mapUtils";
import {BottomSheetItem} from "./BottomSheetItem";
import {AppStyles} from "../Map/styles";
import {ChargeStationAvailability} from "../lib/ChargeStationAvailabilityType";

interface ChargeStationBottomSheetItemProps {
  station: ChargeStation &
    Partial<{
      availability: ChargeStationAvailability;
    }>;
}

const ChargeStationBottomsheetItem = (
  props: ChargeStationBottomSheetItemProps,
) => {
  return (
    <BottomSheetItem>
      <View style={styles.container}>
        <View style={styles.details}>
          <Text variant="titleSmall">{props.station.name}</Text>
          <Text variant="bodyMedium">
            {props.station.availability?.statusKnown
              ? `${props.station.availability?.available} / ${props.station.availability?.total} available`
              : "Status unknown"}
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableRipple
            onPress={() =>
              startNavigation(
                props.station.coordinates,
                Travelmodes.DRIVING,
                true,
              )
            }
            style={AppStyles.actionbuttoncontainer}>
            <View style={AppStyles.actionbutton}>
              <NavigateVehicleIcon width={20} height={20} />
              <Text variant="labelMedium">Navigate</Text>
            </View>
          </TouchableRipple>
          <TouchableRipple
            onPress={() =>
              shareLocation(props.station.coordinates, props.station.name)
            }
            style={AppStyles.actionbuttoncontainer}>
            <View style={AppStyles.actionbutton}>
              <ShareIcon width={20} height={20} />
            </View>
          </TouchableRipple>
        </View>
      </View>
    </BottomSheetItem>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
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
  },
});

export default ChargeStationBottomsheetItem;
