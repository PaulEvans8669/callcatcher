import {IncomingMessage, Server, ServerResponse} from 'http';
import {Hit} from '../interfaces/hit';
import {ReportService} from '../services/report-service';
import {AddressInfo} from 'net';
import {HitFactory} from './hitFactory';

/**
 * The Probe class represents the probing instance bound to a server
 */
export class Probe {
    private readonly server: Server;
    // eslint-disable-next-line max-len
    private readonly onHitCallback?: ((err: (Error | null), documents: Hit[]) => void);

    /**
     * Returns the port of the bound server
     * @private
     * @return {number}
     */
    private get port(): number {
      if (this.server.address() !== null) {
        return (this.server.address() as AddressInfo)!.port;
      } else {
        throw new Error('couldn\'t get server port');
      }
    }

    private readonly listenerFunc;
    /**
     * @callback onHitCallback
     * @param {(Error | null)} error
     * @param {Hit[]} documents
     * @return {void}
     */
    /**
     *
     * @param {Server} server
     * @param {onHitCallback} onHitCallback
     */
    constructor(
        server: Server,
        onHitCallback?: (err: (Error | null), documents: Hit[]) => void,
    ) {
      this.server = server;
      this.onHitCallback = onHitCallback;
      this.listenerFunc = this.listenServer.bind(this);
      this.resume();
    }

    /**
     * Internal method for listening activity on a server
     * @private
     * @param {IncomingMessage} req
     * @param {ServerResponse} res
     */
    private async listenServer(
        req: IncomingMessage,
        res: ServerResponse,
    ): Promise<void> {
      const hit = await HitFactory.new(req, res);
      // insert hit in database
      ReportService.getInstance().getReport(this.port).then((db) => {
        db.insert(hit, this.onHitCallback);
      });
    }

    /**
     * Stop listening activity on a server
     */
    public stop(): void {
      this.server.removeListener('request', this.listenerFunc);
    }

    /**
     * Resume listening on a server
     */
    public resume(): void {
      this.server.on('request', this.listenerFunc);
    }
}
