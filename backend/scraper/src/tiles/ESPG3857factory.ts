import GeoPoint from "../GeoPoint"
import { Tile, TileFactory } from "./Tile"

export class ESPG3857factory implements TileFactory {
  fromCoordinates(point: GeoPoint, zoom: number): Tile {
    const x = Math.floor(((point.lng + 180) / 360) * Math.pow(2, zoom))
    const y = Math.floor(
      ((1 -
        Math.log(
          Math.tan((point.lat * Math.PI) / 180) +
            1 / Math.cos((point.lat * Math.PI) / 180)
        ) /
          Math.PI) /
        2) *
        Math.pow(2, zoom)
    )
    const northwestPoint = new GeoPoint(
      (x / Math.pow(2, zoom)) * 360 - 180,
      (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / Math.pow(2, zoom)))) *
        180) /
        Math.PI
    )
    const southeastPoint = new GeoPoint(
      ((x + 1) / Math.pow(2, zoom)) * 360 - 180,
      (Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / Math.pow(2, zoom)))) *
        180) /
        Math.PI
    )
    return {
      zoom,
      x: Math.round(x),
      y: Math.round(y),
      northwest: northwestPoint,
      southeast: southeastPoint,
    }
  }

  fromPosition(x: number, y: number, zoom: number): Tile {
    const northwestPoint = new GeoPoint(
      (x / Math.pow(2, zoom)) * 360 - 180,
      (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / Math.pow(2, zoom)))) *
        180) /
        Math.PI
    )
    const southeastPoint = new GeoPoint(
      ((x + 1) / Math.pow(2, zoom)) * 360 - 180,
      (Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / Math.pow(2, zoom)))) *
        180) /
        Math.PI
    )
    return {
      zoom: zoom,
      x: Math.round(x),
      y: Math.round(y),
      northwest: northwestPoint,
      southeast: southeastPoint,
    }
  }
}
