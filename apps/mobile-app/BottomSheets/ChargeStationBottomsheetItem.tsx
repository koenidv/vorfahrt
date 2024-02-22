import {StyleSheet, View} from "react-native";
import {ChargeStation, Vehicle} from "../lib/Miles/types";
import ShareIcon from "../assets/icons/share.svg";
import NavigateVehicleIcon from "../assets/icons/navigate_vehicle.svg";
import NextIcon from "../assets/icons/next.svg";
import {Menu, Text, TouchableRipple} from "react-native-paper";
import {shareLocation, startNavigation} from "../lib/mapUtils";
import {BottomSheetItem} from "./BottomSheetItem";
import {AppStyles} from "../Map/styles";
import {ChargeStationAvailability} from "../lib/ChargeStationAvailabilityType";
import {useAppState} from "../state/app.state";
import {Travelmodes} from "../lib/Maps/directions";
import type {Route} from "../lib/Maps/directions";
import {useState} from "react";
import {useUserdata} from "../state/userdata.state";
import {useChargeStations} from "../state/chargestations.state";

interface ChargeStationBottomSheetItemProps {
  station: ChargeStation &
    Partial<{
      availability: ChargeStationAvailability;
    }>;
}

const AvailabilityTag = ({
  availability,
}: {
  availability: ChargeStationAvailability;
}) => {
  if (!availability.statusKnown)
    return (
      <View style={styles.tagGrey}>
        <Text variant="labelMedium">Unknown</Text>
      </View>
    );
  if (availability.available === 0)
    return (
      <View style={styles.tagGrey}>
        <Text variant="labelMedium">
          {availability.available} / {availability.total}
        </Text>
      </View>
    );
  return (
    <View style={styles.tagGreen}>
      <Text variant="labelMedium" style={{color: "black"}}>
        {availability.available} / {availability.total}
      </Text>
    </View>
  );
};

const RouteInfo = ({route}: {route: Route}) => {
  return (
    <Text variant="bodyMedium">
      {route.duration_display} ({route.distance_display})
    </Text>
  );
};

const PriceTag = ({route, vehicle}: {route: Route; vehicle: Vehicle}) => {
  const km = Math.ceil(route.distance / 1000);
  const kmPrice = ["S", "M"].includes(vehicle.size) ? 0.98 : 1.29;
  let price = 1 + km * kmPrice;
  if (vehicle.isElectric) price -= 10;
  else price -= 5;

  if (price <= 0) {
    return (
      <View style={styles.tagGreen}>
        <Text variant="labelMedium" style={{color: "black"}}>
          +{Math.abs(price).toFixed(2)}€
        </Text>
      </View>
    );
  } else {
    return (
      <View style={styles.tagGrey}>
        <Text variant="labelMedium">{price.toFixed(2)}€</Text>
      </View>
    );
  }
};

const ChargeStationBottomsheetItem = (
  props: ChargeStationBottomSheetItemProps,
) => {
  const appState = useAppState();
  const chargeStations = useChargeStations();
  const userdataState = useUserdata();
  const [overflowVisible, setOverflowVisible] = useState(false);

  return (
    <BottomSheetItem>
      <View style={styles.container}>
        <View style={styles.details}>
          <View style={styles.row}>
            <Text variant="titleSmall">{props.station.name}</Text>
            {appState.drivingDirections && props.station.availability && (
              <AvailabilityTag availability={props.station.availability} />
            )}
          </View>
          <View style={styles.row}>
            {!appState.drivingDirections && props.station.availability && (
              <AvailabilityTag availability={props.station.availability} />
            )}
            {appState.drivingDirections && (
              <RouteInfo route={appState.drivingDirections} />
            )}
            {appState.drivingDirections && appState.selectedVehicle && (
              <PriceTag
                route={appState.drivingDirections}
                vehicle={appState.selectedVehicle}
              />
            )}
          </View>
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
          <Menu
            visible={overflowVisible}
            onDismiss={() => setOverflowVisible(false)}
            anchor={
              <TouchableRipple
                onPress={() => setOverflowVisible(true)}
                style={AppStyles.actionbuttoncontainer}>
                <View style={AppStyles.actionbutton}>
                  <NextIcon width={20} height={20} />
                </View>
              </TouchableRipple>
            }>
            <Menu.Item
              onPress={() => {
                setOverflowVisible(false);
                userdataState.addHiddenChargeStation(props.station);
                appState.selectedChargeStation = undefined;
                chargeStations.removeStation(props.station.milesId);
              }}
              title="Hide this station"
            />
          </Menu>
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
  row: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    alignItems: "baseline",
  },
  details: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  actions: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
  },
  tagGreen: {
    backgroundColor: "#37DFA3",
    color: "black",
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  tagGrey: {
    backgroundColor: "#444",
    color: "white",
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
});

export default ChargeStationBottomsheetItem;
