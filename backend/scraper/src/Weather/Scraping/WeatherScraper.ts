import { BaseScraperBatched } from "../../BaseScrapeBatched"
import GeoPoint from "../../GeoPoint"
import { Tile } from "../../tiles/Tile"
import { RequestStatus, SOURCE_TYPE, ValueSource } from "../../types"
import { WeatherApiResult } from "../Weather.types"

export interface WeatherSource extends ValueSource {
  source: SOURCE_TYPE.WEATHER
  tile: Tile
}

export class WeatherScraper extends BaseScraperBatched<
  Tile,
  WeatherApiResult,
  WeatherSource
> {
  protected override cycleNotifyListeners(): Promise<boolean> {
    this.log(`Requesting weather for ${this.tasks.length} tiles`)
    return super.cycleNotifyListeners()
  }

  async execute(
    task: Tile
  ): Promise<{ data: WeatherApiResult; source: WeatherSource } | null> {
    const startTime = Date.now()
    const midpoint = new GeoPoint(
      (task.northwest.lng + task.southeast.lng) / 2,
      (task.northwest.lat + task.southeast.lat) / 2
    )
    const res = await fetch(
      `https://wttr.in/${midpoint.lat},${midpoint.lng}?format=j2`
    )
    this.observer.requestExecuted(
      res.ok ? RequestStatus.OK : RequestStatus.API_ERROR,
      Date.now() - startTime,
      res.statusText
    )
    if (!res.ok) {
      this.logError(
        `Failed to fetch weather for tile ${task.x},${task.y}: ${res.status} ${res.text()}`
      )
      this.observer.requestExecuted(
        RequestStatus.API_ERROR,
        Date.now() - startTime,
        res.statusText
      )
      return null
    }
    return {
      data: await res.json(),
      source: { source: SOURCE_TYPE.WEATHER, tile: task },
    }
  }
}
