import {IncomingMessage, Server, ServerResponse} from 'http';
import {Hit} from '../interfaces/hit';
import {ReportService} from '../services/report-service';

/**
 * @callback insertionCallback
 * @param {(Error | null)} error
 * @param {Hit[]} documents
 * @return {void}
 */
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
 * @param {insertionCallback} insertCb
 */
export function probe(
    server: Server,
    insertCb?: (err: (Error | null), documents: Hit[]) => void)
    : void {
  // listen all requests comming on the server
  server.on('request', async (req: IncomingMessage, res: ServerResponse) => {
    const startTime = new Date().getTime();

    const resFinishPromise = new Promise<number>((resolve) => {
      res.on('finish', () => {
        // resolve the promise and return the current time epoch (millis)
        resolve(new Date().getTime());
      });
    });

    let data = '';
    // build the incomming body parameters
    req.on('data', (chunk) => data += chunk);

    // when the request is fully built,
    // assemble a new Hit and store it using NeDB
    // the data is fully populated here
    const reqEndPromise = new Promise<Hit>((resolve) => {
      req.on('end', () => {
        // build a new hit
        const hit: Hit = {
          request: {
            httpVersion: req.httpVersion,
            url: req.url,
            method: req.method,
            headers: req.headers,
            body: JSON.parse(data || '{}'),
            datetime: startTime,
          },
          response: {
            status: {
              code: res.statusCode,
              message: res.statusMessage,
            },
          },
        };
        // resolve the promise and return the new built hit in it
        resolve(hit);
      });
    });

    const hit = await Promise.resolve<Hit>(reqEndPromise);
    hit.response.datetime = await Promise.resolve<number>(resFinishPromise);

    // insert hit in database
    const port = (server as any)._connectionKey.split(':').pop();
    ReportService.getInstance().getReport(port).then((db) => {
      db.insert(hit, insertCb);
    });
  });
}
