import {StyleSheet, View} from "react-native";

interface BottomSheetItemProps {
  children: React.ReactNode;
}

export function BottomSheetItem(props: BottomSheetItemProps) {
  return <View style={styles.content}>{props.children}</View>;
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: "black",
    borderColor: "white",
    borderWidth: 1,
    padding: 16,
    borderRadius: 4,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 12,
    width: "100%",
  },
});
