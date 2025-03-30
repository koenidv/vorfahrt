import clc from "cli-color"
import { SystemController } from "SystemController"

import { BaseScraper } from "./BaseScraper"

export abstract class BaseScraperBatched<
  Task,
  Result,
  SourceType,
> extends BaseScraper<Result, SourceType> {
  private interval: NodeJS.Timeout | undefined
  protected tasks: Task[]

  constructor(
    cyclesMinute: number,
    tasks: Task[],
    scraperId: string,
    systemController: SystemController
  ) {
    super(cyclesMinute, scraperId, systemController)
    this.tasks = tasks
  }

  start(): this {
    if (this.running) {
      this.logWarn("Already running")
      return this
    }
    this.interval = setInterval(
      this.cycleNotifyListeners.bind(this),
      this.cycleTime
    )
    this.running = true
    return this
  }

  stop(): this {
    clearInterval(this.interval)
    this.running = false
    return this
  }

  async executeOnce(): Promise<boolean> {
    return await this.cycleNotifyListeners()
  }

  protected async cycleNotifyListeners() {
    this.tasks.forEach(async (task) => {
      const result = await this.execute(task)
      if (result !== null) {
        this.notifyListeners([result.data], result.source)
      }
    }, this)
    return true
  }

  /*
   * Abstract methods
   */

  /**
   * This method is called for each task every cycle and should return the scraped data.
   * @returns scraped data or null if no data was scraped
   */
  abstract execute(
    task: Task
  ): Promise<{ data: Result; source: SourceType } | null>
}
