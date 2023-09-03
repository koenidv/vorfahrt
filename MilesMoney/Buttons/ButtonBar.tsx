import {StyleSheet, View} from "react-native";
import type Map from "../Map/Map";
import {RefObject, useState} from "react";
import CircularButton from "./CircularButton";
import RelocateIcon from "../assets/icons/relocate.svg";
import ChargeIcon from "../assets/icons/charge.svg";
import LottieView from "lottie-react-native";

export interface ButtonBarProps {
  mapRef: RefObject<Map>;
}

const ButtonBar = (props: ButtonBarProps) => {
  const [stationsLoading, setStationsLoading] = useState(false);

  return (
    <View style={styles.container}>
      <CircularButton
        onPress={() => {
          props.mapRef.current?.gotoSelfLocation();
        }}>
        <RelocateIcon width={35} height={35} />
      </CircularButton>
      <CircularButton
        onPress={async () => {
          setStationsLoading(true);
          await props.mapRef.current?.handleFetchChargeStations();
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
    bottom: 40,
    right: 20,
    gap: 20,
  },
});

export default ButtonBar;
