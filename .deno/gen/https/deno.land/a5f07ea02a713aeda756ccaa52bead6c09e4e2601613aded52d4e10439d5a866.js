import { compose } from './compose.ts';
import { Context } from './context.ts';
import { HTTPException } from './http-exception.ts';
import { HonoRequest } from './request.ts';
import { METHOD_NAME_ALL, METHOD_NAME_ALL_LOWERCASE, METHODS } from './router.ts';
import { getPath, getPathNoStrict, getQueryStrings, mergePath } from './utils/url.ts';
function defineDynamicClass() {
    return class {
    };
}
const notFoundHandler = (c)=>{
    return c.text('404 Not Found', 404);
};
const errorHandler = (err, c)=>{
    if (err instanceof HTTPException) {
        return err.getResponse();
    }
    console.trace(err);
    const message = 'Internal Server Error';
    return c.text(message, 500);
};
class Hono extends defineDynamicClass() {
    /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */ router;
    getPath;
    _basePath = '/';
    path = '/';
    routes = [];
    constructor(options = {}){
        super();
        // Implementation of app.get(...handlers[]) or app.get(path, ...handlers[])
        const allMethods = [
            ...METHODS,
            METHOD_NAME_ALL_LOWERCASE
        ];
        allMethods.map((method)=>{
            this[method] = (args1, ...args)=>{
                if (typeof args1 === 'string') {
                    this.path = args1;
                } else {
                    this.addRoute(method, this.path, args1);
                }
                args.map((handler)=>{
                    if (typeof handler !== 'string') {
                        this.addRoute(method, this.path, handler);
                    }
                });
                return this;
            };
        });
        // Implementation of app.on(method, path, ...handlers[])
        this.on = (method, path, ...handlers)=>{
            if (!method) return this;
            this.path = path;
            for (const m of [
                method
            ].flat()){
                handlers.map((handler)=>{
                    this.addRoute(m.toUpperCase(), this.path, handler);
                });
            }
            return this;
        };
        // Implementation of app.use(...handlers[]) or app.get(path, ...handlers[])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.use = (arg1, ...handlers)=>{
            if (typeof arg1 === 'string') {
                this.path = arg1;
            } else {
                handlers.unshift(arg1);
            }
            handlers.map((handler)=>{
                this.addRoute(METHOD_NAME_ALL, this.path, handler);
            });
            return this;
        };
        const strict = options.strict ?? true;
        delete options.strict;
        Object.assign(this, options);
        this.getPath = strict ? options.getPath ?? getPath : getPathNoStrict;
    }
    clone() {
        const clone = new Hono({
            router: this.router,
            getPath: this.getPath
        });
        clone.routes = this.routes;
        return clone;
    }
    notFoundHandler = notFoundHandler;
    errorHandler = errorHandler;
    route(path, app) {
        const subApp = this.basePath(path);
        if (!app) {
            return subApp;
        }
        app.routes.map((r)=>{
            const handler = app.errorHandler === errorHandler ? r.handler : async (c, next)=>(await compose([], app.errorHandler)(c, ()=>r.handler(c, next))).res;
            subApp.addRoute(r.method, r.path, handler);
        });
        return this;
    }
    basePath(path) {
        const subApp = this.clone();
        subApp._basePath = mergePath(this._basePath, path);
        return subApp;
    }
    onError(handler) {
        this.errorHandler = handler;
        return this;
    }
    notFound(handler) {
        this.notFoundHandler = handler;
        return this;
    }
    showRoutes() {
        const length = 8;
        this.routes.map((route)=>{
            console.log(`\x1b[32m${route.method}\x1b[0m ${' '.repeat(length - route.method.length)} ${route.path}`);
        });
    }
    /**
   * @experimental
   * `app.mount()` is an experimental feature.
   * The API might be changed.
   */ mount(path, // eslint-disable-next-line @typescript-eslint/no-explicit-any
    applicationHandler, optionHandler) {
        const mergedPath = mergePath(this._basePath, path);
        const pathPrefixLength = mergedPath === '/' ? 0 : mergedPath.length;
        const handler = async (c, next)=>{
            let executionContext = undefined;
            try {
                executionContext = c.executionCtx;
            } catch  {} // Do nothing
            const options = optionHandler ? optionHandler(c) : [
                c.env,
                executionContext
            ];
            const optionsArray = Array.isArray(options) ? options : [
                options
            ];
            const queryStrings = getQueryStrings(c.req.url);
            const res = await applicationHandler(new Request(new URL((c.req.path.slice(pathPrefixLength) || '/') + queryStrings, c.req.url), c.req.raw), ...optionsArray);
            if (res) return res;
            await next();
        };
        this.addRoute(METHOD_NAME_ALL, mergePath(path, '*'), handler);
        return this;
    }
    get routerName() {
        this.matchRoute('GET', '/');
        return this.router.name;
    }
    /**
   * @deprecated
   * `app.head()` is no longer used.
   * `app.get()` implicitly handles the HEAD method.
   */ head = ()=>{
        console.warn('`app.head()` is no longer used. `app.get()` implicitly handles the HEAD method.');
        return this;
    };
    addRoute(method, path, handler) {
        method = method.toUpperCase();
        path = mergePath(this._basePath, path);
        this.router.add(method, path, handler);
        const r = {
            path: path,
            method: method,
            handler: handler
        };
        this.routes.push(r);
    }
    matchRoute(method, path) {
        return this.router.match(method, path);
    }
    handleError(err, c) {
        if (err instanceof Error) {
            return this.errorHandler(err, c);
        }
        throw err;
    }
    dispatch(request, executionCtx, env, method) {
        // Handle HEAD method
        if (method === 'HEAD') {
            return (async ()=>new Response(null, await this.dispatch(request, executionCtx, env, 'GET')))();
        }
        const path = this.getPath(request, {
            env
        });
        const [handlers, paramStash] = this.matchRoute(method, path);
        const c = new Context(new HonoRequest(request, path, paramStash || []), {
            env,
            executionCtx,
            notFoundHandler: this.notFoundHandler
        });
        // Do not `compose` if it has only one handler
        if (handlers.length === 1) {
            let res;
            c.req.setParams(handlers[0][1]);
            try {
                res = handlers[0][0](c, async ()=>{});
                if (!res) {
                    return this.notFoundHandler(c);
                }
            } catch (err) {
                return this.handleError(err, c);
            }
            if (res instanceof Response) return res;
            if ('response' in res) {
                res = res.response;
            }
            if (res instanceof Response) return res;
            return (async ()=>{
                let awaited;
                try {
                    awaited = await res;
                    if (awaited !== undefined && 'response' in awaited) {
                        awaited = awaited['response'];
                    }
                    if (!awaited) {
                        return this.notFoundHandler(c);
                    }
                } catch (err) {
                    return this.handleError(err, c);
                }
                return awaited;
            })();
        }
        const composed = compose(handlers, this.errorHandler, this.notFoundHandler);
        return (async ()=>{
            try {
                const tmp = composed(c);
                const context = tmp.constructor.name === 'Promise' ? await tmp : tmp;
                if (!context.finalized) {
                    throw new Error('Context is not finalized. You may forget returning Response object or `await next()`');
                }
                return context.res;
            } catch (err) {
                return this.handleError(err, c);
            }
        })();
    }
    /**
   * @deprecated
   * `app.handleEvent()` will be removed in v4.
   * Use `app.fetch()` instead of `app.handleEvent()`.
   */ handleEvent = (event)=>{
        return this.dispatch(event.request, event, undefined, event.request.method);
    };
    fetch = (request, Env, executionCtx)=>{
        return this.dispatch(request, executionCtx, Env, request.method);
    };
    request = (input, requestInit, Env, executionCtx)=>{
        if (input instanceof Request) {
            if (requestInit !== undefined) {
                input = new Request(input, requestInit);
            }
            return this.fetch(input, Env, executionCtx);
        }
        input = input.toString();
        const path = /^https?:\/\//.test(input) ? input : `http://localhost${mergePath('/', input)}`;
        const req = new Request(path, requestInit);
        return this.fetch(req, Env, executionCtx);
    };
    fire = ()=>{
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        addEventListener('fetch', (event)=>{
            event.respondWith(this.dispatch(event.request, event, undefined, event.request.method));
        });
    };
}
export { Hono as HonoBase };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvaG9uby1iYXNlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNvbXBvc2UgfSBmcm9tICcuL2NvbXBvc2UudHMnXG5pbXBvcnQgeyBDb250ZXh0IH0gZnJvbSAnLi9jb250ZXh0LnRzJ1xuaW1wb3J0IHR5cGUgeyBFeGVjdXRpb25Db250ZXh0IH0gZnJvbSAnLi9jb250ZXh0LnRzJ1xuaW1wb3J0IHsgSFRUUEV4Y2VwdGlvbiB9IGZyb20gJy4vaHR0cC1leGNlcHRpb24udHMnXG5pbXBvcnQgeyBIb25vUmVxdWVzdCB9IGZyb20gJy4vcmVxdWVzdC50cydcbmltcG9ydCB0eXBlIHsgUm91dGVyIH0gZnJvbSAnLi9yb3V0ZXIudHMnXG5pbXBvcnQgeyBNRVRIT0RfTkFNRV9BTEwsIE1FVEhPRF9OQU1FX0FMTF9MT1dFUkNBU0UsIE1FVEhPRFMgfSBmcm9tICcuL3JvdXRlci50cydcbmltcG9ydCB0eXBlIHtcbiAgRW52LFxuICBFcnJvckhhbmRsZXIsXG4gIEgsXG4gIEhhbmRsZXJJbnRlcmZhY2UsXG4gIE1pZGRsZXdhcmVIYW5kbGVyLFxuICBNaWRkbGV3YXJlSGFuZGxlckludGVyZmFjZSxcbiAgTmV4dCxcbiAgTm90Rm91bmRIYW5kbGVyLFxuICBPbkhhbmRsZXJJbnRlcmZhY2UsXG4gIFR5cGVkUmVzcG9uc2UsXG4gIE1lcmdlUGF0aCxcbiAgTWVyZ2VTY2hlbWFQYXRoLFxuICBGZXRjaEV2ZW50TGlrZSxcbiAgU2NoZW1hLFxufSBmcm9tICcuL3R5cGVzLnRzJ1xuaW1wb3J0IHsgZ2V0UGF0aCwgZ2V0UGF0aE5vU3RyaWN0LCBnZXRRdWVyeVN0cmluZ3MsIG1lcmdlUGF0aCB9IGZyb20gJy4vdXRpbHMvdXJsLnRzJ1xuXG50eXBlIE1ldGhvZHMgPSB0eXBlb2YgTUVUSE9EU1tudW1iZXJdIHwgdHlwZW9mIE1FVEhPRF9OQU1FX0FMTF9MT1dFUkNBU0VcblxuaW50ZXJmYWNlIFJvdXRlclJvdXRlIHtcbiAgcGF0aDogc3RyaW5nXG4gIG1ldGhvZDogc3RyaW5nXG4gIGhhbmRsZXI6IEhcbn1cblxuZnVuY3Rpb24gZGVmaW5lRHluYW1pY0NsYXNzKCk6IHtcbiAgbmV3IDxFIGV4dGVuZHMgRW52ID0gRW52LCBTIGV4dGVuZHMgU2NoZW1hID0ge30sIEJhc2VQYXRoIGV4dGVuZHMgc3RyaW5nID0gJy8nPigpOiB7XG4gICAgW00gaW4gTWV0aG9kc106IEhhbmRsZXJJbnRlcmZhY2U8RSwgTSwgUywgQmFzZVBhdGg+XG4gIH0gJiB7XG4gICAgb246IE9uSGFuZGxlckludGVyZmFjZTxFLCBTLCBCYXNlUGF0aD5cbiAgfSAmIHtcbiAgICB1c2U6IE1pZGRsZXdhcmVIYW5kbGVySW50ZXJmYWNlPEUsIFMsIEJhc2VQYXRoPlxuICB9XG59IHtcbiAgcmV0dXJuIGNsYXNzIHt9IGFzIG5ldmVyXG59XG5cbmNvbnN0IG5vdEZvdW5kSGFuZGxlciA9IChjOiBDb250ZXh0KSA9PiB7XG4gIHJldHVybiBjLnRleHQoJzQwNCBOb3QgRm91bmQnLCA0MDQpXG59XG5cbmNvbnN0IGVycm9ySGFuZGxlciA9IChlcnI6IEVycm9yLCBjOiBDb250ZXh0KSA9PiB7XG4gIGlmIChlcnIgaW5zdGFuY2VvZiBIVFRQRXhjZXB0aW9uKSB7XG4gICAgcmV0dXJuIGVyci5nZXRSZXNwb25zZSgpXG4gIH1cbiAgY29uc29sZS50cmFjZShlcnIpXG4gIGNvbnN0IG1lc3NhZ2UgPSAnSW50ZXJuYWwgU2VydmVyIEVycm9yJ1xuICByZXR1cm4gYy50ZXh0KG1lc3NhZ2UsIDUwMClcbn1cblxudHlwZSBHZXRQYXRoPEUgZXh0ZW5kcyBFbnY+ID0gKHJlcXVlc3Q6IFJlcXVlc3QsIG9wdGlvbnM/OiB7IGVudj86IEVbJ0JpbmRpbmdzJ10gfSkgPT4gc3RyaW5nXG5cbmV4cG9ydCB0eXBlIEhvbm9PcHRpb25zPEUgZXh0ZW5kcyBFbnY+ID0ge1xuICBzdHJpY3Q/OiBib29sZWFuXG4gIHJvdXRlcj86IFJvdXRlcjxIPlxuICBnZXRQYXRoPzogR2V0UGF0aDxFPlxufVxuXG5jbGFzcyBIb25vPFxuICBFIGV4dGVuZHMgRW52ID0gRW52LFxuICBTIGV4dGVuZHMgU2NoZW1hID0ge30sXG4gIEJhc2VQYXRoIGV4dGVuZHMgc3RyaW5nID0gJy8nXG4+IGV4dGVuZHMgZGVmaW5lRHluYW1pY0NsYXNzKCk8RSwgUywgQmFzZVBhdGg+IHtcbiAgLypcbiAgICBUaGlzIGNsYXNzIGlzIGxpa2UgYW4gYWJzdHJhY3QgY2xhc3MgYW5kIGRvZXMgbm90IGhhdmUgYSByb3V0ZXIuXG4gICAgVG8gdXNlIGl0LCBpbmhlcml0IHRoZSBjbGFzcyBhbmQgaW1wbGVtZW50IHJvdXRlciBpbiB0aGUgY29uc3RydWN0b3IuXG4gICovXG4gIHJvdXRlciE6IFJvdXRlcjxIPlxuICByZWFkb25seSBnZXRQYXRoOiBHZXRQYXRoPEU+XG4gIHByaXZhdGUgX2Jhc2VQYXRoOiBzdHJpbmcgPSAnLydcbiAgcHJpdmF0ZSBwYXRoOiBzdHJpbmcgPSAnLydcblxuICByb3V0ZXM6IFJvdXRlclJvdXRlW10gPSBbXVxuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IEhvbm9PcHRpb25zPEU+ID0ge30pIHtcbiAgICBzdXBlcigpXG5cbiAgICAvLyBJbXBsZW1lbnRhdGlvbiBvZiBhcHAuZ2V0KC4uLmhhbmRsZXJzW10pIG9yIGFwcC5nZXQocGF0aCwgLi4uaGFuZGxlcnNbXSlcbiAgICBjb25zdCBhbGxNZXRob2RzID0gWy4uLk1FVEhPRFMsIE1FVEhPRF9OQU1FX0FMTF9MT1dFUkNBU0VdXG4gICAgYWxsTWV0aG9kcy5tYXAoKG1ldGhvZCkgPT4ge1xuICAgICAgdGhpc1ttZXRob2RdID0gKGFyZ3MxOiBzdHJpbmcgfCBILCAuLi5hcmdzOiBIW10pID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiBhcmdzMSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLnBhdGggPSBhcmdzMVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuYWRkUm91dGUobWV0aG9kLCB0aGlzLnBhdGgsIGFyZ3MxKVxuICAgICAgICB9XG4gICAgICAgIGFyZ3MubWFwKChoYW5kbGVyKSA9PiB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhpcy5hZGRSb3V0ZShtZXRob2QsIHRoaXMucGF0aCwgaGFuZGxlcilcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgICB9XG4gICAgfSlcblxuICAgIC8vIEltcGxlbWVudGF0aW9uIG9mIGFwcC5vbihtZXRob2QsIHBhdGgsIC4uLmhhbmRsZXJzW10pXG4gICAgdGhpcy5vbiA9IChtZXRob2Q6IHN0cmluZyB8IHN0cmluZ1tdLCBwYXRoOiBzdHJpbmcsIC4uLmhhbmRsZXJzOiBIW10pID0+IHtcbiAgICAgIGlmICghbWV0aG9kKSByZXR1cm4gdGhpc1xuICAgICAgdGhpcy5wYXRoID0gcGF0aFxuICAgICAgZm9yIChjb25zdCBtIG9mIFttZXRob2RdLmZsYXQoKSkge1xuICAgICAgICBoYW5kbGVycy5tYXAoKGhhbmRsZXIpID0+IHtcbiAgICAgICAgICB0aGlzLmFkZFJvdXRlKG0udG9VcHBlckNhc2UoKSwgdGhpcy5wYXRoLCBoYW5kbGVyKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG5cbiAgICAvLyBJbXBsZW1lbnRhdGlvbiBvZiBhcHAudXNlKC4uLmhhbmRsZXJzW10pIG9yIGFwcC5nZXQocGF0aCwgLi4uaGFuZGxlcnNbXSlcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgIHRoaXMudXNlID0gKGFyZzE6IHN0cmluZyB8IE1pZGRsZXdhcmVIYW5kbGVyPGFueT4sIC4uLmhhbmRsZXJzOiBNaWRkbGV3YXJlSGFuZGxlcjxhbnk+W10pID0+IHtcbiAgICAgIGlmICh0eXBlb2YgYXJnMSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5wYXRoID0gYXJnMVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaGFuZGxlcnMudW5zaGlmdChhcmcxKVxuICAgICAgfVxuICAgICAgaGFuZGxlcnMubWFwKChoYW5kbGVyKSA9PiB7XG4gICAgICAgIHRoaXMuYWRkUm91dGUoTUVUSE9EX05BTUVfQUxMLCB0aGlzLnBhdGgsIGhhbmRsZXIpXG4gICAgICB9KVxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG5cbiAgICBjb25zdCBzdHJpY3QgPSBvcHRpb25zLnN0cmljdCA/PyB0cnVlXG4gICAgZGVsZXRlIG9wdGlvbnMuc3RyaWN0XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLCBvcHRpb25zKVxuICAgIHRoaXMuZ2V0UGF0aCA9IHN0cmljdCA/IG9wdGlvbnMuZ2V0UGF0aCA/PyBnZXRQYXRoIDogZ2V0UGF0aE5vU3RyaWN0XG4gIH1cblxuICBwcml2YXRlIGNsb25lKCk6IEhvbm88RSwgUywgQmFzZVBhdGg+IHtcbiAgICBjb25zdCBjbG9uZSA9IG5ldyBIb25vPEUsIFMsIEJhc2VQYXRoPih7XG4gICAgICByb3V0ZXI6IHRoaXMucm91dGVyLFxuICAgICAgZ2V0UGF0aDogdGhpcy5nZXRQYXRoLFxuICAgIH0pXG4gICAgY2xvbmUucm91dGVzID0gdGhpcy5yb3V0ZXNcbiAgICByZXR1cm4gY2xvbmVcbiAgfVxuXG4gIHByaXZhdGUgbm90Rm91bmRIYW5kbGVyOiBOb3RGb3VuZEhhbmRsZXIgPSBub3RGb3VuZEhhbmRsZXJcbiAgcHJpdmF0ZSBlcnJvckhhbmRsZXI6IEVycm9ySGFuZGxlciA9IGVycm9ySGFuZGxlclxuXG4gIHJvdXRlPFxuICAgIFN1YlBhdGggZXh0ZW5kcyBzdHJpbmcsXG4gICAgU3ViRW52IGV4dGVuZHMgRW52LFxuICAgIFN1YlNjaGVtYSBleHRlbmRzIFNjaGVtYSxcbiAgICBTdWJCYXNlUGF0aCBleHRlbmRzIHN0cmluZ1xuICA+KFxuICAgIHBhdGg6IFN1YlBhdGgsXG4gICAgYXBwPzogSG9ubzxTdWJFbnYsIFN1YlNjaGVtYSwgU3ViQmFzZVBhdGg+XG4gICk6IEhvbm88RSwgTWVyZ2VTY2hlbWFQYXRoPFN1YlNjaGVtYSwgTWVyZ2VQYXRoPEJhc2VQYXRoLCBTdWJQYXRoPj4gJiBTLCBCYXNlUGF0aD4ge1xuICAgIGNvbnN0IHN1YkFwcCA9IHRoaXMuYmFzZVBhdGgocGF0aClcblxuICAgIGlmICghYXBwKSB7XG4gICAgICByZXR1cm4gc3ViQXBwXG4gICAgfVxuXG4gICAgYXBwLnJvdXRlcy5tYXAoKHIpID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPVxuICAgICAgICBhcHAuZXJyb3JIYW5kbGVyID09PSBlcnJvckhhbmRsZXJcbiAgICAgICAgICA/IHIuaGFuZGxlclxuICAgICAgICAgIDogYXN5bmMgKGM6IENvbnRleHQsIG5leHQ6IE5leHQpID0+XG4gICAgICAgICAgICAgIChhd2FpdCBjb21wb3NlPENvbnRleHQ+KFtdLCBhcHAuZXJyb3JIYW5kbGVyKShjLCAoKSA9PiByLmhhbmRsZXIoYywgbmV4dCkpKS5yZXNcbiAgICAgIHN1YkFwcC5hZGRSb3V0ZShyLm1ldGhvZCwgci5wYXRoLCBoYW5kbGVyKVxuICAgIH0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGJhc2VQYXRoPFN1YlBhdGggZXh0ZW5kcyBzdHJpbmc+KHBhdGg6IFN1YlBhdGgpOiBIb25vPEUsIFMsIE1lcmdlUGF0aDxCYXNlUGF0aCwgU3ViUGF0aD4+IHtcbiAgICBjb25zdCBzdWJBcHAgPSB0aGlzLmNsb25lKClcbiAgICBzdWJBcHAuX2Jhc2VQYXRoID0gbWVyZ2VQYXRoKHRoaXMuX2Jhc2VQYXRoLCBwYXRoKVxuICAgIHJldHVybiBzdWJBcHBcbiAgfVxuXG4gIG9uRXJyb3IoaGFuZGxlcjogRXJyb3JIYW5kbGVyPEU+KSB7XG4gICAgdGhpcy5lcnJvckhhbmRsZXIgPSBoYW5kbGVyXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIG5vdEZvdW5kKGhhbmRsZXI6IE5vdEZvdW5kSGFuZGxlcjxFPikge1xuICAgIHRoaXMubm90Rm91bmRIYW5kbGVyID0gaGFuZGxlclxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzaG93Um91dGVzKCkge1xuICAgIGNvbnN0IGxlbmd0aCA9IDhcbiAgICB0aGlzLnJvdXRlcy5tYXAoKHJvdXRlKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgYFxceDFiWzMybSR7cm91dGUubWV0aG9kfVxceDFiWzBtICR7JyAnLnJlcGVhdChsZW5ndGggLSByb3V0ZS5tZXRob2QubGVuZ3RoKX0gJHtyb3V0ZS5wYXRofWBcbiAgICAgIClcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEBleHBlcmltZW50YWxcbiAgICogYGFwcC5tb3VudCgpYCBpcyBhbiBleHBlcmltZW50YWwgZmVhdHVyZS5cbiAgICogVGhlIEFQSSBtaWdodCBiZSBjaGFuZ2VkLlxuICAgKi9cbiAgbW91bnQoXG4gICAgcGF0aDogc3RyaW5nLFxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgYXBwbGljYXRpb25IYW5kbGVyOiAocmVxdWVzdDogUmVxdWVzdCwgLi4uYXJnczogYW55KSA9PiBSZXNwb25zZSB8IFByb21pc2U8UmVzcG9uc2U+LFxuICAgIG9wdGlvbkhhbmRsZXI/OiAoYzogQ29udGV4dCkgPT4gdW5rbm93blxuICApOiBIb25vPEUsIFMsIEJhc2VQYXRoPiB7XG4gICAgY29uc3QgbWVyZ2VkUGF0aCA9IG1lcmdlUGF0aCh0aGlzLl9iYXNlUGF0aCwgcGF0aClcbiAgICBjb25zdCBwYXRoUHJlZml4TGVuZ3RoID0gbWVyZ2VkUGF0aCA9PT0gJy8nID8gMCA6IG1lcmdlZFBhdGgubGVuZ3RoXG5cbiAgICBjb25zdCBoYW5kbGVyOiBNaWRkbGV3YXJlSGFuZGxlciA9IGFzeW5jIChjLCBuZXh0KSA9PiB7XG4gICAgICBsZXQgZXhlY3V0aW9uQ29udGV4dDogRXhlY3V0aW9uQ29udGV4dCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZFxuICAgICAgdHJ5IHtcbiAgICAgICAgZXhlY3V0aW9uQ29udGV4dCA9IGMuZXhlY3V0aW9uQ3R4XG4gICAgICB9IGNhdGNoIHt9IC8vIERvIG5vdGhpbmdcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25IYW5kbGVyID8gb3B0aW9uSGFuZGxlcihjKSA6IFtjLmVudiwgZXhlY3V0aW9uQ29udGV4dF1cbiAgICAgIGNvbnN0IG9wdGlvbnNBcnJheSA9IEFycmF5LmlzQXJyYXkob3B0aW9ucykgPyBvcHRpb25zIDogW29wdGlvbnNdXG5cbiAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5ncyA9IGdldFF1ZXJ5U3RyaW5ncyhjLnJlcS51cmwpXG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBhcHBsaWNhdGlvbkhhbmRsZXIoXG4gICAgICAgIG5ldyBSZXF1ZXN0KFxuICAgICAgICAgIG5ldyBVUkwoKGMucmVxLnBhdGguc2xpY2UocGF0aFByZWZpeExlbmd0aCkgfHwgJy8nKSArIHF1ZXJ5U3RyaW5ncywgYy5yZXEudXJsKSxcbiAgICAgICAgICBjLnJlcS5yYXdcbiAgICAgICAgKSxcbiAgICAgICAgLi4ub3B0aW9uc0FycmF5XG4gICAgICApXG5cbiAgICAgIGlmIChyZXMpIHJldHVybiByZXNcblxuICAgICAgYXdhaXQgbmV4dCgpXG4gICAgfVxuICAgIHRoaXMuYWRkUm91dGUoTUVUSE9EX05BTUVfQUxMLCBtZXJnZVBhdGgocGF0aCwgJyonKSwgaGFuZGxlcilcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZ2V0IHJvdXRlck5hbWUoKSB7XG4gICAgdGhpcy5tYXRjaFJvdXRlKCdHRVQnLCAnLycpXG4gICAgcmV0dXJuIHRoaXMucm91dGVyLm5hbWVcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZFxuICAgKiBgYXBwLmhlYWQoKWAgaXMgbm8gbG9uZ2VyIHVzZWQuXG4gICAqIGBhcHAuZ2V0KClgIGltcGxpY2l0bHkgaGFuZGxlcyB0aGUgSEVBRCBtZXRob2QuXG4gICAqL1xuICBoZWFkID0gKCkgPT4ge1xuICAgIGNvbnNvbGUud2FybignYGFwcC5oZWFkKClgIGlzIG5vIGxvbmdlciB1c2VkLiBgYXBwLmdldCgpYCBpbXBsaWNpdGx5IGhhbmRsZXMgdGhlIEhFQUQgbWV0aG9kLicpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHByaXZhdGUgYWRkUm91dGUobWV0aG9kOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgaGFuZGxlcjogSCkge1xuICAgIG1ldGhvZCA9IG1ldGhvZC50b1VwcGVyQ2FzZSgpXG4gICAgcGF0aCA9IG1lcmdlUGF0aCh0aGlzLl9iYXNlUGF0aCwgcGF0aClcbiAgICB0aGlzLnJvdXRlci5hZGQobWV0aG9kLCBwYXRoLCBoYW5kbGVyKVxuICAgIGNvbnN0IHI6IFJvdXRlclJvdXRlID0geyBwYXRoOiBwYXRoLCBtZXRob2Q6IG1ldGhvZCwgaGFuZGxlcjogaGFuZGxlciB9XG4gICAgdGhpcy5yb3V0ZXMucHVzaChyKVxuICB9XG5cbiAgcHJpdmF0ZSBtYXRjaFJvdXRlKG1ldGhvZDogc3RyaW5nLCBwYXRoOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5yb3V0ZXIubWF0Y2gobWV0aG9kLCBwYXRoKVxuICB9XG5cbiAgcHJpdmF0ZSBoYW5kbGVFcnJvcihlcnI6IHVua25vd24sIGM6IENvbnRleHQ8RT4pIHtcbiAgICBpZiAoZXJyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIHJldHVybiB0aGlzLmVycm9ySGFuZGxlcihlcnIsIGMpXG4gICAgfVxuICAgIHRocm93IGVyclxuICB9XG5cbiAgcHJpdmF0ZSBkaXNwYXRjaChcbiAgICByZXF1ZXN0OiBSZXF1ZXN0LFxuICAgIGV4ZWN1dGlvbkN0eDogRXhlY3V0aW9uQ29udGV4dCB8IEZldGNoRXZlbnRMaWtlIHwgdW5kZWZpbmVkLFxuICAgIGVudjogRVsnQmluZGluZ3MnXSxcbiAgICBtZXRob2Q6IHN0cmluZ1xuICApOiBSZXNwb25zZSB8IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgICAvLyBIYW5kbGUgSEVBRCBtZXRob2RcbiAgICBpZiAobWV0aG9kID09PSAnSEVBRCcpIHtcbiAgICAgIHJldHVybiAoYXN5bmMgKCkgPT5cbiAgICAgICAgbmV3IFJlc3BvbnNlKG51bGwsIGF3YWl0IHRoaXMuZGlzcGF0Y2gocmVxdWVzdCwgZXhlY3V0aW9uQ3R4LCBlbnYsICdHRVQnKSkpKClcbiAgICB9XG5cbiAgICBjb25zdCBwYXRoID0gdGhpcy5nZXRQYXRoKHJlcXVlc3QsIHsgZW52IH0pXG4gICAgY29uc3QgW2hhbmRsZXJzLCBwYXJhbVN0YXNoXSA9IHRoaXMubWF0Y2hSb3V0ZShtZXRob2QsIHBhdGgpXG5cbiAgICBjb25zdCBjID0gbmV3IENvbnRleHQobmV3IEhvbm9SZXF1ZXN0KHJlcXVlc3QsIHBhdGgsIHBhcmFtU3Rhc2ggfHwgW10pLCB7XG4gICAgICBlbnYsXG4gICAgICBleGVjdXRpb25DdHgsXG4gICAgICBub3RGb3VuZEhhbmRsZXI6IHRoaXMubm90Rm91bmRIYW5kbGVyLFxuICAgIH0pXG5cbiAgICAvLyBEbyBub3QgYGNvbXBvc2VgIGlmIGl0IGhhcyBvbmx5IG9uZSBoYW5kbGVyXG4gICAgaWYgKGhhbmRsZXJzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGV0IHJlczogUmV0dXJuVHlwZTxIPlxuXG4gICAgICBjLnJlcS5zZXRQYXJhbXMoaGFuZGxlcnNbMF1bMV0pXG4gICAgICB0cnkge1xuICAgICAgICByZXMgPSBoYW5kbGVyc1swXVswXShjLCBhc3luYyAoKSA9PiB7fSlcbiAgICAgICAgaWYgKCFyZXMpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5ub3RGb3VuZEhhbmRsZXIoYylcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhhbmRsZUVycm9yKGVyciwgYylcbiAgICAgIH1cblxuICAgICAgaWYgKHJlcyBpbnN0YW5jZW9mIFJlc3BvbnNlKSByZXR1cm4gcmVzXG5cbiAgICAgIGlmICgncmVzcG9uc2UnIGluIHJlcykge1xuICAgICAgICByZXMgPSByZXMucmVzcG9uc2VcbiAgICAgIH1cblxuICAgICAgaWYgKHJlcyBpbnN0YW5jZW9mIFJlc3BvbnNlKSByZXR1cm4gcmVzXG5cbiAgICAgIHJldHVybiAoYXN5bmMgKCkgPT4ge1xuICAgICAgICBsZXQgYXdhaXRlZDogUmVzcG9uc2UgfCBUeXBlZFJlc3BvbnNlIHwgdm9pZFxuICAgICAgICB0cnkge1xuICAgICAgICAgIGF3YWl0ZWQgPSBhd2FpdCByZXNcbiAgICAgICAgICBpZiAoYXdhaXRlZCAhPT0gdW5kZWZpbmVkICYmICdyZXNwb25zZScgaW4gYXdhaXRlZCkge1xuICAgICAgICAgICAgYXdhaXRlZCA9IGF3YWl0ZWRbJ3Jlc3BvbnNlJ10gYXMgUmVzcG9uc2VcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFhd2FpdGVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ub3RGb3VuZEhhbmRsZXIoYylcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIHJldHVybiB0aGlzLmhhbmRsZUVycm9yKGVyciwgYylcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXdhaXRlZFxuICAgICAgfSkoKVxuICAgIH1cblxuICAgIGNvbnN0IGNvbXBvc2VkID0gY29tcG9zZTxDb250ZXh0PihoYW5kbGVycywgdGhpcy5lcnJvckhhbmRsZXIsIHRoaXMubm90Rm91bmRIYW5kbGVyKVxuXG4gICAgcmV0dXJuIChhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB0bXAgPSBjb21wb3NlZChjKVxuICAgICAgICBjb25zdCBjb250ZXh0ID0gdG1wLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdQcm9taXNlJyA/IGF3YWl0IHRtcCA6ICh0bXAgYXMgQ29udGV4dClcbiAgICAgICAgaWYgKCFjb250ZXh0LmZpbmFsaXplZCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICdDb250ZXh0IGlzIG5vdCBmaW5hbGl6ZWQuIFlvdSBtYXkgZm9yZ2V0IHJldHVybmluZyBSZXNwb25zZSBvYmplY3Qgb3IgYGF3YWl0IG5leHQoKWAnXG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb250ZXh0LnJlc1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhhbmRsZUVycm9yKGVyciwgYylcbiAgICAgIH1cbiAgICB9KSgpXG4gIH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWRcbiAgICogYGFwcC5oYW5kbGVFdmVudCgpYCB3aWxsIGJlIHJlbW92ZWQgaW4gdjQuXG4gICAqIFVzZSBgYXBwLmZldGNoKClgIGluc3RlYWQgb2YgYGFwcC5oYW5kbGVFdmVudCgpYC5cbiAgICovXG4gIGhhbmRsZUV2ZW50ID0gKGV2ZW50OiBGZXRjaEV2ZW50TGlrZSkgPT4ge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKGV2ZW50LnJlcXVlc3QsIGV2ZW50LCB1bmRlZmluZWQsIGV2ZW50LnJlcXVlc3QubWV0aG9kKVxuICB9XG5cbiAgZmV0Y2ggPSAocmVxdWVzdDogUmVxdWVzdCwgRW52PzogRVsnQmluZGluZ3MnXSB8IHt9LCBleGVjdXRpb25DdHg/OiBFeGVjdXRpb25Db250ZXh0KSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2gocmVxdWVzdCwgZXhlY3V0aW9uQ3R4LCBFbnYsIHJlcXVlc3QubWV0aG9kKVxuICB9XG5cbiAgcmVxdWVzdCA9IChcbiAgICBpbnB1dDogUmVxdWVzdEluZm8gfCBVUkwsXG4gICAgcmVxdWVzdEluaXQ/OiBSZXF1ZXN0SW5pdCxcbiAgICBFbnY/OiBFWydCaW5kaW5ncyddIHwge30sXG4gICAgZXhlY3V0aW9uQ3R4PzogRXhlY3V0aW9uQ29udGV4dFxuICApID0+IHtcbiAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBSZXF1ZXN0KSB7XG4gICAgICBpZiAocmVxdWVzdEluaXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpbnB1dCA9IG5ldyBSZXF1ZXN0KGlucHV0LCByZXF1ZXN0SW5pdClcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmZldGNoKGlucHV0LCBFbnYsIGV4ZWN1dGlvbkN0eClcbiAgICB9XG4gICAgaW5wdXQgPSBpbnB1dC50b1N0cmluZygpXG4gICAgY29uc3QgcGF0aCA9IC9eaHR0cHM/OlxcL1xcLy8udGVzdChpbnB1dCkgPyBpbnB1dCA6IGBodHRwOi8vbG9jYWxob3N0JHttZXJnZVBhdGgoJy8nLCBpbnB1dCl9YFxuICAgIGNvbnN0IHJlcSA9IG5ldyBSZXF1ZXN0KHBhdGgsIHJlcXVlc3RJbml0KVxuICAgIHJldHVybiB0aGlzLmZldGNoKHJlcSwgRW52LCBleGVjdXRpb25DdHgpXG4gIH1cblxuICBmaXJlID0gKCkgPT4ge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgYWRkRXZlbnRMaXN0ZW5lcignZmV0Y2gnLCAoZXZlbnQ6IEZldGNoRXZlbnRMaWtlKTogdm9pZCA9PiB7XG4gICAgICBldmVudC5yZXNwb25kV2l0aCh0aGlzLmRpc3BhdGNoKGV2ZW50LnJlcXVlc3QsIGV2ZW50LCB1bmRlZmluZWQsIGV2ZW50LnJlcXVlc3QubWV0aG9kKSlcbiAgICB9KVxuICB9XG59XG5cbmV4cG9ydCB7IEhvbm8gYXMgSG9ub0Jhc2UgfVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsT0FBTyxRQUFRLGVBQWM7QUFDdEMsU0FBUyxPQUFPLFFBQVEsZUFBYztBQUV0QyxTQUFTLGFBQWEsUUFBUSxzQkFBcUI7QUFDbkQsU0FBUyxXQUFXLFFBQVEsZUFBYztBQUUxQyxTQUFTLGVBQWUsRUFBRSx5QkFBeUIsRUFBRSxPQUFPLFFBQVEsY0FBYTtBQWlCakYsU0FBUyxPQUFPLEVBQUUsZUFBZSxFQUFFLGVB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