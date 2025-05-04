import {
  applyJsonParseBehaviourToVehicle,
  JsonParseBehaviour,
} from "@koenidv/abfahrt"
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes"

import { RequestStatus, SOURCE_TYPE, ValueSource } from "../../types"
import { BaseMilesScraper } from "../BaseMilesScraper"

export interface MilesHubSource extends ValueSource {
  source: SOURCE_TYPE.HUB
  hubId: string
}

export default class MilesScraperHub extends BaseMilesScraper<
  apiVehicleJsonParsed,
  MilesHubSource
> {
  private hubs: string[] = []
  private currentHubIndex = 0

  setHubs(hubs: string[] | null): this {
    this.hubs = hubs ?? []
    this.observer.measure("hubs", this.hubs.length)
    return this
  }

  start(): this {
    if (this.running) return this
    this.running = true
    this.cycle()
    return this
  }

  stop(): this {
    if (!this.running) return this
    this.running = false
    return this
  }

  async cycle() {
    if (!this.running) return
    const success = await this.executeOnce()
    if (!success) {
      this.logWarn("Hub scraping not successful, retrying in 15 seconds")
      this.retryCycle(1000 * 15)
      return
    }
    await new Promise((resolve) => setTimeout(resolve, this.cycleTime))
    this.cycle()
  }

  async executeOnce(): Promise<boolean> {
    const next = this.selectNextCity()
    if (next === null) return false
    await this.fetch(next)
    return true
  }

  async retryCycle(timeout: number) {
    await new Promise((resolve) => setTimeout(resolve, timeout))
    this.cycle()
  }

  selectNextCity(): string | null {
    if (this.hubs.length === 0) {
      return null
    }
    this.currentHubIndex = (this.currentHubIndex + 1) % this.hubs.length
    return this.hubs[this.currentHubIndex]
  }

  async fetch(hubId: string): Promise<void> {
    const request = this.abfahrt
      .createGetHub(hubId)
      .onRequestRetry((_: any, time: number) =>
        this.observer.requestExecuted(RequestStatus.API_ERROR, time, hubId)
      )
    const result = await request.execute()

    if (!result.Data.vehicles) {
      this.logError(
        `No vehicles found for hub ${hubId}: ${result.Result} ${result.Data.response.Result} ${result.ResponseText} ${result.Data.response.AdditionalInfo}`
      )
      this.observer.requestExecuted(RequestStatus.API_ERROR, 0, hubId)
      return
    }

    const vehicles = result.Data.vehicles.map((vehicle) =>
      applyJsonParseBehaviourToVehicle(vehicle, JsonParseBehaviour.PARSE)
    )

    this.observer.requestExecuted(RequestStatus.OK, result._time, hubId)
    this.observer.measure("hub-vehicles", vehicles.length, hubId)

    this.listeners.forEach((listener) =>
      listener(vehicles, {
        source: SOURCE_TYPE.HUB,
        hubId,
      })
    )
  }
}
