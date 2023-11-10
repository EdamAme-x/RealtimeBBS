import { serialize } from './utils/cookie.ts';
import { StreamingApi } from './utils/stream.ts';
const TEXT_PLAIN = 'text/plain; charset=UTF-8';
export class Context {
    req;
    env = {};
    _var = {};
    finalized = false;
    error = undefined;
    _status = 200;
    _exCtx;
    _h = undefined //  _headers
    ;
    _pH = undefined // _preparedHeaders
    ;
    _res;
    _init = true;
    _renderer = (content)=>this.html(content);
    notFoundHandler = ()=>new Response();
    constructor(req, options){
        this.req = req;
        if (options) {
            this._exCtx = options.executionCtx;
            this.env = options.env;
            if (options.notFoundHandler) {
                this.notFoundHandler = options.notFoundHandler;
            }
        }
    }
    get event() {
        if (this._exCtx && 'respondWith' in this._exCtx) {
            return this._exCtx;
        } else {
            throw Error('This context has no FetchEvent');
        }
    }
    get executionCtx() {
        if (this._exCtx) {
            return this._exCtx;
        } else {
            throw Error('This context has no ExecutionContext');
        }
    }
    get res() {
        this._init = false;
        return this._res ||= new Response('404 Not Found', {
            status: 404
        });
    }
    set res(_res) {
        this._init = false;
        if (this._res && _res) {
            this._res.headers.delete('content-type');
            this._res.headers.forEach((v, k)=>{
                _res.headers.set(k, v);
            });
        }
        this._res = _res;
        this.finalized = true;
    }
    /**
   * @experimental
   * `c.render()` is an experimental feature.
   * The API might be changed.
   */ // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render = (...args)=>this._renderer(...args);
    /**
   * @experimental
   * `c.setRenderer()` is an experimental feature.
   * The API might be changed.
   */ setRenderer = (renderer)=>{
        this._renderer = renderer;
    };
    header = (name, value, options)=>{
        // Clear the header
        if (value === undefined) {
            if (this._h) {
                this._h.delete(name);
            } else if (this._pH) {
                delete this._pH[name.toLocaleLowerCase()];
            }
            if (this.finalized) {
                this.res.headers.delete(name);
            }
            return;
        }
        if (options?.append) {
            if (!this._h) {
                this._init = false;
                this._h = new Headers(this._pH);
                this._pH = {};
            }
            this._h.append(name, value);
        } else {
            if (this._h) {
                this._h.set(name, value);
            } else {
                this._pH ??= {};
                this._pH[name.toLowerCase()] = value;
            }
        }
        if (this.finalized) {
            if (options?.append) {
                this.res.headers.append(name, value);
            } else {
                this.res.headers.set(name, value);
            }
        }
    };
    status = (status)=>{
        this._status = status;
    };
    set = (key, value)=>{
        this._var ??= {};
        this._var[key] = value;
    };
    get = (key)=>{
        return this._var ? this._var[key] : undefined;
    };
    // c.var.propName is a read-only
    get var() {
        return {
            ...this._var
        };
    }
    newResponse = (data, arg, headers)=>{
        // Optimized
        if (this._init && !headers && !arg && this._status === 200) {
            return new Response(data, {
                headers: this._pH
            });
        }
        // Return Response immediately if arg is ResponseInit.
        if (arg && typeof arg !== 'number') {
            const res = new Response(data, arg);
            const contentType = this._pH?.['content-type'];
            if (contentType) {
                res.headers.set('content-type', contentType);
            }
            return res;
        }
        const status = arg ?? this._status;
        this._pH ??= {};
        this._h ??= new Headers();
        for (const [k, v] of Object.entries(this._pH)){
            this._h.set(k, v);
        }
        if (this._res) {
            this._res.headers.forEach((v, k)=>{
                this._h?.set(k, v);
            });
            for (const [k, v] of Object.entries(this._pH)){
                this._h.set(k, v);
            }
        }
        headers ??= {};
        for (const [k, v] of Object.entries(headers)){
            if (typeof v === 'string') {
                this._h.set(k, v);
            } else {
                this._h.delete(k);
                for (const v2 of v){
                    this._h.append(k, v2);
                }
            }
        }
        return new Response(data, {
            status,
            headers: this._h
        });
    };
    body = (data, arg, headers)=>{
        return typeof arg === 'number' ? this.newResponse(data, arg, headers) : this.newResponse(data, arg);
    };
    text = (text, arg, headers)=>{
        // If the header is empty, return Response immediately.
        // Content-Type will be added automatically as `text/plain`.
        if (!this._pH) {
            if (this._init && !headers && !arg) {
                return new Response(text);
            }
            this._pH = {};
        }
        // If Content-Type is not set, we don't have to set `text/plain`.
        // Fewer the header values, it will be faster.
        if (this._pH['content-type']) {
            this._pH['content-type'] = TEXT_PLAIN;
        }
        return typeof arg === 'number' ? this.newResponse(text, arg, headers) : this.newResponse(text, arg);
    };
    json = (object, arg, headers)=>{
        const body = JSON.stringify(object);
        this._pH ??= {};
        this._pH['content-type'] = 'application/json; charset=UTF-8';
        return typeof arg === 'number' ? this.newResponse(body, arg, headers) : this.newResponse(body, arg);
    };
    jsonT = (object, arg, headers)=>{
        const response = typeof arg === 'number' ? this.json(object, arg, headers) : this.json(object, arg);
        return {
            response,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: object,
            format: 'json',
            status: response.status
        };
    };
    html = (html, arg, headers)=>{
        this._pH ??= {};
        this._pH['content-type'] = 'text/html; charset=UTF-8';
        return typeof arg === 'number' ? this.newResponse(html, arg, headers) : this.newResponse(html, arg);
    };
    redirect = (location, status = 302)=>{
        this._h ??= new Headers();
        this._h.set('Location', location);
        return this.newResponse(null, status);
    };
    streamText = (cb, arg, headers)=>{
        headers ??= {};
        this.header('content-type', TEXT_PLAIN);
        this.header('x-content-type-options', 'nosniff');
        this.header('transfer-encoding', 'chunked');
        return this.stream(cb, arg, headers);
    };
    stream = (cb, arg, headers)=>{
        const { readable , writable  } = new TransformStream();
        const stream = new StreamingApi(writable);
        cb(stream).finally(()=>stream.close());
        return typeof arg === 'number' ? this.newResponse(readable, arg, headers) : this.newResponse(readable, arg);
    };
    /** @deprecated
   * Use Cookie Middleware instead of `c.cookie()`. The `c.cookie()` will be removed in v4.
   *
   * @example
   *
   * import { setCookie } from 'hono/cookie'
   * // ...
   * app.get('/', (c) => {
   *   setCookie(c, 'key', 'value')
   *   //...
   * })
   */ cookie = (name, value, opt)=>{
        const cookie = serialize(name, value, opt);
        this.header('set-cookie', cookie, {
            append: true
        });
    };
    notFound = ()=>{
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return this.notFoundHandler(this);
    };
    /** @deprecated
   * Use `getRuntimeKey()` exported from `hono/adapter` instead of `c.runtime()`. The `c.runtime()` will be removed in v4.
   *
   * @example
   *
   * import { getRuntimeKey } from 'hono/adapter'
   * // ...
   * app.get('/', (c) => {
   *   const key = getRuntimeKey()
   *   //...
   * })
   */ get runtime() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const global = globalThis;
        if (global?.Deno !== undefined) {
            return 'deno';
        }
        if (global?.Bun !== undefined) {
            return 'bun';
        }
        if (typeof global?.WebSocketPair === 'function') {
            return 'workerd';
        }
        if (typeof global?.EdgeRuntime === 'string') {
            return 'edge-light';
        }
        if (global?.fastly !== undefined) {
            return 'fastly';
        }
        if (global?.__lagon__ !== undefined) {
            return 'lagon';
        }
        if (global?.process?.release?.name === 'node') {
            return 'node';
        }
        return 'other';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvY29udGV4dC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFJ1bnRpbWUgfSBmcm9tICcuL2hlbHBlci9hZGFwdGVyL2luZGV4LnRzJ1xuaW1wb3J0IHR5cGUgeyBIb25vUmVxdWVzdCB9IGZyb20gJy4vcmVxdWVzdC50cydcbmltcG9ydCB0eXBlIHsgRW52LCBGZXRjaEV2ZW50TGlrZSwgTm90Rm91bmRIYW5kbGVyLCBJbnB1dCwgVHlwZWRSZXNwb25zZSB9IGZyb20gJy4vdHlwZXMudHMnXG5pbXBvcnQgdHlwZSB7IENvb2tpZU9wdGlvbnMgfSBmcm9tICcuL3V0aWxzL2Nvb2tpZS50cydcbmltcG9ydCB7IHNlcmlhbGl6ZSB9IGZyb20gJy4vdXRpbHMvY29va2llLnRzJ1xuaW1wb3J0IHR5cGUgeyBTdGF0dXNDb2RlIH0gZnJvbSAnLi91dGlscy9odHRwLXN0YXR1cy50cydcbmltcG9ydCB7IFN0cmVhbWluZ0FwaSB9IGZyb20gJy4vdXRpbHMvc3RyZWFtLnRzJ1xuaW1wb3J0IHR5cGUgeyBKU09OVmFsdWUsIEludGVyZmFjZVRvVHlwZSB9IGZyb20gJy4vdXRpbHMvdHlwZXMudHMnXG5cbnR5cGUgSGVhZGVyUmVjb3JkID0gUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgc3RyaW5nW10+XG50eXBlIERhdGEgPSBzdHJpbmcgfCBBcnJheUJ1ZmZlciB8IFJlYWRhYmxlU3RyZWFtXG5cbmV4cG9ydCBpbnRlcmZhY2UgRXhlY3V0aW9uQ29udGV4dCB7XG4gIHdhaXRVbnRpbChwcm9taXNlOiBQcm9taXNlPHVua25vd24+KTogdm9pZFxuICBwYXNzVGhyb3VnaE9uRXhjZXB0aW9uKCk6IHZvaWRcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb250ZXh0VmFyaWFibGVNYXAge31cblxuZXhwb3J0IGludGVyZmFjZSBDb250ZXh0UmVuZGVyZXIge31cbmludGVyZmFjZSBEZWZhdWx0UmVuZGVyZXIge1xuICAoY29udGVudDogc3RyaW5nKTogUmVzcG9uc2UgfCBQcm9taXNlPFJlc3BvbnNlPlxufVxuZXhwb3J0IHR5cGUgUmVuZGVyZXIgPSBDb250ZXh0UmVuZGVyZXIgZXh0ZW5kcyBGdW5jdGlvbiA/IENvbnRleHRSZW5kZXJlciA6IERlZmF1bHRSZW5kZXJlclxuXG5pbnRlcmZhY2UgR2V0PEUgZXh0ZW5kcyBFbnY+IHtcbiAgPEtleSBleHRlbmRzIGtleW9mIENvbnRleHRWYXJpYWJsZU1hcD4oa2V5OiBLZXkpOiBDb250ZXh0VmFyaWFibGVNYXBbS2V5XVxuICA8S2V5IGV4dGVuZHMga2V5b2YgRVsnVmFyaWFibGVzJ10+KGtleTogS2V5KTogRVsnVmFyaWFibGVzJ11bS2V5XVxufVxuXG5pbnRlcmZhY2UgU2V0PEUgZXh0ZW5kcyBFbnY+IHtcbiAgPEtleSBleHRlbmRzIGtleW9mIENvbnRleHRWYXJpYWJsZU1hcD4oa2V5OiBLZXksIHZhbHVlOiBDb250ZXh0VmFyaWFibGVNYXBbS2V5XSk6IHZvaWRcbiAgPEtleSBleHRlbmRzIGtleW9mIEVbJ1ZhcmlhYmxlcyddPihrZXk6IEtleSwgdmFsdWU6IEVbJ1ZhcmlhYmxlcyddW0tleV0pOiB2b2lkXG59XG5cbmludGVyZmFjZSBOZXdSZXNwb25zZSB7XG4gIChkYXRhOiBEYXRhIHwgbnVsbCwgc3RhdHVzPzogU3RhdHVzQ29kZSwgaGVhZGVycz86IEhlYWRlclJlY29yZCk6IFJlc3BvbnNlXG4gIChkYXRhOiBEYXRhIHwgbnVsbCwgaW5pdD86IFJlc3BvbnNlSW5pdCk6IFJlc3BvbnNlXG59XG5cbmludGVyZmFjZSBCb2R5UmVzcG9uZCBleHRlbmRzIE5ld1Jlc3BvbnNlIHt9XG5cbmludGVyZmFjZSBUZXh0UmVzcG9uZCB7XG4gICh0ZXh0OiBzdHJpbmcsIHN0YXR1cz86IFN0YXR1c0NvZGUsIGhlYWRlcnM/OiBIZWFkZXJSZWNvcmQpOiBSZXNwb25zZVxuICAodGV4dDogc3RyaW5nLCBpbml0PzogUmVzcG9uc2VJbml0KTogUmVzcG9uc2Vcbn1cblxuaW50ZXJmYWNlIEpTT05SZXNwb25kIHtcbiAgPFQgPSBKU09OVmFsdWU+KG9iamVjdDogVCwgc3RhdHVzPzogU3RhdHVzQ29kZSwgaGVhZGVycz86IEhlYWRlclJlY29yZCk6IFJlc3BvbnNlXG4gIDxUID0gSlNPTlZhbHVlPihvYmplY3Q6IFQsIGluaXQ/OiBSZXNwb25zZUluaXQpOiBSZXNwb25zZVxufVxuXG5pbnRlcmZhY2UgSlNPTlRSZXNwb25kIHtcbiAgPFQ+KFxuICAgIG9iamVjdDogSW50ZXJmYWNlVG9UeXBlPFQ+IGV4dGVuZHMgSlNPTlZhbHVlID8gVCA6IEpTT05WYWx1ZSxcbiAgICBzdGF0dXM/OiBTdGF0dXNDb2RlLFxuICAgIGhlYWRlcnM/OiBIZWFkZXJSZWNvcmRcbiAgKTogVHlwZWRSZXNwb25zZTxcbiAgICBJbnRlcmZhY2VUb1R5cGU8VD4gZXh0ZW5kcyBKU09OVmFsdWVcbiAgICAgID8gSlNPTlZhbHVlIGV4dGVuZHMgSW50ZXJmYWNlVG9UeXBlPFQ+XG4gICAgICAgID8gbmV2ZXJcbiAgICAgICAgOiBUXG4gICAgICA6IG5ldmVyXG4gID5cbiAgPFQ+KFxuICAgIG9iamVjdDogSW50ZXJmYWNlVG9UeXBlPFQ+IGV4dGVuZHMgSlNPTlZhbHVlID8gVCA6IEpTT05WYWx1ZSxcbiAgICBpbml0PzogUmVzcG9uc2VJbml0XG4gICk6IFR5cGVkUmVzcG9uc2U8XG4gICAgSW50ZXJmYWNlVG9UeXBlPFQ+IGV4dGVuZHMgSlNPTlZhbHVlXG4gICAgICA/IEpTT05WYWx1ZSBleHRlbmRzIEludGVyZmFjZVRvVHlwZTxUPlxuICAgICAgICA/IG5ldmVyXG4gICAgICAgIDogVFxuICAgICAgOiBuZXZlclxuICA+XG59XG5cbmludGVyZmFjZSBIVE1MUmVzcG9uZCB7XG4gIChodG1sOiBzdHJpbmcsIHN0YXR1cz86IFN0YXR1c0NvZGUsIGhlYWRlcnM/OiBIZWFkZXJSZWNvcmQpOiBSZXNwb25zZVxuICAoaHRtbDogc3RyaW5nLCBpbml0PzogUmVzcG9uc2VJbml0KTogUmVzcG9uc2Vcbn1cblxudHlwZSBDb250ZXh0T3B0aW9uczxFIGV4dGVuZHMgRW52PiA9IHtcbiAgZW52OiBFWydCaW5kaW5ncyddXG4gIGV4ZWN1dGlvbkN0eD86IEZldGNoRXZlbnRMaWtlIHwgRXhlY3V0aW9uQ29udGV4dCB8IHVuZGVmaW5lZFxuICBub3RGb3VuZEhhbmRsZXI/OiBOb3RGb3VuZEhhbmRsZXI8RT5cbn1cblxuY29uc3QgVEVYVF9QTEFJTiA9ICd0ZXh0L3BsYWluOyBjaGFyc2V0PVVURi04J1xuXG5leHBvcnQgY2xhc3MgQ29udGV4dDxcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgRSBleHRlbmRzIEVudiA9IGFueSxcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgUCBleHRlbmRzIHN0cmluZyA9IGFueSxcbiAgSSBleHRlbmRzIElucHV0ID0ge31cbj4ge1xuICByZXE6IEhvbm9SZXF1ZXN0PFAsIElbJ291dCddPlxuICBlbnY6IEVbJ0JpbmRpbmdzJ10gPSB7fVxuICBwcml2YXRlIF92YXI6IEVbJ1ZhcmlhYmxlcyddID0ge31cbiAgZmluYWxpemVkOiBib29sZWFuID0gZmFsc2VcbiAgZXJyb3I6IEVycm9yIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkXG5cbiAgcHJpdmF0ZSBfc3RhdHVzOiBTdGF0dXNDb2RlID0gMjAwXG4gIHByaXZhdGUgX2V4Q3R4OiBGZXRjaEV2ZW50TGlrZSB8IEV4ZWN1dGlvbkNvbnRleHQgfCB1bmRlZmluZWQgLy8gX2V4ZWN1dGlvbkN0eFxuICBwcml2YXRlIF9oOiBIZWFkZXJzIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkIC8vICBfaGVhZGVyc1xuICBwcml2YXRlIF9wSDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZCAvLyBfcHJlcGFyZWRIZWFkZXJzXG4gIHByaXZhdGUgX3JlczogUmVzcG9uc2UgfCB1bmRlZmluZWRcbiAgcHJpdmF0ZSBfaW5pdCA9IHRydWVcbiAgcHJpdmF0ZSBfcmVuZGVyZXI6IFJlbmRlcmVyID0gKGNvbnRlbnQ6IHN0cmluZykgPT4gdGhpcy5odG1sKGNvbnRlbnQpXG4gIHByaXZhdGUgbm90Rm91bmRIYW5kbGVyOiBOb3RGb3VuZEhhbmRsZXI8RT4gPSAoKSA9PiBuZXcgUmVzcG9uc2UoKVxuXG4gIGNvbnN0cnVjdG9yKHJlcTogSG9ub1JlcXVlc3Q8UCwgSVsnb3V0J10+LCBvcHRpb25zPzogQ29udGV4dE9wdGlvbnM8RT4pIHtcbiAgICB0aGlzLnJlcSA9IHJlcVxuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICB0aGlzLl9leEN0eCA9IG9wdGlvbnMuZXhlY3V0aW9uQ3R4XG4gICAgICB0aGlzLmVudiA9IG9wdGlvbnMuZW52XG4gICAgICBpZiAob3B0aW9ucy5ub3RGb3VuZEhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5ub3RGb3VuZEhhbmRsZXIgPSBvcHRpb25zLm5vdEZvdW5kSGFuZGxlclxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldCBldmVudCgpOiBGZXRjaEV2ZW50TGlrZSB7XG4gICAgaWYgKHRoaXMuX2V4Q3R4ICYmICdyZXNwb25kV2l0aCcgaW4gdGhpcy5fZXhDdHgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9leEN0eFxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBFcnJvcignVGhpcyBjb250ZXh0IGhhcyBubyBGZXRjaEV2ZW50JylcbiAgICB9XG4gIH1cblxuICBnZXQgZXhlY3V0aW9uQ3R4KCk6IEV4ZWN1dGlvbkNvbnRleHQge1xuICAgIGlmICh0aGlzLl9leEN0eCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2V4Q3R4IGFzIEV4ZWN1dGlvbkNvbnRleHRcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgRXJyb3IoJ1RoaXMgY29udGV4dCBoYXMgbm8gRXhlY3V0aW9uQ29udGV4dCcpXG4gICAgfVxuICB9XG5cbiAgZ2V0IHJlcygpOiBSZXNwb25zZSB7XG4gICAgdGhpcy5faW5pdCA9IGZhbHNlXG4gICAgcmV0dXJuICh0aGlzLl9yZXMgfHw9IG5ldyBSZXNwb25zZSgnNDA0IE5vdCBGb3VuZCcsIHsgc3RhdHVzOiA0MDQgfSkpXG4gIH1cblxuICBzZXQgcmVzKF9yZXM6IFJlc3BvbnNlIHwgdW5kZWZpbmVkKSB7XG4gICAgdGhpcy5faW5pdCA9IGZhbHNlXG4gICAgaWYgKHRoaXMuX3JlcyAmJiBfcmVzKSB7XG4gICAgICB0aGlzLl9yZXMuaGVhZGVycy5kZWxldGUoJ2NvbnRlbnQtdHlwZScpXG4gICAgICB0aGlzLl9yZXMuaGVhZGVycy5mb3JFYWNoKCh2LCBrKSA9PiB7XG4gICAgICAgIF9yZXMuaGVhZGVycy5zZXQoaywgdilcbiAgICAgIH0pXG4gICAgfVxuICAgIHRoaXMuX3JlcyA9IF9yZXNcbiAgICB0aGlzLmZpbmFsaXplZCA9IHRydWVcbiAgfVxuXG4gIC8qKlxuICAgKiBAZXhwZXJpbWVudGFsXG4gICAqIGBjLnJlbmRlcigpYCBpcyBhbiBleHBlcmltZW50YWwgZmVhdHVyZS5cbiAgICogVGhlIEFQSSBtaWdodCBiZSBjaGFuZ2VkLlxuICAgKi9cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuICAvLyBAdHMtaWdub3JlXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gIHJlbmRlcjogUmVuZGVyZXIgPSAoLi4uYXJnczogYW55W10pID0+IHRoaXMuX3JlbmRlcmVyKC4uLmFyZ3MpXG5cbiAgLyoqXG4gICAqIEBleHBlcmltZW50YWxcbiAgICogYGMuc2V0UmVuZGVyZXIoKWAgaXMgYW4gZXhwZXJpbWVudGFsIGZlYXR1cmUuXG4gICAqIFRoZSBBUEkgbWlnaHQgYmUgY2hhbmdlZC5cbiAgICovXG4gIHNldFJlbmRlcmVyID0gKHJlbmRlcmVyOiBSZW5kZXJlcikgPT4ge1xuICAgIHRoaXMuX3JlbmRlcmVyID0gcmVuZGVyZXJcbiAgfVxuXG4gIGhlYWRlciA9IChuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQsIG9wdGlvbnM/OiB7IGFwcGVuZD86IGJvb2xlYW4gfSk6IHZvaWQgPT4ge1xuICAgIC8vIENsZWFyIHRoZSBoZWFkZXJcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHRoaXMuX2gpIHtcbiAgICAgICAgdGhpcy5faC5kZWxldGUobmFtZSlcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fcEgpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuX3BIW25hbWUudG9Mb2NhbGVMb3dlckNhc2UoKV1cbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmZpbmFsaXplZCkge1xuICAgICAgICB0aGlzLnJlcy5oZWFkZXJzLmRlbGV0ZShuYW1lKVxuICAgICAgfVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnM/LmFwcGVuZCkge1xuICAgICAgaWYgKCF0aGlzLl9oKSB7XG4gICAgICAgIHRoaXMuX2luaXQgPSBmYWxzZVxuICAgICAgICB0aGlzLl9oID0gbmV3IEhlYWRlcnModGhpcy5fcEgpXG4gICAgICAgIHRoaXMuX3BIID0ge31cbiAgICAgIH1cbiAgICAgIHRoaXMuX2guYXBwZW5kKG5hbWUsIHZhbHVlKVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5faCkge1xuICAgICAgICB0aGlzLl9oLnNldChuYW1lLCB2YWx1ZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3BIID8/PSB7fVxuICAgICAgICB0aGlzLl9wSFtuYW1lLnRvTG93ZXJDYXNlKCldID0gdmFsdWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5maW5hbGl6ZWQpIHtcbiAgICAgIGlmIChvcHRpb25zPy5hcHBlbmQpIHtcbiAgICAgICAgdGhpcy5yZXMuaGVhZGVycy5hcHBlbmQobmFtZSwgdmFsdWUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJlcy5oZWFkZXJzLnNldChuYW1lLCB2YWx1ZSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzdGF0dXMgPSAoc3RhdHVzOiBTdGF0dXNDb2RlKTogdm9pZCA9PiB7XG4gICAgdGhpcy5fc3RhdHVzID0gc3RhdHVzXG4gIH1cblxuICBzZXQ6IFNldDxFPiA9IChrZXk6IHN0cmluZywgdmFsdWU6IHVua25vd24pID0+IHtcbiAgICB0aGlzLl92YXIgPz89IHt9XG4gICAgdGhpcy5fdmFyW2tleSBhcyBzdHJpbmddID0gdmFsdWVcbiAgfVxuXG4gIGdldDogR2V0PEU+ID0gKGtleTogc3RyaW5nKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuX3ZhciA/IHRoaXMuX3ZhcltrZXldIDogdW5kZWZpbmVkXG4gIH1cblxuICAvLyBjLnZhci5wcm9wTmFtZSBpcyBhIHJlYWQtb25seVxuICBnZXQgdmFyKCk6IFJlYWRvbmx5PEVbJ1ZhcmlhYmxlcyddPiB7XG4gICAgcmV0dXJuIHsgLi4udGhpcy5fdmFyIH1cbiAgfVxuXG4gIG5ld1Jlc3BvbnNlOiBOZXdSZXNwb25zZSA9IChcbiAgICBkYXRhOiBEYXRhIHwgbnVsbCxcbiAgICBhcmc/OiBTdGF0dXNDb2RlIHwgUmVzcG9uc2VJbml0LFxuICAgIGhlYWRlcnM/OiBIZWFkZXJSZWNvcmRcbiAgKTogUmVzcG9uc2UgPT4ge1xuICAgIC8vIE9wdGltaXplZFxuICAgIGlmICh0aGlzLl9pbml0ICYmICFoZWFkZXJzICYmICFhcmcgJiYgdGhpcy5fc3RhdHVzID09PSAyMDApIHtcbiAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoZGF0YSwge1xuICAgICAgICBoZWFkZXJzOiB0aGlzLl9wSCxcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gUmV0dXJuIFJlc3BvbnNlIGltbWVkaWF0ZWx5IGlmIGFyZyBpcyBSZXNwb25zZUluaXQuXG4gICAgaWYgKGFyZyAmJiB0eXBlb2YgYXJnICE9PSAnbnVtYmVyJykge1xuICAgICAgY29uc3QgcmVzID0gbmV3IFJlc3BvbnNlKGRhdGEsIGFyZylcbiAgICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gdGhpcy5fcEg/LlsnY29udGVudC10eXBlJ11cbiAgICAgIGlmIChjb250ZW50VHlwZSkge1xuICAgICAgICByZXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsIGNvbnRlbnRUeXBlKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc1xuICAgIH1cblxuICAgIGNvbnN0IHN0YXR1cyA9IGFyZyA/PyB0aGlzLl9zdGF0dXNcbiAgICB0aGlzLl9wSCA/Pz0ge31cblxuICAgIHRoaXMuX2ggPz89IG5ldyBIZWFkZXJzKClcbiAgICBmb3IgKGNvbnN0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyh0aGlzLl9wSCkpIHtcbiAgICAgIHRoaXMuX2guc2V0KGssIHYpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3Jlcykge1xuICAgICAgdGhpcy5fcmVzLmhlYWRlcnMuZm9yRWFjaCgodiwgaykgPT4ge1xuICAgICAgICB0aGlzLl9oPy5zZXQoaywgdilcbiAgICAgIH0pXG4gICAgICBmb3IgKGNvbnN0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyh0aGlzLl9wSCkpIHtcbiAgICAgICAgdGhpcy5faC5zZXQoaywgdilcbiAgICAgIH1cbiAgICB9XG5cbiAgICBoZWFkZXJzID8/PSB7fVxuICAgIGZvciAoY29uc3QgW2ssIHZdIG9mIE9iamVjdC5lbnRyaWVzKGhlYWRlcnMpKSB7XG4gICAgICBpZiAodHlwZW9mIHYgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMuX2guc2V0KGssIHYpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9oLmRlbGV0ZShrKVxuICAgICAgICBmb3IgKGNvbnN0IHYyIG9mIHYpIHtcbiAgICAgICAgICB0aGlzLl9oLmFwcGVuZChrLCB2MilcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgUmVzcG9uc2UoZGF0YSwge1xuICAgICAgc3RhdHVzLFxuICAgICAgaGVhZGVyczogdGhpcy5faCxcbiAgICB9KVxuICB9XG5cbiAgYm9keTogQm9keVJlc3BvbmQgPSAoXG4gICAgZGF0YTogRGF0YSB8IG51bGwsXG4gICAgYXJnPzogU3RhdHVzQ29kZSB8IFJlc3BvbnNlSW5pdCxcbiAgICBoZWFkZXJzPzogSGVhZGVyUmVjb3JkXG4gICk6IFJlc3BvbnNlID0+IHtcbiAgICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcidcbiAgICAgID8gdGhpcy5uZXdSZXNwb25zZShkYXRhLCBhcmcsIGhlYWRlcnMpXG4gICAgICA6IHRoaXMubmV3UmVzcG9uc2UoZGF0YSwgYXJnKVxuICB9XG5cbiAgdGV4dDogVGV4dFJlc3BvbmQgPSAoXG4gICAgdGV4dDogc3RyaW5nLFxuICAgIGFyZz86IFN0YXR1c0NvZGUgfCBSZXNwb25zZUluaXQsXG4gICAgaGVhZGVycz86IEhlYWRlclJlY29yZFxuICApOiBSZXNwb25zZSA9PiB7XG4gICAgLy8gSWYgdGhlIGhlYWRlciBpcyBlbXB0eSwgcmV0dXJuIFJlc3BvbnNlIGltbWVkaWF0ZWx5LlxuICAgIC8vIENvbnRlbnQtVHlwZSB3aWxsIGJlIGFkZGVkIGF1dG9tYXRpY2FsbHkgYXMgYHRleHQvcGxhaW5gLlxuICAgIGlmICghdGhpcy5fcEgpIHtcbiAgICAgIGlmICh0aGlzLl9pbml0ICYmICFoZWFkZXJzICYmICFhcmcpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZSh0ZXh0KVxuICAgICAgfVxuICAgICAgdGhpcy5fcEggPSB7fVxuICAgIH1cbiAgICAvLyBJZiBDb250ZW50LVR5cGUgaXMgbm90IHNldCwgd2UgZG9uJ3QgaGF2ZSB0byBzZXQgYHRleHQvcGxhaW5gLlxuICAgIC8vIEZld2VyIHRoZSBoZWFkZXIgdmFsdWVzLCBpdCB3aWxsIGJlIGZhc3Rlci5cbiAgICBpZiAodGhpcy5fcEhbJ2NvbnRlbnQtdHlwZSddKSB7XG4gICAgICB0aGlzLl9wSFsnY29udGVudC10eXBlJ10gPSBURVhUX1BMQUlOXG4gICAgfVxuICAgIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJ1xuICAgICAgPyB0aGlzLm5ld1Jlc3BvbnNlKHRleHQsIGFyZywgaGVhZGVycylcbiAgICAgIDogdGhpcy5uZXdSZXNwb25zZSh0ZXh0LCBhcmcpXG4gIH1cblxuICBqc29uOiBKU09OUmVzcG9uZCA9IDxUID0ge30+KFxuICAgIG9iamVjdDogVCxcbiAgICBhcmc/OiBTdGF0dXNDb2RlIHwgUmVzcG9uc2VJbml0LFxuICAgIGhlYWRlcnM/OiBIZWFkZXJSZWNvcmRcbiAgKSA9PiB7XG4gICAgY29uc3QgYm9keSA9IEpTT04uc3RyaW5naWZ5KG9iamVjdClcbiAgICB0aGlzLl9wSCA/Pz0ge31cbiAgICB0aGlzLl9wSFsnY29udGVudC10eXBlJ10gPSAnYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD1VVEYtOCdcbiAgICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcidcbiAgICAgID8gdGhpcy5uZXdSZXNwb25zZShib2R5LCBhcmcsIGhlYWRlcnMpXG4gICAgICA6IHRoaXMubmV3UmVzcG9uc2UoYm9keSwgYXJnKVxuICB9XG5cbiAganNvblQ6IEpTT05UUmVzcG9uZCA9IDxUPihcbiAgICBvYmplY3Q6IEludGVyZmFjZVRvVHlwZTxUPiBleHRlbmRzIEpTT05WYWx1ZSA/IFQgOiBKU09OVmFsdWUsXG4gICAgYXJnPzogU3RhdHVzQ29kZSB8IFJlc3BvbnNlSW5pdCxcbiAgICBoZWFkZXJzPzogSGVhZGVyUmVjb3JkXG4gICk6IFR5cGVkUmVzcG9uc2U8XG4gICAgSW50ZXJmYWNlVG9UeXBlPFQ+IGV4dGVuZHMgSlNPTlZhbHVlXG4gICAgICA/IEpTT05WYWx1ZSBleHRlbmRzIEludGVyZmFjZVRvVHlwZTxUPlxuICAgICAgICA/IG5ldmVyXG4gICAgICAgIDogVFxuICAgICAgOiBuZXZlclxuICA+ID0+IHtcbiAgICBjb25zdCByZXNwb25zZSA9XG4gICAgICB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyA/IHRoaXMuanNvbihvYmplY3QsIGFyZywgaGVhZGVycykgOiB0aGlzLmpzb24ob2JqZWN0LCBhcmcpXG5cbiAgICByZXR1cm4ge1xuICAgICAgcmVzcG9uc2UsXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgZGF0YTogb2JqZWN0IGFzIGFueSxcbiAgICAgIGZvcm1hdDogJ2pzb24nLFxuICAgICAgc3RhdHVzOiByZXNwb25zZS5zdGF0dXMsXG4gICAgfVxuICB9XG5cbiAgaHRtbDogSFRNTFJlc3BvbmQgPSAoXG4gICAgaHRtbDogc3RyaW5nLFxuICAgIGFyZz86IFN0YXR1c0NvZGUgfCBSZXNwb25zZUluaXQsXG4gICAgaGVhZGVycz86IEhlYWRlclJlY29yZFxuICApOiBSZXNwb25zZSA9PiB7XG4gICAgdGhpcy5fcEggPz89IHt9XG4gICAgdGhpcy5fcEhbJ2NvbnRlbnQtdHlwZSddID0gJ3RleHQvaHRtbDsgY2hhcnNldD1VVEYtOCdcbiAgICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcidcbiAgICAgID8gdGhpcy5uZXdSZXNwb25zZShodG1sLCBhcmcsIGhlYWRlcnMpXG4gICAgICA6IHRoaXMubmV3UmVzcG9uc2UoaHRtbCwgYXJnKVxuICB9XG5cbiAgcmVkaXJlY3QgPSAobG9jYXRpb246IHN0cmluZywgc3RhdHVzOiBTdGF0dXNDb2RlID0gMzAyKTogUmVzcG9uc2UgPT4ge1xuICAgIHRoaXMuX2ggPz89IG5ldyBIZWFkZXJzKClcbiAgICB0aGlzLl9oLnNldCgnTG9jYXRpb24nLCBsb2NhdGlvbilcbiAgICByZXR1cm4gdGhpcy5uZXdSZXNwb25zZShudWxsLCBzdGF0dXMpXG4gIH1cblxuICBzdHJlYW1UZXh0ID0gKFxuICAgIGNiOiAoc3RyZWFtOiBTdHJlYW1pbmdBcGkpID0+IFByb21pc2U8dm9pZD4sXG4gICAgYXJnPzogU3RhdHVzQ29kZSB8IFJlc3BvbnNlSW5pdCxcbiAgICBoZWFkZXJzPzogSGVhZGVyUmVjb3JkXG4gICk6IFJlc3BvbnNlID0+IHtcbiAgICBoZWFkZXJzID8/PSB7fVxuICAgIHRoaXMuaGVhZGVyKCdjb250ZW50LXR5cGUnLCBURVhUX1BMQUlOKVxuICAgIHRoaXMuaGVhZGVyKCd4LWNvbnRlbnQtdHlwZS1vcHRpb25zJywgJ25vc25pZmYnKVxuICAgIHRoaXMuaGVhZGVyKCd0cmFuc2Zlci1lbmNvZGluZycsICdjaHVua2VkJylcbiAgICByZXR1cm4gdGhpcy5zdHJlYW0oY2IsIGFyZywgaGVhZGVycylcbiAgfVxuXG4gIHN0cmVhbSA9IChcbiAgICBjYjogKHN0cmVhbTogU3RyZWFtaW5nQXBpKSA9PiBQcm9taXNlPHZvaWQ+LFxuICAgIGFyZz86IFN0YXR1c0NvZGUgfCBSZXNwb25zZUluaXQsXG4gICAgaGVhZGVycz86IEhlYWRlclJlY29yZFxuICApOiBSZXNwb25zZSA9PiB7XG4gICAgY29uc3QgeyByZWFkYWJsZSwgd3JpdGFibGUgfSA9IG5ldyBUcmFuc2Zvcm1TdHJlYW0oKVxuICAgIGNvbnN0IHN0cmVhbSA9IG5ldyBTdHJlYW1pbmdBcGkod3JpdGFibGUpXG4gICAgY2Ioc3RyZWFtKS5maW5hbGx5KCgpID0+IHN0cmVhbS5jbG9zZSgpKVxuXG4gICAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInXG4gICAgICA/IHRoaXMubmV3UmVzcG9uc2UocmVhZGFibGUsIGFyZywgaGVhZGVycylcbiAgICAgIDogdGhpcy5uZXdSZXNwb25zZShyZWFkYWJsZSwgYXJnKVxuICB9XG5cbiAgLyoqIEBkZXByZWNhdGVkXG4gICAqIFVzZSBDb29raWUgTWlkZGxld2FyZSBpbnN0ZWFkIG9mIGBjLmNvb2tpZSgpYC4gVGhlIGBjLmNvb2tpZSgpYCB3aWxsIGJlIHJlbW92ZWQgaW4gdjQuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqXG4gICAqIGltcG9ydCB7IHNldENvb2tpZSB9IGZyb20gJ2hvbm8vY29va2llJ1xuICAgKiAvLyAuLi5cbiAgICogYXBwLmdldCgnLycsIChjKSA9PiB7XG4gICAqICAgc2V0Q29va2llKGMsICdrZXknLCAndmFsdWUnKVxuICAgKiAgIC8vLi4uXG4gICAqIH0pXG4gICAqL1xuICBjb29raWUgPSAobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBvcHQ/OiBDb29raWVPcHRpb25zKTogdm9pZCA9PiB7XG4gICAgY29uc3QgY29va2llID0gc2VyaWFsaXplKG5hbWUsIHZhbHVlLCBvcHQpXG4gICAgdGhpcy5oZWFkZXIoJ3NldC1jb29raWUnLCBjb29raWUsIHsgYXBwZW5kOiB0cnVlIH0pXG4gIH1cblxuICBub3RGb3VuZCA9ICgpOiBSZXNwb25zZSB8IFByb21pc2U8UmVzcG9uc2U+ID0+IHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIHJldHVybiB0aGlzLm5vdEZvdW5kSGFuZGxlcih0aGlzKVxuICB9XG5cbiAgLyoqIEBkZXByZWNhdGVkXG4gICAqIFVzZSBgZ2V0UnVudGltZUtleSgpYCBleHBvcnRlZCBmcm9tIGBob25vL2FkYXB0ZXJgIGluc3RlYWQgb2YgYGMucnVudGltZSgpYC4gVGhlIGBjLnJ1bnRpbWUoKWAgd2lsbCBiZSByZW1vdmVkIGluIHY0LlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKlxuICAgKiBpbXBvcnQgeyBnZXRSdW50aW1lS2V5IH0gZnJvbSAnaG9uby9hZGFwdGVyJ1xuICAgKiAvLyAuLi5cbiAgICogYXBwLmdldCgnLycsIChjKSA9PiB7XG4gICAqICAgY29uc3Qga2V5ID0gZ2V0UnVudGltZUtleSgpXG4gICAqICAgLy8uLi5cbiAgICogfSlcbiAgICovXG4gIGdldCBydW50aW1lKCk6IFJ1bnRpbWUge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgY29uc3QgZ2xvYmFsID0gZ2xvYmFsVGhpcyBhcyBhbnlcblxuICAgIGlmIChnbG9iYWw/LkRlbm8gIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuICdkZW5vJ1xuICAgIH1cblxuICAgIGlmIChnbG9iYWw/LkJ1biAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gJ2J1bidcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGdsb2JhbD8uV2ViU29ja2V0UGFpciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuICd3b3JrZXJkJ1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZ2xvYmFsPy5FZGdlUnVudGltZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiAnZWRnZS1saWdodCdcbiAgICB9XG5cbiAgICBpZiAoZ2xvYmFsPy5mYXN0bHkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuICdmYXN0bHknXG4gICAgfVxuXG4gICAgaWYgKGdsb2JhbD8uX19sYWdvbl9fICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiAnbGFnb24nXG4gICAgfVxuXG4gICAgaWYgKGdsb2JhbD8ucHJvY2Vzcz8ucmVsZWFzZT8ubmFtZSA9PT0gJ25vZGUnKSB7XG4gICAgICByZXR1cm4gJ25vZGUnXG4gICAgfVxuXG4gICAgcmV0dXJuICdvdGhlcidcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUlBLFNBQVMsU0FBUyxRQUFRLG9CQUFtQjtBQUU3QyxTQUFTLFlBQVksUUFBUSxvQkFBbUI7QUFpRmhELE1BQU0sYUFBYTtBQUVuQixPQUFPLE1BQU07SUFPWCxJQUE2QjtJQUM3QixNQUFxQixDQUFDLEVBQUM7SUFDZixPQUF1QixDQUFDLEVBQUM7SUFDakMsWUFBcUIsS0FBSyxDQUFBO0lBQzFCLFFBQTJCLFVBQVM7SUFFNUIsVUFBc0IsSUFBRztJQUN6QixPQUFxRDtJQUNyRCxLQUEwQixVQUFVLFlBQVk7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