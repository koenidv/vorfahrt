import VW_ID3 from "../assets/icons/Marker/type/VW_ID3.svg";
import VW_ID4 from "../assets/icons/Marker/type/VW_ID4.svg";
import VW_POLO from "../assets/icons/Marker/type/VW_POLO.svg";
import VW_POLO_GP from "../assets/icons/Marker/type/VW_POLO_GP.svg";
import VW_TAIGO from "../assets/icons/Marker/type/VW_TAIGO.svg";
import AUDI_A4 from "../assets/icons/Marker/type/AUDI_A4.svg";
import AUDI_Q2 from "../assets/icons/Marker/type/AUDI_Q2.svg";
import TESLA_M3 from "../assets/icons/Marker/type/TESLA_M3.svg";
import TESLA_MY from "../assets/icons/Marker/type/TESLA_MY.svg";
import CUPRA from "../assets/icons/Marker/type/CUPRA.svg";
import SEAT from "../assets/icons/Marker/type/SEAT.svg";
import OPEL from "../assets/icons/Marker/type/OPEL.svg";
import FORD from "../assets/icons/Marker/type/FORD.svg";
import GenericCar from "../assets/icons/Marker/type/generic.svg";
import GenericTruck from "../assets/icons/Marker/type/generic_truck.svg";

type VehicleMarkerTypeProps = {
  type: string;
};

const VehicleMarkerType = (props: VehicleMarkerTypeProps) => {
  switch (props.type) {
    case "VW ID.3":
      return <VW_ID3 style={{position: "absolute"}} width={40} height={40} />;
    case "VW ID.4 Pro":
      return <VW_ID4 style={{position: "absolute"}} width={40} height={40} />;
    case "VW Polo":
      return <VW_POLO style={{position: "absolute"}} width={40} height={40} />;
    case "VW Polo GP 2022":
      return (
        <VW_POLO_GP style={{position: "absolute"}} width={40} height={40} />
      );
    case "VW Taigo":
      return <VW_TAIGO style={{position: "absolute"}} width={40} height={40} />;
    case "Audi A4 Avant":
      return <AUDI_A4 style={{position: "absolute"}} width={40} height={40} />;
    case "Audi Q2":
    case "Audi Q2 S line":
      return <AUDI_Q2 style={{position: "absolute"}} width={40} height={40} />;
    case "Tesla Model 3":
      return <TESLA_M3 style={{position: "absolute"}} width={40} height={40} />;
    case "Tesla Model Y":
      return <TESLA_MY style={{position: "absolute"}} width={40} height={40} />;
  }

  if (props.type.includes("Cupra")) {
    return <CUPRA style={{position: "absolute"}} width={40} height={40} />;
  } else if (props.type.includes("SEAT")) {
    return <SEAT style={{position: "absolute"}} width={40} height={40} />;
  } else if (props.type.includes("Opel")) {
    return <OPEL style={{position: "absolute"}} width={40} height={40} />;
  } else if (props.type.includes("Ford")) {
    return <FORD style={{position: "absolute"}} width={40} height={40} />;
  } else if(props.type.includes("Sprinter") || props.type.includes("Crafter")) {
    return <GenericTruck style={{position: "absolute"}} width={40} height={40} />;
  }

  return <GenericCar style={{position: "absolute"}} width={40} height={40} />;
};

export default VehicleMarkerType;
