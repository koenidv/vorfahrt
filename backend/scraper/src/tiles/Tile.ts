import GeoPoint from "../GeoPoint"

export type Tile = {
  zoom: number
  x: number
  y: number
  northwest: GeoPoint
  southeast: GeoPoint
}

export interface TileFactory {
  fromCoordinates(point: GeoPoint, zoom: number): Tile
  fromPosition(x: number, y: number, zoom: number): Tile
}