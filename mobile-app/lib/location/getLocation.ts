import Geolocation, {
  GeolocationResponse,
} from "@react-native-community/geolocation";

export const getLocation = async (): Promise<GeolocationResponse> => {
  return new Promise<GeolocationResponse>((resolve, reject) =>
    Geolocation.getCurrentPosition(
      (position) => {
        resolve(position);
      },
      (error) => {
        reject(error);
      },
    )
  );
};
