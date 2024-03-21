import { HistoryCachingService } from '@/services/historyCaching.service';
import { HistoryServingService } from '@/services/historyServing.service';
import { HistoryStaticService } from '@/services/historyStatic.service';
import { Controller, Get, OnNull } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Container } from 'typedi';

@Controller()
export class HistoryController {
  public path = '/history'
  public caching = Container.get(HistoryCachingService);
  public serving = Container.get(HistoryServingService);
  public static = Container.get(HistoryStaticService);

  @Get('/history/today')
  @OpenAPI({ summary: 'Returns today\'s history points for all vehicles' })
  @OnNull(503)
  async getStatus() {
    return this.serving.getResponse();
  }

}
