import { DataSource } from "typeorm"

import { RelationalStoreObserver } from "../../RelationalStoreObserver"
import { TrafficFlowSource } from "../Scraping/TrafficFlowScraper"
import { TrafficApiResult } from "../TrafficFlow.types"
import { calculateTrafficFlow } from "../utils/calculateTrafficFlow"
import { TomTomRelationalStore } from "./TomTomRelationalStore"

export default class TomTomDataHandler {
  private relationalStore: TomTomRelationalStore

  constructor(
    dataSource: DataSource,
    relationalObserver: RelationalStoreObserver
  ) {
    this.relationalStore = new TomTomRelationalStore(
      dataSource.manager,
      relationalObserver
    )
  }

  async handleTrafficFlowResponses(
    results: TrafficApiResult[],
    source: TrafficFlowSource
  ) {
    results.forEach((it) => {
      this.handleTrafficFlowResponse(it, source)
    }, this)
  }

  async handleTrafficFlowResponse(
    result: TrafficApiResult,
    source: TrafficFlowSource
  ) {
    const calculated = await calculateTrafficFlow(result)
    this.relationalStore.saveTrafficFlow(
      source.tile,
      calculated.flow,
      calculated.density
    )
  }
}
