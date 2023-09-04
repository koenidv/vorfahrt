import {StyleSheet, View} from "react-native";
import {RefObject, useState} from "react";
import CircularButton from "./CircularButton";
import RelocateIcon from "../assets/icons/relocate.svg";
import ReloadIcon from "../assets/icons/reload.svg";
import ChargeIcon from "../assets/icons/charge.svg";
import LottieView from "lottie-react-native";
import {fetchChargeStationsCurrentRegionUpdateState} from "../lib/fetchRegionUpdateState";
import {useRegion} from "../state/region.state";
import { MapMethods } from "../Map/Map";
import { useChargeStations } from "../state/chargestations.state";
import { useVehicles } from "../state/vehicles.state";

export interface ButtonBarProps {
  mapRef: RefObject<MapMethods>;
}

const ButtonBar = (props: ButtonBarProps) => {
  const [stationsLoading, setStationsLoading] = useState(false);

  return (
    <View style={styles.container}>
      <CircularButton
        onPress={() => {
          useVehicles.getState().clearVehicles();
          props.mapRef.current?.handleFetchVehicles();
        }}>
        <ReloadIcon width={35} height={35} />
      </CircularButton>
      <CircularButton
        onPress={() => {
          props.mapRef.current?.gotoSelfLocation();
        }}>
        <RelocateIcon width={35} height={35} />
      </CircularButton>
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
            style={{width: 35, height: 35}}
          />
        ) : (
          <ChargeIcon width={35} height={35} />
        )}
      </CircularButton>
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
