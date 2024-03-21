import { HistoryCacheModel } from '@/models/history.model';
import { HistoryCachingService } from '@/services/historyCaching.service';
import { HistoryServingService } from '@/services/historyServing.service';
import { HistoryStaticService } from '@/services/historyStatic.service';
import { Controller, Get, OnNull } from 'routing-controllers';
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
  async getStatus() {
    return this.serving.getResponse();
  }

}
