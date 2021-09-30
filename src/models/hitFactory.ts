import {IncomingMessage, ServerResponse} from 'http';
import {Hit} from '../interfaces/hit';

/**
 * Hit Factory
 */
export class HitFactory {
  /**
     * Build a new Hit from the server request and response
     * @param {IncomingMessage} req
     * @param {ServerResponse} res
     */
  public static async new(req: IncomingMessage, res: ServerResponse):
        Promise<Hit> {
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
    return hit;
  }
}
