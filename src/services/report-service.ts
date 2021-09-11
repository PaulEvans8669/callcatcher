import path from 'path';
import {Report} from '../interfaces/report';

/**
 * This ReportService singleton lets the library interface with NeDB.
 */
export class ReportService {
    private static instance: ReportService;
    private dbs: {[port: number]: Report} = {};

    /**
     * Private constructor.
     * Follows the singleton design pattern
     * @private
     */
    private constructor() {}

    /**
     * Return the Singleton instance, and instantiates it if needed.
     * Follows the singleton design pattern
     * @return {ReportService}
     */
    public static getInstance(): ReportService {
      return ReportService.instance ||= new ReportService();
    }

    /**
     * This method is reachable after getting the actual
     * instance of the service using the `getInstance()` method.
     * @see Report
     * @param {number} port
     * @return {Report}
     */
    public getReport(port: number): Report {
      return this.dbs[port] ||= new Report({
        filename: path.join('data', port + '.db'),
        autoload: true,
      });
    }
}
