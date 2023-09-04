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
    elevation: 2,
  },
});

export default RelocateButton;
