import {StyleSheet, View} from "react-native";
import {RefObject} from "react";
import CircularButton from "./CircularButton";
import RelocateIcon from "../assets/icons/relocate.svg";
import PreferencesIcon from "../assets/icons/preferences.svg";
import {MapMethods} from "../Map/Map";
import {useNavigation} from "@react-navigation/native";
import { FetchChargingStationsButton } from "./FetchChargingStationsButton";

export interface ButtonBarProps {
  mapRef: RefObject<MapMethods>;
}

const ButtonBar = (props: ButtonBarProps) => {
  const navigation = useNavigation() as any; // TODO: Fix type

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
      <FetchChargingStationsButton />
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
