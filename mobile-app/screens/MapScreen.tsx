import Map, { MapMethods } from "../Map/Map";
import ButtonBar from "../Buttons/ButtonBar";
import { View } from "react-native";
import {Colors} from "react-native/Libraries/NewAppScreen";
import { useRef } from "react";

const MapScreen = () => {
    const mapRef = useRef<MapMethods>(null);

    return (
        <View
        style={{
          position: "relative",
          height: "100%",
          width: "100%",
          backgroundColor: Colors.black,
        }}>
        <Map ref={mapRef} />
        <ButtonBar mapRef={mapRef} />
      </View>
    )

}

export default MapScreen;