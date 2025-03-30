import GeoPoint from "../GeoPoint"
import { ESPG3857factory } from "./ESPG3857factory"
import { Tile, TileFactory } from "./Tile"

export enum TileAlgorithm {
  ESPG3857 = "ESPG3857",
}

export class TileMapper {
  northwest: GeoPoint
  southeast: GeoPoint
  zoom: number

  constructor(northwest: GeoPoint, southeast: GeoPoint, zoom: number) {
    if (northwest.lng > southeast.lng || northwest.lat < southeast.lat) {
      throw new Error(
        "Invalid area bound: northwest must be north and west of southeast"
      )
    }
    this.northwest = northwest
    this.southeast = southeast
    this.zoom = zoom
  }

  getTiles(algorithm: TileAlgorithm): Tile[] {
    switch (algorithm) {
      case TileAlgorithm.ESPG3857:
        return this.generateTileList(new ESPG3857factory())
      default:
        throw new Error("Unknown algorithm")
    }
  }

  private generateTileList(factory: TileFactory): Tile[] {
    const northwestTile = factory.fromCoordinates(this.northwest, this.zoom)
    const southeastTile = factory.fromCoordinates(this.southeast, this.zoom)
    const tiles = []

    for (let y = northwestTile.y; y <= southeastTile.y; y++) {
      for (let x = northwestTile.x; x <= southeastTile.x; x++) {
        tiles.push(factory.fromPosition(x, y, this.zoom))
      }
    }
    return tiles
  }
}
