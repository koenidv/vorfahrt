import {LatLng, Polyline} from "react-native-maps";
import CityAreas from "../assets/cityAreasFlat.json";

export interface BordersProps {
  displayNoParking: boolean;
}
const Borders = (props: BordersProps) => {
  return (
    <>
      {CityAreas.map((area, index) => {
        if (area.layerType === "NO_PARKING_AREA" && !props.displayNoParking)
          return null;
        return (
          <Polyline
            key={index}
            strokeColor={
              area.layerType === "CITY_SERVICE_AREA" ? "#aaa" : "#faa"
            }
            fillColor={area.layerType === "NO_PARKING_AREA" ? "#ffaaaa80" : ""}
            coordinates={area.coordinates as LatLng[]}
          />
        );
      })}
    </>
  );
};

export default Borders;
