import http from 'http';
import https from 'https';
import path from 'path';
import fs from 'fs';
import mime from 'mime';
import { fileURLToPath } from 'url';
import { JsonDB, Config } from 'node-json-db';
import Router from './components/router';
import { isResponse, uuid } from './components/utils';
import { Event, Response } from './components/types';
import { Params } from './components/interfaces';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = (() => {
    try {
        return https.createServer({
            key: fs.readFileSync(path.join(__dirname, process.env.SSL_KEY || '')),
            cert: fs.readFileSync(path.join(__dirname, process.env.SSL_CERT || '')),
        });
    } catch {
        return http.createServer();
    }
})();

const port = process.env.PORT || 3000;
const allowed = (process.env.ALLOWED_HOSTS || '').split(',').map((host) => host.trim());

const datapath = path.join(__dirname, 'data', 'base.json');
const db = new JsonDB(new Config(datapath, true, true, '/'));
const router = new Router();

router.get('/api', (request, response) => {
    response.writeHead(200);
    response.end(JSON.stringify({
        status: 'ready',
        reason: 'success',
        code: 200,
        message: 'OK',
        details: 'Server is ready to accept requests',
    }));
});

router.get('/api/events', async (request, response) => {
    try {
        const events = await db.getObject<Event[]>("/events");
        const result = JSON.stringify(events);

        response.setHeader('Content-Length', result.length);
        response.setHeader('Expires', new Date().toUTCString());
        response.writeHead(200);
        response.end(result);
    }

    catch (exception) {
        response.writeHead(200);
        response.end('[]');
    }
});

router.post('/api/events', async (request, response) => {
    try {
        if (!request.headers['content-type']?.startsWith('application/json')) {
            throw {
                status: 'rejected',
                reason: 'error',
                code: 400,
                message: 'Bad request',
                details: 'Content-Type must be application/json',
            }
        }
        const params: Params = await readRequestJSON(request);
        const events = await db.getObject<Event[]>("/events");
        const start = new Date(params.startStr);
        const end = new Date(params.endStr);
        
        const result = JSON.stringify(events.filter(event => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);

            return (eventStart >= start && eventStart <= end) || (eventEnd >= start && eventEnd <= end);
        }));

        response.setHeader('Content-Length', result.length);
        response.setHeader('Expires', new Date().toUTCString());
        response.writeHead(200);
        response.end(result);
    }

    catch (exception) {
        response.writeHead(200);
        response.end('[]');
    }
});

router.get('/api/event/:id', async (request, response, params) => {
    try {
        const index = await db.getIndex('/events', params.id);

        if (index < 0) {
            throw {};
        }

        const event = await db.getData(`/events[${index}]`);
        const result = JSON.stringify(event);

        response.setHeader('Content-Length', result.length);
        response.setHeader('Expires', new Date().toUTCString());
        response.writeHead(200);
        response.end(result);
    }
    
    catch (exception) {
        handleException(request, response, {
            status: 'rejected',
            reason: 'error',
            code: 404,
            message: 'Not found',
            details: `User with id '${params.id}' not found`,
        });
    }
});

router.post('/api/event', async (request, response, params) => {
    try {
        if (!request.headers['content-type']?.startsWith('application/json')) {
            throw {
                status: 'rejected',
                reason: 'error',
                code: 400,
                message: 'Bad request',
                details: 'Content-Type must be application/json',
            }
        }
        const id = uuid();
        const json: Params = await readRequestJSON(request);
        
        await db.push("/events[]", {
            ...json,
            id,
        });

        const result = JSON.stringify({
            status: 'fulfilled',
            reason: 'success',
            code: 200,
            message: 'OK',
            details: `User with id '${id}' was created`,
            id,
        });

        response.setHeader('Content-Length', result.length);
        response.setHeader('Expires', new Date().toUTCString());
        response.writeHead(200);
        response.end(result);
    }

    catch (exception) {
        handleException(request, response, exception);
    }
});

router.put('/api/event/:id', async (request: http.IncomingMessage, response: http.ServerResponse, params: Params) => {
    if (!request.headers['content-type']?.startsWith('application/json')) {
        handleException(request, response, {
            status: 'rejected',
            reason: 'error',
            code: 400,
            message: 'Bad request',
            details: 'Content-Type must be application/json',
            id: params.id,
        });
    }

    try {
        const index = await db.getIndex('/events', (params.id as string));

        if (index < 0) {
            throw {};
        }

        const json: Params = await readRequestJSON(request);
        const event = await db.getData(`/events[${index}]`);
        
        await db.push(`/events[${index}]`, {
            ...event,
            ...json,
            id: params.id,
        });

        const result = JSON.stringify({
            status: 'fulfilled',
            reason: 'success',
            code: 200,
            message: 'OK',
            details: `User with id '${params.id}' was modified`,
            id: params.id,
        });

        response.setHeader('Content-Length', result.length);
        response.setHeader('Expires', new Date().toUTCString());
        response.writeHead(200);
        response.end(result);
    }
    
    catch (exception) {
        handleException(request, response, {
            status: 'rejected',
            reason: 'error',
            code: 404,
            message: 'Not found',
            details: `User with id '${params.id}' not found or could not be modified`,
            id: params.id,
        });
    }
});

router.delete('/api/event/:id', async (request, response, params) => {
    try {
        const index = await db.getIndex('/events', params.id);

        if (index < 0) {
            throw {};
        }
        
        await db.delete(`/events[${index}]`);

        const result = JSON.stringify({
            status: 'fulfilled',
            reason: 'success',
            code: 200,
            message: 'OK',
            details: `User with id '${params.id}' was deleted`,
        });

        response.setHeader('Content-Length', result.length);
        response.setHeader('Expires', new Date().toUTCString());
        response.writeHead(200);
        response.end(result);
    }
    
    catch (exception) {
        handleException(request, response, {
            status: 'rejected',
            reason: 'error',
            code: 404,
            message: 'Not found',
            details: `User with id '${params.id}' not found or could not be deleted`,
        });
    }
});

server.on('request', async (request, response) => {
    try {
        if (
            !request.method ||
            !['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'].includes(request.method) ||
            !request.url ||
            !request.headers.host
        ) {
            throw {
                status: 'rejected',
                reason: 'error',
                code: 400,
                message: 'Bad request',
                details: `Unsupported method "${request.method}" or URL "${request.url}"`,
            };
        }

        const origin = request.headers.origin;

        origin &&
        allowed.includes(origin) &&
        response.setHeader('Access-Control-Allow-Origin', origin);
        response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        response.setHeader('Access-Control-Allow-Credentials', 'true');
        response.setHeader('Access-Control-Max-Age', '86400');
        response.setHeader('Content-Type', 'application/json');

        if (request.method === 'OPTIONS') {
            response.writeHead(204);
            response.end();

            return;
        }

        if (router.resolve(request, response)) {
            return;
        }

        if (request.method !== 'GET') {
            throw {
                status: 'rejected',
                reason: 'error',
                code: 405,
                message: 'Method not allowed',
                details: `Unsupported method "${request.method}"`,
            };
        }

        const protocol = request.headers['x-forwarded-proto'] || 'http';
        const requestUrl = new URL(request.url || '', `${protocol}://${request.headers.host}`);
        const sanitized = path.normalize(requestUrl.pathname).replace(/^(\.\.[\/\\])+/, '');
        const filePath = path.join(__dirname, 'public', sanitized === '/' ? 'index.html' : sanitized);
        const readStream = fs.createReadStream(filePath);
        const contentType = mime.getType(filePath) || 'text/html';
        const expires = new Date(Date.now() + 86400000).toUTCString();

        response.setHeader('Expires', expires);

        readStream.on('open', () => {
            response.setHeader('Content-Type', contentType);
            response.setHeader('Content-Length', fs.statSync(filePath).size);
            response.setHeader('Cache-Control', 'public, max-age=86400');
            response.setHeader('Last-Modified', fs.statSync(filePath).mtime.toUTCString());
            response.setHeader('Expires', expires);
            response.writeHead(200);

            readStream.pipe(response);
        });
    
        readStream.on('error', (error: NodeJS.ErrnoException) => {
            if (error.code === 'ENOENT') {
                handleException(request, response, {
                    status: 'rejected',
                    reason: 'error',
                    code: 404,
                    message: 'Not found',
                    details: `The requested resource ${filePath} could not be found.`,
                });

                return;
            }

            throw {};
        });
    
        response.on('close', () => {
            readStream.destroy();
        });
    }
    
    catch (exception) {
        handleException(request, response, exception);
    }
}).listen(
    port,
    () => console.log(`Server is listening on port ${port}`)
);

function handleException (request: http.IncomingMessage, response: http.ServerResponse, exception: any) {
    if (isResponse(exception)) {
        response.writeHead((exception as Response).code || 500);
        response.end(JSON.stringify(exception));

        return;
    }

    response.writeHead(500);
    response.end(JSON.stringify({
        status: 'rejected',
        reason: 'error',
        code: 500,
        message: 'Internal Server Error',
        details: 'An unexpected error occurred.',
    }));
}

export const readRequestJSON = async (request: http.IncomingMessage): Promise<Params> => new Promise((resolve, reject) => {
    try {
        const bodyChunks: Array<Uint8Array> = [];

        request.on('data', (chunk) => bodyChunks.push(chunk));
        request.on('end', () => {
            try {
                resolve(JSON.parse(Buffer.concat(bodyChunks).toString()))
            }
            
            catch {
                reject({
                    status: 'rejected',
                    reason: 'error',
                    code: 400,
                    message: 'Bad request',
                    details: 'Invalid JSON',
                });
            }
        });
        request.on('error', (error) => reject({
            status: 'rejected',
            reason: 'error',
            code: 500,
            message: 'Internal Server Error',
            details: JSON.stringify(error),
        }));
    } catch {
        reject({
            status: 'rejected',
            reason: 'error',
            code: 500,
            message: 'Internal Server Error',
            details: 'An unexpected error occurred.',
        });
    }
});

export function parseEvent (json: any): Event {
    if (!json || typeof json !== 'object') {
        throw {
            status: 'rejected',
            reason: 'error',
            code: 400,
            message: 'Bad request',
            details: 'Invalid JSON',
        };
    }

    // todo: add safeguards: doublecheck client data, validate data, etc.

    return json;
}
