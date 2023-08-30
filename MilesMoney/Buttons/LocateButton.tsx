import {Pressable, StyleSheet} from "react-native";
import RelocateIcon from "../assets/icons/relocate.svg";

const RelocateButton = () => {
  return (
    <Pressable style={styles.button}>
      <RelocateIcon width={35} height={35} />
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

export default RelocateButton;
