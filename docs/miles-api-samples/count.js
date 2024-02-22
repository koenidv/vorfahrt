// deno read json
const cars = JSON.parse(await Deno.readTextFile("./samples/trafi_driveby.json"));

// print count of cars.providersWithVehiclesAndGroups.vehicles
console.log(cars.vehicleSharingCategories[0].providersWithVehiclesAndGroups[0].vehicles.length);
