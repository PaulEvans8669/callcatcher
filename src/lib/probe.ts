import {Server} from 'http';
import {Hit} from '../interfaces/hit';
import {Probe} from '../models/probe';

/**
 * @callback onHitCallback
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
 * @param {onHitCallback} onHitCallback
 * @return {Probe}
 */
export function probe(
    server: Server,
    onHitCallback?: (err: (Error | null), documents: Hit[]) => void)
    : Probe {
  return new Probe(server, onHitCallback);
}
