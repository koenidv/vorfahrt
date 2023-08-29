import E30plus from "../assets/icons/Marker/chargestate/electric_30_plus.svg";
import E30 from "../assets/icons/Marker/chargestate/electric_30.svg";
import E25 from "../assets/icons/Marker/chargestate/electric_25.svg";
import E20 from "../assets/icons/Marker/chargestate/electric_20.svg";
import E15 from "../assets/icons/Marker/chargestate/electric_15.svg";
import E10 from "../assets/icons/Marker/chargestate/electric_10.svg";
import E5 from "../assets/icons/Marker/chargestate/electric_5.svg";

type VehicleMarkerChargestateProps = {
  isElectric: boolean;
  chargeState: number;
};

const VehicleMarkerChargestate = (props: VehicleMarkerChargestateProps) => {
  if (props.chargeState > 30) {
    return <E30plus style={{position: "absolute"}} width={40} height={40} />;
  } else if (props.chargeState > 25) {
    return <E30 style={{position: "absolute"}} width={40} height={40} />;
  } else if (props.chargeState > 20) {
    return <E25 style={{position: "absolute"}} width={40} height={40} />;
  } else if (props.chargeState > 15) {
    return <E20 style={{position: "absolute"}} width={40} height={40} />;
  } else if (props.chargeState > 10) {
    return <E15 style={{position: "absolute"}} width={40} height={40} />;
  } else if (props.chargeState > 5) {
    return <E10 style={{position: "absolute"}} width={40} height={40} />;
  } else {
    return <E5 style={{position: "absolute"}} width={40} height={40} />;
  }
};

export default VehicleMarkerChargestate;