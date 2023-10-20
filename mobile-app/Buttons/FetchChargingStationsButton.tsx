import {useState} from "react";
import {fetchChargeStationsCurrentRegionUpdateState} from "../lib/fetchRegionUpdateState";
import {useFilters} from "../state/filters.state";
import CircularButton from "./CircularButton";
import LottieView from "lottie-react-native";
import ChargeIcon from "../assets/icons/charge.svg";

export function FetchChargingStationsButton() {
  const [stationsLoading, setStationsLoading] = useState(false);
  const filters = useFilters();

  return (
    <>
      {!filters.alwaysShowChargingStations && (
        <CircularButton
          onPress={async () => {
            setStationsLoading(true);
            await fetchChargeStationsCurrentRegionUpdateState();
            setStationsLoading(false);
          }}>
          {stationsLoading ? (
            <LottieView
              source={require("../assets/icons/loading.json")}
              autoPlay
              loop
              style={{width: 30, height: 30}}
            />
          ) : (
            <ChargeIcon width={30} height={30} />
          )}
        </CircularButton>
      )}
    </>
  );
}
