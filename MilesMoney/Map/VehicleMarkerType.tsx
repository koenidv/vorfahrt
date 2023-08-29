import VW_ID3 from "../assets/icons/Marker/type/VW_ID3.svg";
import CUPRA from "../assets/icons/Marker/type/CUPRA.svg";

type VehicleMarkerTypeProps = {
  type: string;
};

const VehicleMarkerType = (props: VehicleMarkerTypeProps) => {
  if (props.type === "Cupra Born") {
    return <CUPRA style={{position: "absolute"}} width={40} height={40} />;
  } else {
    return <VW_ID3 style={{position: "absolute"}} width={40} height={40} />;
  }
};

export default VehicleMarkerType;
