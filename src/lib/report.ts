import {Server} from 'http';
import {Report} from '../models/report';
import {ReportService} from '../services/report-service';

/**
 * After probing a server, the method send a report containing a Hit array
 * The Report interface is the CallCatcher way of interfacing with
 * the data. See The Report interface for more information.
 * @example
 *  // express example
 *  // probe the server
 *  monitor.probe(server);
 *
 *  // send the report on a custom route
 *  app.get('/stats', (req,res) => {
 *     res.status(210).json(monitor.report(server).getAllData())
 * })
 * @see probe
 * @see Report
 * @param {Server} server
 * @return {Report}
 */
export function report(server: Server): Promise<Report> {
  const port = (server as any)._connectionKey.split(':').pop();
  return ReportService.getInstance().getReport(port);
}
