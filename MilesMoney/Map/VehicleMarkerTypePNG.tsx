import VW_ID3 from "../assets/icons/Marker/png_test/VW_ID3.png";
import VW_ID4 from "../assets/icons/Marker/png_test/VW_ID4.png";
import VW_POLO from "../assets/icons/Marker/png_test/VW_POLO.png";
import VW_POLO_GP from "../assets/icons/Marker/png_test/VW_POLO_GP.png";
import VW_TAIGO from "../assets/icons/Marker/png_test/VW_TAIGO.png";
import AUDI_A4 from "../assets/icons/Marker/png_test/AUDI_A4.png";
import AUDI_Q2 from "../assets/icons/Marker/png_test/AUDI_Q2.png";
import TESLA_M3 from "../assets/icons/Marker/png_test/TESLA_M3.png";
import TESLA_MY from "../assets/icons/Marker/png_test/TESLA_MY.png";
import CUPRA from "../assets/icons/Marker/png_test/CUPRA.png";
import SEAT from "../assets/icons/Marker/png_test/SEAT.png";
import OPEL from "../assets/icons/Marker/png_test/OPEL.png";
import FORD from "../assets/icons/Marker/png_test/FORD.png";
import {View} from "react-native";
import FastImage from "react-native-fast-image";

type VehicleMarkerTypeProps = {
  type: string;
};

const VehicleMarkerType = (props: VehicleMarkerTypeProps) => {
  switch (props.type) {
    case "VW ID.3":
      return <FastImage source={VW_ID3} style={{position: "absolute", "width": 40, "height": 40}} />;
    case "VW ID.4 Pro":
      return <FastImage source={VW_ID4} style={{position: "absolute", "width": 40, "height": 40}} />;
    case "VW Polo":
      return <FastImage source={VW_POLO} style={{position: "absolute", "width": 40, "height": 40}} />;
    case "VW Polo GP 2022":
      return <FastImage source={VW_POLO_GP} style={{position: "absolute", "width": 40, "height": 40}} />;  
    case "VW Taigo":
    return <FastImage source={VW_TAIGO} style={{position: "absolute", "width": 40, "height": 40}} />;
    case "Audi A4 Avant":
      return <FastImage source={AUDI_A4} style={{position: "absolute", "width": 40, "height": 40}} />;
    case "Audi Q2":
    case "Audi Q2 S-Line":
      return <FastImage source={AUDI_Q2} style={{position: "absolute", "width": 40, "height": 40}} />;
    case "Tesla Model 3":
      return <FastImage source={TESLA_M3} style={{position: "absolute", "width": 40, "height": 40}} />;
    case "Tesla Model Y":
      return <FastImage source={TESLA_MY} style={{position: "absolute", "width": 40, "height": 40}} />;
  }

  if (props.type.includes("Cupra")) {
    return <FastImage source={CUPRA} style={{position: "absolute", "width": 40, "height": 40}} />;
  } else if (props.type.includes("SEAT")) {
    return <FastImage source={SEAT} style={{position: "absolute", "width": 40, "height": 40}} />;
  } else if (props.type.includes("Opel")) {
    return <FastImage source={OPEL} style={{position: "absolute", "width": 40, "height": 40}} />;
  } else if (props.type.includes("Ford")) {
    return <FastImage source={FORD} style={{position: "absolute", "width": 40, "height": 40}} />;
  }

  return <View />;
  // todo generic icon if unknown type
};

export default VehicleMarkerType;
