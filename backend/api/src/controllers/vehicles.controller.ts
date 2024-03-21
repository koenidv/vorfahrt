import { Controller, Get, Header, OnNull } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Container } from 'typedi';
import { VehicleService } from '@services/vehicles.service';

@Controller()
export class VehicleController {
  public path = '/vehicles'
  public vehicles = Container.get(VehicleService);

  @Get('/vehicles/status')
  @OpenAPI({ summary: 'Returns the last known status for all vehicles' })
  @OnNull(503)
  @Header('Cache-Control', 'public, max-age=60')
  @Header('Content-Type', 'text/csv')
  async getStatus() {
    return this.vehicles.getStatusesMinified();
  }

}
