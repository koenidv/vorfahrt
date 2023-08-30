import {Pressable, StyleSheet} from "react-native";
import ReloadIcon from "../assets/icons/reload.svg";

const ReloadButton = () => {
  return (
    <Pressable style={styles.button}>
      <ReloadIcon width={35} height={35} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "white",
    borderRadius: 100,
    padding: 10,
    elevation: 2,
  },
});

export default ReloadButton;
