import General_VW from "./vehicle_types/General_VW.svg";
import VW_ID_3 from "./vehicle_types/VW ID.3.svg";
import VW_ID_4_Pro from "./vehicle_types/VW ID.4 Pro.svg";
import VW_Polo from "./vehicle_types/VW Polo.svg";
import VW_Crafter_Alt from "./vehicle_types/VW_Crafter_Alt.svg";
import VW_Taigo from "./vehicle_types/VW Taigo.svg";
import VW_Polo_GP_2022 from "./vehicle_types/VW Polo GP 2022.svg";
import VW_T6_Alt from "./vehicle_types/VW_T6_Alt.svg";
import VW_Crafter_Automatic_Alt from "./vehicle_types/VW_Crafter_Automatic_Alt.svg";
import General_Tesla from "./vehicle_types/General_Tesla.svg";
import Tesla_Model_3 from "./vehicle_types/Tesla Model 3.svg";
import Tesla_Model_Y from "./vehicle_types/Tesla Model Y.svg";
import Cupra_Born from "./vehicle_types/Cupra Born.svg";
import General_Audi from "./vehicle_types/General_Audi.svg";
import Audi_A3 from "./vehicle_types/Audi A3.svg";
import Audi_A4_Avant from "./vehicle_types/Audi A4 Avant.svg";
import Audi_Q2 from "./vehicle_types/Audi Q2.svg";
import Audi_Q2_S_line from "./vehicle_types/Audi Q2 S line.svg";
import General_Opel from "./vehicle_types/General_Opel.svg";
import Opel_Corsa_Elegance from "./vehicle_types/Opel Corsa Elegance.svg";
import Opel_Corsa_GS from "./vehicle_types/Opel Corsa GS.svg";
import General_Ford from "./vehicle_types/General_Ford.svg";
import Ford_Fiesta from "./vehicle_types/Ford Fiesta.svg";
import SEAT_Leon from "./vehicle_types/SEAT Leon.svg";
import VW_T6 from "./vehicle_types/VW T6.svg";
import Opel_Vivaro from "./vehicle_types/Opel Vivaro.svg";
import Ford_Transit from "./vehicle_types/Ford Transit.svg";
import Ford_Transit_Custom_9_Seater from "./vehicle_types/Ford Transit Custom 9 Seater.svg";
import VW_Crafter_Automatic from "./vehicle_types/VW Crafter Automatic.svg";
import VW_Crafter from "./vehicle_types/VW Crafter.svg";
import Mercedes_Sprinter from "./vehicle_types/Mercedes Sprinter.svg";
import Generic_XL from "./vehicle_types/Generic_XL.svg";
import Generic_L from "./vehicle_types/Generic_L.svg";
import Generic_S from "./vehicle_types/Generic_S.svg";
import Generic_M from "./vehicle_types/Generic_M.svg";
import Fake_Test_Car from "./vehicle_types/Fake Test Car.svg";
import Invers_Test_Kit from "./vehicle_types/Invers Test Kit.svg";
import Fake_EV_Test_Car from "./vehicle_types/Fake EV Test Car.svg";
import Fake_XL_Test_Sprinter from "./vehicle_types/Fake XL Test Sprinter.svg";
import discounted from "./modifiers/discounted.svg";
import charging from "./modifiers/charging.svg";
import fuel_30 from "./chargestates_combustion/fuel_30.svg";
import fuel_25 from "./chargestates_combustion/fuel_25.svg";
import fuel_20 from "./chargestates_combustion/fuel_20.svg";
import fuel_15 from "./chargestates_combustion/fuel_15.svg";
import fuel_10 from "./chargestates_combustion/fuel_10.svg";
import fuel_5 from "./chargestates_combustion/fuel_5.svg";
import electric_30 from "./chargestates_electric/electric_30.svg";
import electric_25 from "./chargestates_electric/electric_25.svg";
import electric_20 from "./chargestates_electric/electric_20.svg";
import electric_15 from "./chargestates_electric/electric_15.svg";
import electric_10 from "./chargestates_electric/electric_10.svg";
import electric_5 from "./chargestates_electric/electric_5.svg";
import electric_31 from "./chargestates_electric/electric_31.svg";
import electric_32 from "./chargestates_electric/electric_32.svg";
import electric_33 from "./chargestates_electric/electric_33.svg";
import electric_34 from "./chargestates_electric/electric_34.svg";
import electric_35 from "./chargestates_electric/electric_35.svg";
import in_ride from "./vehicle_status/in_ride.svg";
import in_ops from "./vehicle_status/in_ops.svg";
import deployed_for_rental from "./vehicle_status/deployed_for_rental.svg";
import deployed_for_internal_use from "./vehicle_status/deployed_for_internal_use.svg";
import in_logistics from "./vehicle_status/in_logistics.svg";
import black_full from "./backgrounds/black_full.svg";
import black_without_border from "./backgrounds/black_without_border.svg";
import white_full from "./backgrounds/white_full.svg";
import white_without_border from "./backgrounds/white_without_border.svg";

const VehicleMarker = {

  "vehicle_types": {

    "General_VW": General_VW,
    "VW ID.3": VW_ID_3,
    "VW ID.4 Pro": VW_ID_4_Pro,
    "VW Polo": VW_Polo,
    "VW_Crafter_Alt": VW_Crafter_Alt,
    "VW Taigo": VW_Taigo,
    "VW Polo GP 2022": VW_Polo_GP_2022,
    "VW_T6_Alt": VW_T6_Alt,
    "VW_Crafter_Automatic_Alt": VW_Crafter_Automatic_Alt,
    "General_Tesla": General_Tesla,
    "Tesla Model 3": Tesla_Model_3,
    "Tesla Model Y": Tesla_Model_Y,
    "Cupra Born": Cupra_Born,
    "General_Audi": General_Audi,
    "Audi A3": Audi_A3,
    "Audi A4 Avant": Audi_A4_Avant,
    "Audi Q2": Audi_Q2,
    "Audi Q2 S line": Audi_Q2_S_line,
    "General_Opel": General_Opel,
    "Opel Corsa Elegance": Opel_Corsa_Elegance,
    "Opel Corsa GS": Opel_Corsa_GS,
    "General_Ford": General_Ford,
    "Ford Fiesta": Ford_Fiesta,
    "SEAT Leon": SEAT_Leon,
    "VW T6": VW_T6,
    "Opel Vivaro": Opel_Vivaro,
    "Ford Transit": Ford_Transit,
    "Ford Transit Custom 9 Seater": Ford_Transit_Custom_9_Seater,
    "VW Crafter Automatic": VW_Crafter_Automatic,
    "VW Crafter": VW_Crafter,
    "Mercedes Sprinter": Mercedes_Sprinter,
    "Generic_XL": Generic_XL,
    "Generic_L": Generic_L,
    "Generic_S": Generic_S,
    "Generic_M": Generic_M,
    "Fake Test Car": Fake_Test_Car,
    "Invers Test Kit": Invers_Test_Kit,
    "Fake EV Test Car": Fake_EV_Test_Car,
    "Fake XL Test Sprinter": Fake_XL_Test_Sprinter,
  },
  "modifiers": {

    "discounted": discounted,
    "charging": charging,
  },
  "chargestates_combustion": {

    "fuel_30": fuel_30,
    "fuel_25": fuel_25,
    "fuel_20": fuel_20,
    "fuel_15": fuel_15,
    "fuel_10": fuel_10,
    "fuel_5": fuel_5,
  },
  "chargestates_electric": {

    "electric_30": electric_30,
    "electric_25": electric_25,
    "electric_20": electric_20,
    "electric_15": electric_15,
    "electric_10": electric_10,
    "electric_5": electric_5,
    "electric_31": electric_31,
    "electric_32": electric_32,
    "electric_33": electric_33,
    "electric_34": electric_34,
    "electric_35": electric_35,
  },
  "vehicle_status": {

    "in_ride": in_ride,
    "in_ops": in_ops,
    "deployed_for_rental": deployed_for_rental,
    "deployed_for_internal_use": deployed_for_internal_use,
    "in_logistics": in_logistics,
  },
  "backgrounds": {

    "black_full": black_full,
    "black_without_border": black_without_border,
    "white_full": white_full,
    "white_without_border": white_without_border,
  },
};
export default VehicleMarker;