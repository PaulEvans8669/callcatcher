import {IncomingHttpHeaders} from 'http';

export interface Hit {
    response: {
        status: {
            code: number;
            message: string;
        }
        datetime?: number;
    };
    request: {
        httpVersion: string;
        url?: string;
        method?: string;
        headers: IncomingHttpHeaders;
        body: object;
        datetime: number;
    };
}
