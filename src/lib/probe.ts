import {IncomingMessage, Server, ServerResponse} from 'http';
import {Hit} from '../interfaces/hit';
import {ReportService} from '../services/report-service';
import {Report} from '../interfaces/report';

/**
 * Probing a server makes the library intercept all of the
 * incoming requests and locally stores them so they can be
 * used during future processes, like reporting.
 * @example
 *  // express example
 *  // create a server
 *  const server = app.listen(8080, () => {
 *      console.log("Listening on port 8080")
 *  });
 *
 *  // probe the server
 *  monitor.probe(server);
 * @param {Server} server
 */
export function probe(server: Server): void {
  const port = (server as any)._connectionKey.split(':').pop();
  const db: Report = ReportService.getInstance().getReport(port);

  // listen all requests comming on the server
  server.on('request', (req: IncomingMessage, res: ServerResponse) => {
    const {statusCode, statusMessage} = res;

    let data = '';

    // build the incomming body parameters
    req.on('data', (chunk) => data += chunk);

    // when the request is fully built,
    // assemble a new Hit and store it using NeDB
    req.on('end', () => {
      const hit: Hit = {
        request: {
          httpVersion: req.httpVersion,
          url: req.url,
          method: req.method,
          headers: req.headers,
          body: JSON.parse(data || '{}'),
        },
        response: {
          status: {
            code: statusCode,
            message: statusMessage,
          },
        },
        datetime: new Date(),
      };
      db.insert(hit);
    });
  });
}
