import {StyleSheet, View} from "react-native";
import type Map from "../Map/Map";
import {RefObject} from "react";
import CircularButton from "./CircularButton";
import RelocateIcon from "../assets/icons/relocate.svg";
import ReloadIcon from "../assets/icons/reload.svg";

export interface ButtonBarProps {
  mapRef: RefObject<Map>;
}

const ButtonBar = (props: ButtonBarProps) => {
  return (
    <View style={styles.container}>
      <CircularButton onPress={() => {props.mapRef.current?.gotoSelfLocation()}}>
        <RelocateIcon width={35} height={35} />
      </CircularButton>
      <CircularButton onPress={() => {}}>
        <ReloadIcon width={35} height={35} />
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
