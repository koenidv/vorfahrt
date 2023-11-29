import {StyleSheet, View} from "react-native";
import {
  Button,
  Modal,
  Portal,
  Text,
  TextInput,
  TouchableRipple,
} from "react-native-paper";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {AppStyles} from "./styles";
import PlusIcon from "../assets/icons/plus.svg";
import {useUserdata} from "../state/userdata.state";
import {useRegion} from "../state/region.state";
import {Region} from "react-native-maps";
import {RefObject, useState} from "react";
import {MapMethods} from "./Map";

export interface SavedLocationProps {
  mapRef: RefObject<MapMethods>;
}

const SavedLocations = (props: SavedLocationProps) => {
  const insets = useSafeAreaInsets();
  const userData = useUserdata();
  const region = useRegion();
  const [modalVisible, setModalVisible] = useState(false);
  const [nameValue, setNameValue] = useState("");

  function addCurrentLocation(name: string) {
    userData.addSavedLocation({
      ...region.current,
      name: name,
    });
  }

  function gotoLocation(location: Region) {
    props.mapRef.current?.gotoRegion(location);
  }

  return (
    <>
      <View
        style={[
          styles.container,
          {
            top: insets.top + 16,
            left: insets.left,
            right: insets.right,
          },
        ]}>
        {userData.savedLocations.map(location => (
          <TouchableRipple
            key={location.latitude + location.longitude}
            onPress={() => gotoLocation(location)}
            onLongPress={() => userData.removeSavedLocation(location)}
            style={AppStyles.actionbuttoncontainer}>
            <View style={AppStyles.actionbutton}>
              <Text variant="labelMedium">{location.name}</Text>
            </View>
          </TouchableRipple>
        ))}

        <TouchableRipple
          onPress={() => setModalVisible(true)}
          style={AppStyles.actionbuttoncontainer}>
          <View style={AppStyles.actionbutton}>
            <PlusIcon width={14} height={14} />
            <Text variant="labelMedium">Location</Text>
          </View>
        </TouchableRipple>
      </View>

      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)}>
          <View style={styles.modal}>
            <TextInput
              autoFocus={true}
              label="Name"
              value={nameValue}
              onChangeText={setNameValue}
            />
            <Button
              onPress={() => {
                addCurrentLocation(nameValue);
                setModalVisible(false);
                setNameValue("");
              }}
              disabled={nameValue.trim() === ""}>
              Add Location
            </Button>
          </View>
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    display: "flex",
    flexDirection: "row",
    overflow: "scroll",
    paddingLeft: 16,
    paddingRight: 16,
    gap: 8,
  },
  modal: {
    backgroundColor: "#000000",
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
});

export default SavedLocations;
