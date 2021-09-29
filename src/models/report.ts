import Nedb from 'nedb';
import {Hit} from '../interfaces/hit';

/**
 * Proprietary interface with NeDB<Hit>
 * @see {@link https://github.com/louischatriot/nedb|Nedb}
 */
export class Report extends Nedb<Hit> {
  /**
   * constructor.
   * @param {string | Nedb.DataStoreOptions} [pathOrOptions] - NeDB options
   */
  constructor(pathOrOptions?: string | Nedb.DataStoreOptions) {
    super(pathOrOptions);
  }


  /**
   * @callback insertionCallback
   * @param {(Error | null)} error
   * @param {Hit[]} documents
   * @return {void}
   */
  /**
   * Insert a new hit (array) in the database.
   * Emits a 'hit' event containing the inserted data.
   * Emits an 'error' event if an error occurred during insertion.
   * @param {T} newDocs
   * @param {insertionCallback} cb
   */
  public insert<T extends Hit>(
      newDocs: T | T[],
      cb?: (err: (Error | null), documents: T[]) => void) {
    super.insert(
        Array.isArray(newDocs) ? newDocs : [newDocs],
        (err, documents) => {
          if (err) {
            this.emit('error', err);
          } else {
            this.emit('hit', documents);
          }
          if (cb) {
            cb(err, documents);
          }
        });
  }
}
