import http from 'http';
import { Route } from "./interfaces";
import { RequestHandler } from "./types";

export default class Router {
    private routes: Route[] = [];
  
    private normalizePath = (path: string): string => path === '/' ? path : path.endsWith('/') ? path.slice(0, -1) : path;
  
    private define (pattern: string, method: string, handler: RequestHandler): void {
        const keys: string[] = [];
        const regexp = this.normalizePath(pattern).replace(/:(\w+)/g, (_, key) => {
            keys.push(key);
  
            return '([^/]+)';
        });
        const route: Route = {
            pattern: new RegExp(`^${regexp}$`),
            keys,
            method,
            handler,
        };
  
        this.routes.push(route);
    }
  
    public get (pattern: string, handler: RequestHandler): void {
        this.define(pattern, 'GET', handler);
    }
  
    public post (pattern: string, handler: RequestHandler): void {
        this.define(pattern, 'POST', handler);
    }
  
    public put (pattern: string, handler: RequestHandler): void {
        this.define(pattern, 'PUT', handler);
    }
  
    public delete (pattern: string, handler: RequestHandler): void {
        this.define(pattern, 'DELETE', handler);
    }
  
    public resolve (request: http.IncomingMessage, response: http.ServerResponse): boolean {
      const url = request.url ? new URL(request.url, `http://${request.headers.host}`) : null;
      const pathname = url?.pathname || '/';
      const method = request.method || 'GET';
  
      for (const route of this.routes) {
        if (method !== route.method) {
          continue;
        }
        const match = this.normalizePath(pathname).match(route.pattern);
  
        if (!match) {
          continue;
        }
  
        const params = match.slice(1).reduce((params, value, index) => {
            params[route.keys[index]] = value;
  
            return params;
        },
        {} as { [key: string]: string });
  
        route.handler(request, response, params);
  
        return true;
      }
      
      return false;
    }
  }
