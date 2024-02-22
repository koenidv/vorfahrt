import {StyleSheet, View} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface BottomSheetContainerProps {
  children?: React.ReactNode;
}

export function BottomSheetContainer(props: BottomSheetContainerProps) {
  const insets = useSafeAreaInsets();
  return (
    <View 
      style={{
        ...styles.container,
        bottom: insets.bottom + 8,
        left: insets.left + 8,
        right: insets.right + 8,
      }}>
        {props.children}
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    alignItems: "center",
    position: "absolute",
    flexDirection: "column-reverse",
    justifyContent: "flex-end",
    gap: 8,
  },
});
