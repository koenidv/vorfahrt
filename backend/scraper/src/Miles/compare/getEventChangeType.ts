// import { MilesVehicleStatus, getInfoFromMilesVehicleStatus } from "@koenidv/abfahrt";
// import { VehicleCurrent } from "../../entity/Miles/VehicleCurrent";
// import { ChangeEvent } from "../../entity/Miles/_ChangeEventEnum";
// import { VehicleChangeProps } from "../insert/insertVehicleChange";

// export function getChangeEventType(current: VehicleCurrent, changes: VehicleChangeProps) {

//     if (changes.status !== undefined) {
//         switch (changes.status) {
//             case MilesVehicleStatus.BOOKED_BY_USER:
//                 return ChangeEvent.booked;
//             case MilesVehicleStatus.USER_IN_RIDE:
//                 if (current.status === MilesVehicleStatus.PAUSED_BY_USER)
//                     return ChangeEvent.ride_resumed;
//                 else
//                     return ChangeEvent.ride_started;
//             case MilesVehicleStatus.PAUSED_BY_USER:
//                 return ChangeEvent.ride_paused;
//         }
//     }

//     if (changes.charging !== undefined) {
//         if (changes.charging) return ChangeEvent.charging_started;
//         else return ChangeEvent.charging_ended;
//     }

//     if (changes.fuelPercent !== undefined && changes.fuelPercent > current.fuelPercent) {
//         return ChangeEvent.ride_refueled;
//     }

//     if (changes.status !== undefined) {
//         if (changes.status === MilesVehicleStatus.DEPLOYED_FOR_RENTAL &&
//             (current.status === MilesVehicleStatus.USER_IN_RIDE ||
//                 current.status === MilesVehicleStatus.PAUSED_BY_USER)) {
//             return ChangeEvent.ride_ended;
//         }

//         const currentInfo = getInfoFromMilesVehicleStatus(current.status);
//         const newInfo = getInfoFromMilesVehicleStatus(changes.status);
//         if (currentInfo.isPublicallyVisible && !newInfo.isPublicallyVisible)
//             return ChangeEvent.undeployed;
//         if (!currentInfo.isPublicallyVisible && newInfo.isPublicallyVisible)
//             return ChangeEvent.deployed;


//         if (changes.status === MilesVehicleStatus.RETIRED)
//             return ChangeEvent.retired;

//     }

//     if (!current) return ChangeEvent.add;
//     return ChangeEvent.change;
// }