import { Tile } from "tiles/Tile"
import { TrafficApiResult } from "TomTom/TrafficFlow.types"

import { BaseScraperBatched } from "../../BaseScrapeBatched"
import env from "../../env"
import { RequestStatus, SOURCE_TYPE, ValueSource } from "../../types"

export interface TrafficFlowSource extends ValueSource {
  source: SOURCE_TYPE.TRAFFIC_FLOW
  tile: Tile
}

export class TrafficFlowScraper extends BaseScraperBatched<
  Tile,
  TrafficApiResult,
  TrafficFlowSource
> {
  protected override cycleNotifyListeners(): Promise<boolean> {
    this.log(`Requesting traffic flow for ${this.tasks.length} tiles`)
    return super.cycleNotifyListeners()
  }

  async execute(
    task: Tile
  ): Promise<{ data: TrafficApiResult; source: TrafficFlowSource } | null> {
    const startTime = Date.now()
    const res = await fetch(
      `https://api.tomtom.com/traffic/map/4/tile/flow/relative/${task.zoom}/${task.x}/${task.y}.png?thickness=8&tileSize=512&key=${env.tomtom_api_key}`
    )
    this.observer.requestExecuted(
      res.ok ? RequestStatus.OK : RequestStatus.API_ERROR,
      Date.now() - startTime,
      res.statusText
    )
    if (!res.ok) {
      this.logError(
        `Failed to fetch traffic flow for tile ${task}: ${res.status} ${res.text()}`
      )
      return null
    }
    return {
      data: {
        tile: Buffer.from(await res.arrayBuffer()),
      },
      source: { source: SOURCE_TYPE.TRAFFIC_FLOW, tile: task },
    }
  }
}
