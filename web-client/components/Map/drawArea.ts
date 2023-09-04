/**
 * a rectangular geographic shape.
 *
 * `longitude` and `latitude` define the center.
 *
 * `longitudeDelta` and `latitudeDelta` are the half-width and half-height of the area:
 * an area measuring 4 units * 5 units would have a `longitudeDelta` of 2 units and a `latitudeDelta` of 2.5 units.
 */
export interface Area {
  longitude: number;
  latitude: number;
  longitudeDelta: number;
  latitudeDelta: number;
}

export function drawAreaOnMap(
  map: google.maps.Map,
  area: Area,
  color: string
): google.maps.Polygon {
  const northEast = {
    lat: area.latitude + area.latitudeDelta / 2,
    lng: area.longitude + area.longitudeDelta / 2,
  };
  const southWest = {
    lat: area.latitude - area.latitudeDelta / 2,
    lng: area.longitude - area.longitudeDelta / 2,
  };

  const northWest = { lat: northEast.lat, lng: southWest.lng };
  const southEast = { lat: southWest.lat, lng: northEast.lng };

  const polygonCoords = [northEast, southEast, southWest, northWest, northEast];

  const polygon = new google.maps.Polygon({
    paths: polygonCoords,

    strokeColor: color,
    strokeOpacity: 0.8,
    strokeWeight: 2,

    fillColor: color,
    fillOpacity: 0.35,
  });
  polygon.setMap(map);

  return polygon;
}
