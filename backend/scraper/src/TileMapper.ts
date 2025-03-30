import GeoPoint from "./GeoPoint"

export type Tile = {
  zoom: number
  tileX: number
  tileY: number
  northwest: GeoPoint
  southeast: GeoPoint
}

export enum TileAlgorithm {
  ESPG3857 = "ESPG3857",
}

export class TileMapper {
  northwest: GeoPoint
  southeast: GeoPoint
  zoom: number

  constructor(northwest: GeoPoint, southeast: GeoPoint, zoom: number) {
    if (northwest.lng > southeast.lng || northwest.lat < southeast.lat) {
      throw new Error("Invalid area bound: northwest must be north and west of southeast")
    }
    this.northwest = northwest
    this.southeast = southeast
    this.zoom = zoom
  }

  getTiles(algorithm: TileAlgorithm): Tile[] {
    switch (algorithm) {
      case TileAlgorithm.ESPG3857:
        return this.getTilesESPG3857()
      default:
        throw new Error("Unknown algorithm")
    }
  }

  private getTilesESPG3857(): Tile[] {
    const northwestTile = this.getESPG3857byCoordinates(this.northwest, this.zoom)
    const southeastTile = this.getESPG3857byCoordinates(this.southeast, this.zoom)
    const tiles = []

    for (let y = northwestTile.tileY; y <= southeastTile.tileY; y++) {
      for (let x = northwestTile.tileX; x <= southeastTile.tileX; x++) {
        tiles.push(this.getESP3857byPosition(x, y, this.zoom))
      }
    }
    return tiles
  }

  private getESPG3857byCoordinates(point: GeoPoint, zoom: number): Tile {
    const x = Math.floor((point.lng + 180) / 360 * Math.pow(2, zoom))
    const y = Math.floor(
      (1 - Math.log(Math.tan(point.lat * Math.PI / 180) + 1 / Math.cos(point.lat * Math.PI / 180)) / Math.PI) /
        2 *
        Math.pow(2, zoom)
    )
    const northwestPoint = new GeoPoint(
      (x / Math.pow(2, zoom) * 360 - 180),
      (Math.atan(Math.sinh(Math.PI * (1 - 2 * y / Math.pow(2, zoom)))) * 180) / Math.PI
    )
    const southeastPoint = new GeoPoint(
      ((x + 1) / Math.pow(2, zoom) * 360 - 180),
      (Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 1) / Math.pow(2, zoom)))) * 180) / Math.PI
    )
    return { zoom, tileX: x, tileY: y, northwest: northwestPoint, southeast: southeastPoint }
  }

  private getESP3857byPosition(x: number, y: number, zoom: number): Tile {
    const northwestPoint = new GeoPoint(
      (x / Math.pow(2, zoom) * 360 - 180),
      (Math.atan(Math.sinh(Math.PI * (1 - 2 * y / Math.pow(2, zoom)))) * 180) / Math.PI
    )
    const southeastPoint = new GeoPoint(
      ((x + 1) / Math.pow(2, zoom) * 360 - 180),
      (Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 1) / Math.pow(2, zoom)))) * 180) / Math.PI
    )
    return { zoom: zoom, tileX: x, tileY: y, northwest: northwestPoint, southeast: southeastPoint }
  }



}