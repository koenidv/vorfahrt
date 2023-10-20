import {StyleSheet, View} from "react-native";

interface BottomSheetContainerProps {
  children?: React.ReactNode;
}

export function BottomSheetContainer(props: BottomSheetContainerProps) {
  return <View style={styles.container}>{props.children}</View>;
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    alignItems: "center",
    position: "absolute",
    flexDirection: "column-reverse",
    bottom: 24,
    left: 8,
    right: 8,
    gap: 8,
  },
});
