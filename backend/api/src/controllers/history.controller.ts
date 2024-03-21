import { HistoryCacheModel } from '@/models/history.model';
import { HistoryCachingService } from '@/services/historyCaching.service';
import { HistoryServingService } from '@/services/historyServing.service';
import { HistoryStaticService } from '@/services/historyStatic.service';
import { Controller, Get, Head, Header, OnNull, OnUndefined, Param } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Container, Service } from 'typedi';

@Service()
@Controller()
export class HistoryController {
  public path = '/history'
  public cacheModel = Container.get(HistoryCacheModel);
  public caching = Container.get(HistoryCachingService);
  public serving = Container.get(HistoryServingService);
  public static = Container.get(HistoryStaticService);
  private staticFileTimeout: NodeJS.Timeout;

  constructor() {
    this.scheduleBuildingStaticFile();
  }

  scheduleBuildingStaticFile() {
    if (this.staticFileTimeout) {
      throw new Error('Tried to schedule building static file while it was already scheduled');
    }
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 24, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();
    if (msUntilMidnight < 0) {
      throw new Error('Tried to schedule building static file after midnight');
    }

    // The timeout is set to 15 minutes after midnight to ensure all data is available
    this.staticFileTimeout = setTimeout(async () => {
      // todo this should wait until the cache is complete if pagination is not complete
      await this.static.buildStaticFile(new Date());
      this.caching.resetLastRefetchComplete();
      this.cacheModel.clear();
      this.staticFileTimeout = undefined;
      this.scheduleBuildingStaticFile();
    }, msUntilMidnight + 15 * 60 * 1000);
  }

  @Get('/history/today')
  @OpenAPI({ summary: 'Returns today\'s history points for all vehicles. This also includes yesterday\'s points until the static file is generated.' })
  @OnNull(503)
  async getToday() {
    // todo content type csv
    return this.serving.getResponse();
  }

  @Get('/history/:year/:month/:day')
  @OpenAPI({ summary: 'Returns history points for all vehicles for the given day.' })
  @OnUndefined(404)
  @OnNull(503)
  async getHistoryForDay(@Param("year") year: number, @Param("month") month: number, @Param("day") day: number) {
    const dateRequested = new Date(year, month - 1, day);
    const now = new Date();

    // todo if within an hour after midnight, return today's data if yesterday's file is not yet generated
    if (now.getFullYear() === dateRequested.getFullYear() &&
      now.getMonth() === dateRequested.getMonth() &&
      now.getDate() === dateRequested.getDate()) {
      return this.getToday();
    }

    // todo cache headers
    return await this.static.getStaticFileContent(dateRequested);
  }

}
