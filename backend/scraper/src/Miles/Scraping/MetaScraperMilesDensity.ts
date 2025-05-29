import {
  VehicleLastKnown,
  VehicleMeta,
  VehicleModel,
  VehicleSize,
} from "@vorfahrt/shared"
import { BaseScraperBatched } from "../../BaseScrapeBatched"
import { SystemController } from "../../SystemController"
import { EntityManager } from "typeorm"
import { SOURCE_TYPE, ValueSource } from "../../types"
import { last } from "lodash"

export interface MilesDensitySource extends ValueSource {
  source: SOURCE_TYPE.MILES_DENSITY
  postcode: string
}

enum VehicleSizeClass {
  SMALL = "S",
  MEDIUM = "M",
  LARGE = "L",
  EXTRA_LARGE = "X",
  PREMIUM = "P",
}

export interface MilesDensityResult {
  counts: {
    [value in VehicleSizeClass]: number
  }
}

export class MetaScraperMilesDensity extends BaseScraperBatched<
  string,
  MilesDensityResult,
  MilesDensitySource
> {
  db: EntityManager

  constructor(
    cyclesMinute: number,
    requestDelay: number,
    tasks: string[],
    scraperId: string,
    systemController: SystemController,
    db: EntityManager
  ) {
    super(cyclesMinute, requestDelay, tasks, scraperId, systemController)
    this.db = db
  }

  async execute(
    task: string
  ): Promise<{ data: MilesDensityResult; source: MilesDensitySource } | null> {
    const counts = (await this.countVehiclesBySize(task)).reduce(
      (acc, cur) => {
        if (
          !Object.values(VehicleSizeClass).includes(
            cur.sizeClass as VehicleSizeClass
          )
        ) {
          this.logError(
            `Unknown vehicle size class ${cur.sizeClass} for postcode ${task}`
          )
          return acc
        }
        acc.counts[cur.sizeClass as VehicleSizeClass] = parseInt(cur.count, 10)
        return acc
      },
      { counts: {} } as MilesDensityResult
    )

    return {
      data: counts,
      source: { source: SOURCE_TYPE.MILES_DENSITY, postcode: task },
    }
  }

  private async countVehiclesBySize(
    postcode: string
  ): Promise<{ sizeClass: string; count: string }[]> {
    const vehicleCounts = await this.db
      .createQueryBuilder()
      .select("size.name", "sizeClass")
      .from(VehicleLastKnown, "lastknown")
      .addSelect("COUNT(lastknown.milesId)", "count")
      .innerJoin(VehicleMeta, "meta", "lastknown.milesId = meta.milesId")
      .innerJoin(VehicleModel, "model", "meta.modelId = model.id")
      .innerJoin(VehicleSize, "size", "model.sizeId = size.id")
      .where("lastknown.postcode = :postcode", { postcode })
      .andWhere("lastknown.status = 'DEPLOYED_FOR_RENTAL'")
      .andWhere("lastknown.updated > :timeThreshold", { 
        timeThreshold: new Date(Date.now() - 60 * 60 * 1000) 
      })
      .groupBy("size.name")
      .getRawMany()
    return vehicleCounts
  }
}
