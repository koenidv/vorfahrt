import { Controller, Get } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Container } from 'typedi';
import { VehicleService } from '@services/vehicles.service';

@Controller()
export class VehicleController {
  public path = '/vehicles'
  public vehicles = Container.get(VehicleService);

  @Get('/vehicles/status')
  @OpenAPI({ summary: 'Returns the last known status for all vehicles' })
  async getStatus() {
    return await this.vehicles.getAllMinified();
  }
}
