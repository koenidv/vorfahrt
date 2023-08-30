import {StyleSheet, View} from "react-native";
import ReloadButton from "./ReloadButton";
import RelocateButton from "./LocateButton";

const ButtonBar = () => {
  return (
    <View style={styles.container}>
        <RelocateButton />
        <ReloadButton />
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
