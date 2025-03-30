import { Tile } from "tiles/Tile"
import { TrafficApiResult } from "TomTom/TrafficFlow.types"
import { SOURCE_TYPE, ValueSource } from "types"

import { BaseScraperBatched } from "../../BaseScraperBatched"

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
    const res = await fetch(
      `https://api.tomtom.com/traffic/map/4/tile/flow/relative/13/4399/2687.png?thickness=8&tileSize=256&key=*****`
    )

    throw new Error("Not implemented")
  }
}
