import {IncomingHttpHeaders} from 'http';

export interface Hit {
    response: {
        status: {
            code: number;
            message: string;
        }
    };
    request: {
        httpVersion: string;
        url?: string;
        method?: string;
        headers: IncomingHttpHeaders;
        body: object;
    };
    datetime: Date;
}
