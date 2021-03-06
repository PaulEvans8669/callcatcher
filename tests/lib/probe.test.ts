import {createServer, get, Server} from 'http';
import {probe, report, Report, Probe} from '../../src';

describe('Probe', () => {
  /**
   * Send a dummy get request to a local server
   */
  function sendGet() {
    get(`http://localhost:${PORT}/`, (res) => {
      const {statusCode} = res;
      const contentType = res.headers['content-type']!;

      let error;
      // Any 2xx status code signals a successful response but
      // here we're only checking for 200.
      if (statusCode !== 200) {
        error = new Error('Request Failed.\n' +
            `Status Code: ${statusCode}`);
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error('Invalid content-type.\n' +
            `Expected application/json but received ${contentType}`);
      }
      if (error) {
        res.resume();
        throw error;
      }
    }).on('error', (e) => {
      throw e;
    });
  }

  const PORT = 8080;
  let server: Server;
  let rep: Report;
  let prob: Probe;


  beforeAll(async () => {
    server = createServer((req, res) => {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({
        data: 'Global response',
      }));
    });
    server.listen(PORT);
  });

  beforeEach(async () => {
    rep = await report(server);
  });

  afterAll((done) => {
    server && server.close(done);
  });

  it('should probe a server without throwing', () => {
    prob = probe(server, (err, docs)=>{
      if (err) {
        console.log(err);
      } else {
        console.log(docs);
      }
    });
  });

  it('should add a new hit to the report', (done) => {
    const initalHitCount = rep.getAllData().length;
    // @ts-ignore
    rep.on('hit', () => {
      expect(rep.getAllData().length).toBe(initalHitCount + 1);
      done();
    });
    // send a request
    sendGet();
  });

  it('should stop listening', () => {
    const initListenersCount = server.listenerCount('request');
    prob.stop();
    expect(server.listenerCount('request')).toBe(initListenersCount - 1);
  });
});
