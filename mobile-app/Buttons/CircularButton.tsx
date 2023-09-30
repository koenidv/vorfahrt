import {Pressable, StyleSheet} from "react-native";

export interface RelocateButtonProps {
  onPress: () => void;
  children: JSX.Element;
}

const RelocateButton = (props: RelocateButtonProps) => {
  return (
    <Pressable style={styles.button} onPress={props.onPress}>
      {props.children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "white",
    borderRadius: 100,
    padding: 10,
    elevation: 12,
    shadowRadius: 10,
    shadowOpacity: 0.5,
    shadowColor: "black",
    shadowOffset: {width: 0, height: 0},
    width: 56,
    height: 56,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default RelocateButton;
