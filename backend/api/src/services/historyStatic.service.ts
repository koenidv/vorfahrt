import { Service } from 'typedi';
import { HistoryCacheModel } from '@/models/history.model';
import { HistoryPoint } from 'shared/api-types/api.types';
import { createMinifiedHistoryResponse } from '@/utils/minifyHistory';
import fssync, { PathLike, promises as fs } from 'fs';
import { join } from 'path';

/*
 * History output is non-standard csv to save bandwith
 * last update timestamp (seconds)
 * MEASUREMENT_KEY*0, MEASUREMENT_KEY*1, ...
 * STATUSCODE*0, STATUSCODE*1, ...
 * (for each vehicle) milesId, timestamp(seconds), keyId, value (value type depends on key, will be statusId for status)
 * ...
 */

@Service()
export class HistoryStaticService {
  private historyCache: HistoryCacheModel;

  constructor(cache: HistoryCacheModel) {
    this.historyCache = cache;
  }

  public async getStaticFileContent(date: Date): Promise<PathLike> {
    const path = this.getPathForDate(date);
    if (fssync.existsSync(join(path.pathName, path.fileName))) {
      return await fs.readFile(join(path.pathName, path.fileName));
    } else {
      return undefined;
    }
  };

  /**
   * Builds a static history file including all currently cached history points for a given date
   * @param date date to generate the file for, i.e. the just finished and completely cached day
   * @returns path to the generated file
   */
  public async buildStaticFile(date: Date): Promise<PathLike> {
    const allPoints = this.historyCache.getAll();
    const filteredPoints = this.filterPointsByDate(allPoints, date)

    const minifiedHistory = createMinifiedHistoryResponse(filteredPoints, this.historyCache.lastUpdate / 1000);
    const path = this.getPathForDate(date);

    if (!fssync.existsSync(path.pathName)) {
      await fs.mkdir(path.pathName, { recursive: true });
    }
    if (fssync.existsSync(path.fileName)) {
      throw new Error('Generate static history: File already exists for date ' + date);
    }
    console.log('Generate static history: Writing to file', path)
    // todo check if saving this stuff to fs poses a security risk
    await fs.writeFile(join(path.pathName, path.fileName), minifiedHistory);
    return join(path.pathName, path.fileName);
  }

  /**
   * Removes all history points not within the given date from the array
   * @param points array of history points
   * @param date date to filter for
   * @returns number of removed points
   */
  private filterPointsByDate(points: HistoryPoint[], date: Date): HistoryPoint[] {
    const dayStartSeconds = new Date(date).setHours(0, 0, 0, 0) / 1000;
    const dayEndSeconds = new Date(date).setHours(23, 59, 59, 999) / 1000;
    const filteredPoints = points.filter(point => point[1] >= dayStartSeconds && point[1] <= dayEndSeconds);
    if (points.length !== filteredPoints.length) {
      console.warn('Generate static history: Removed ', points.length - filteredPoints.length, 'history points not within date', date);
    }
    return filteredPoints;
  }

  /**
   * Generates a path for a static history file for a given date
   * @param date date to generate the file for
   * @returns path to save the generated file to
   */
  private getPathForDate(date: Date): { pathName: string, fileName: string } {
    const fileName = `history-${date.toISOString().split('T')[0]}.csv`;
    return { pathName: join(__dirname, "static"), fileName: fileName };
  }

}
