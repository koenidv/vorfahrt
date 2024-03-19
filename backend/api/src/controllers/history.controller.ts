import { HistoryService } from '@/services/history.service';
import { Controller, Get, OnNull } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Container } from 'typedi';

@Controller()
export class HistoryController {
  public path = '/history'
  public history = Container.get(HistoryService);

  @Get('/history/today')
  @OpenAPI({ summary: 'Returns today\'s history points for all vehicles' })
  @OnNull(503)
  async getStatus() {
    return this.history.getCacheMinified();
  }

}
