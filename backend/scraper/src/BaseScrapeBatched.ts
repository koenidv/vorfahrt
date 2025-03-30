import { BaseScraper } from "./BaseScraper"
import { SystemController } from "./SystemController"
import { RequestStatus } from "./types"

export abstract class BaseScraperBatched<
  Task,
  Result,
  SourceType,
> extends BaseScraper<Result, SourceType> {
  private interval: NodeJS.Timeout | undefined
  private requestDelay: number
  protected tasks: Task[]

  constructor(
    cyclesMinute: number,
    requestDelay: number,
    tasks: Task[],
    scraperId: string,
    systemController: SystemController
  ) {
    super(cyclesMinute, scraperId, systemController)
    this.tasks = tasks
    this.requestDelay = requestDelay
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
    for (const task of this.tasks) {
      try {
        await new Promise((resolve) => setTimeout(resolve, this.requestDelay))
        const result = await this.execute(task)
        if (result !== null) {
          this.notifyListeners([result.data], result.source)
        }
      } catch (e) {
        this.logError(`Error executing task ${task}: ${e}`)
        this.observer.requestExecuted(
          RequestStatus.SCRAPER_ERROR,
          0,
          e?.toString()
        )
      }
    }
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
