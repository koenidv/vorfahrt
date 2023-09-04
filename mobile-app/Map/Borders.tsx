import {LatLng, Polyline} from "react-native-maps";
import CityAreas from "../assets/cityAreasFlat.json";

const Borders = () => {
  return (
    <>
      {CityAreas.map((area, index) => {
        return (
          <Polyline
            key={index}
            strokeColor={
              area.layerType === "CITY_SERVICE_AREA" ? "#aaa" : "#faa"
            }
            fillColor={
              area.layerType === "NO_PARKING_AREA" ? "#ffaaaa80" : ""
            }
            coordinates={area.coordinates as LatLng[]}
          />
        );
      })}
    </>
  );
};

export default Borders;
