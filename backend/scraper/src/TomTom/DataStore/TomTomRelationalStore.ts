import { TrafficFlow } from "@vorfahrt/shared"
import { EntityManager } from "typeorm"

import GeoPoint from "../../GeoPoint"
import { RelationalStoreObserver } from "../../RelationalStoreObserver"
import { Tile } from "../../tiles/Tile"

export class TomTomRelationalStore {
  manager: EntityManager
  observer: RelationalStoreObserver

  constructor(manager: EntityManager, observer: RelationalStoreObserver) {
    this.manager = manager
    this.observer = observer
  }

  public saveTrafficFlow(tile: Tile, flow: number, density: number) {
    const trafficFlow = new TrafficFlow()
    trafficFlow.tile = new GeoPoint(tile.x, tile.y).toString()
    trafficFlow.northwest = tile.northwest.toString()
    trafficFlow.southeast = tile.southeast.toString()
    trafficFlow.zoom = tile.zoom
    trafficFlow.flow = flow
    trafficFlow.density = density
    this.manager.save(trafficFlow)
  }
}
