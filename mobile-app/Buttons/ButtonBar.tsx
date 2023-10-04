import {StyleSheet, View} from "react-native";
import {RefObject, useState} from "react";
import CircularButton from "./CircularButton";
import RelocateIcon from "../assets/icons/relocate.svg";
import PreferencesIcon from "../assets/icons/preferences.svg";
import ChargeIcon from "../assets/icons/charge.svg";
import LottieView from "lottie-react-native";
import {fetchChargeStationsCurrentRegionUpdateState} from "../lib/fetchRegionUpdateState";
import {MapMethods} from "../Map/Map";
import {useVehicles} from "../state/vehicles.state";
import {useNavigation} from "@react-navigation/native";
import {RootStackParamList} from "../App";
import {useFilters} from "../state/filters.state";

export interface ButtonBarProps {
  mapRef: RefObject<MapMethods>;
}

const ButtonBar = (props: ButtonBarProps) => {
  const [stationsLoading, setStationsLoading] = useState(false);
  const navigation = useNavigation() as any; // TODO: Fix type
  const filters = useFilters();

  return (
    <View style={styles.container}>
      <CircularButton
        onPress={() => {
          navigation.navigate("Filters");
        }}>
        <PreferencesIcon width={30} height={30} />
      </CircularButton>
      <CircularButton
        onPress={() => {
          props.mapRef.current?.gotoSelfLocation();
        }}>
        <RelocateIcon width={30} height={30} />
      </CircularButton>
      {!filters.alwaysShowChargingStations && (
        <CircularButton
          onPress={async () => {
            setStationsLoading(true);
            await fetchChargeStationsCurrentRegionUpdateState();
            setStationsLoading(false);
          }}>
          {stationsLoading ? (
            <LottieView
              source={require("../assets/icons/loading.json")}
              autoPlay
              loop
              style={{width: 30, height: 30}}
            />
          ) : (
            <ChargeIcon width={30} height={30} />
          )}
        </CircularButton>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 80,
    right: 20,
    gap: 20,
  },
});

export default ButtonBar;
