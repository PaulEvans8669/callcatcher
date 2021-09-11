import Nedb from 'nedb';
import {Hit} from './hit';

/**
 * Proprietary interface with NeDB<Hit>
 * @see {@link https://github.com/louischatriot/nedb|Nedb}
 */
export class Report extends Nedb<Hit> {}
