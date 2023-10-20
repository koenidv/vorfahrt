import Map, {MapMethods} from "../Map/Map";
import ButtonBar from "../Buttons/ButtonBar";
import {View} from "react-native";
import {Colors} from "react-native/Libraries/NewAppScreen";
import {useRef} from "react";
import {ProgressBar} from "react-native-paper";
import {useAppState} from "../state/app.state";
import VehicleBottomsheetItem from "../BottomSheets/VehicleBottomsheetItem";
import {BottomSheetContainer} from "../BottomSheets/BottomSheetContainer";
import ChargeStationBottomsheetItem from "../BottomSheets/ChargeStationBottomsheetItem";
import {FetchChargingStationsButton} from "../Buttons/FetchChargingStationsButton";

const MapScreen = () => {
  const mapRef = useRef<MapMethods>(null);
  const appState = useAppState();

  return (
    <View
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
        backgroundColor: Colors.black,
      }}>
      <Map ref={mapRef} />
      {appState.selectedVehicle ? (
        <BottomSheetContainer>
          <VehicleBottomsheetItem vehicle={appState.selectedVehicle} />
          {appState.selectedChargeStation && (
            <ChargeStationBottomsheetItem
              station={appState.selectedChargeStation}
            />
          )}
          <View style={{alignSelf: "flex-end", paddingBottom: 8, paddingHorizontal: 12}}>
            <FetchChargingStationsButton />
          </View>
        </BottomSheetContainer>
      ) : (
        <ButtonBar mapRef={mapRef} />
      )}
      {appState.fetching && (
        <View style={{position: "absolute", top: 0, left: 0, right: 0}}>
          <ProgressBar indeterminate={true} color="white" />
        </View>
      )}
    </View>
  );
};

export default MapScreen;
