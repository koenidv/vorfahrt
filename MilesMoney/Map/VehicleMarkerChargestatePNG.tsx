import E30plus from "../assets/icons/Marker/png_test/electric_30_plus.png";
import E30 from "../assets/icons/Marker/png_test/electric_30.png";
import E25 from "../assets/icons/Marker/png_test/electric_25.png";
import E20 from "../assets/icons/Marker/png_test/electric_20.png";
import E15 from "../assets/icons/Marker/png_test/electric_15.png";
import E10 from "../assets/icons/Marker/png_test/electric_10.png";
import E5 from "../assets/icons/Marker/png_test/electric_5.png";
import FastImage from "react-native-fast-image";

type VehicleMarkerChargestateProps = {
  isElectric: boolean;
  chargeState: number;
};

const VehicleMarkerChargestate = (props: VehicleMarkerChargestateProps) => {
  if (props.chargeState > 30) {
    return <FastImage source={E30plus} style={{position: "absolute", "width": 40, "height": 40}} />;
  } else if (props.chargeState > 25) {
    return <FastImage source={E30} style={{position: "absolute", "width": 40, "height": 40}} />;
  } else if (props.chargeState > 20) {
    return <FastImage source={E25} style={{position: "absolute", "width": 40, "height": 40}} />;
  } else if (props.chargeState > 15) {
    return <FastImage source={E20} style={{position: "absolute", "width": 40, "height": 40}} />;
  } else if (props.chargeState > 10) {
    return <FastImage source={E15} style={{position: "absolute", "width": 40, "height": 40}} />;
  } else if (props.chargeState > 5) {
    return <FastImage source={E10} style={{position: "absolute", "width": 40, "height": 40}} />;
  } else {
    return <FastImage source={E5} style={{position: "absolute", "width": 40, "height": 40}} />;
  }
};

export default VehicleMarkerChargestate;