/* eslint-disable @typescript-eslint/no-explicit-any */ /* eslint-disable @typescript-eslint/no-non-null-assertion */ import { parseBody } from './utils/body.ts';
import { parse } from './utils/cookie.ts';
import { getQueryParam, getQueryParams, decodeURIComponent_ } from './utils/url.ts';
export class HonoRequest {
    raw;
    _s;
    vData;
    _p = {};
    path;
    bodyCache = {};
    constructor(request, path = '/', paramStash = []){
        this.raw = request;
        this.path = path;
        this._s = paramStash;
        this.vData = {};
    }
    setParams(params) {
        this._p = params;
    }
    param(key) {
        if (this._s) {
            if (key) {
                const param = this._s[this._p[key]] ?? this._p[key];
                return param ? /\%/.test(param) ? decodeURIComponent_(param) : param : undefined;
            } else {
                const decoded = {};
                const keys = Object.keys(this._p);
                for(let i = 0, len = keys.length; i < len; i++){
                    const key = keys[i];
                    const value = this._s[this._p[key]] ?? this._p[key];
                    if (value && typeof value === 'string') {
                        decoded[key] = /\%/.test(value) ? decodeURIComponent_(value) : value;
                    }
                }
                return decoded;
            }
        }
        return null;
    }
    query(key) {
        return getQueryParam(this.url, key);
    }
    queries(key) {
        return getQueryParams(this.url, key);
    }
    header(name) {
        if (name) return this.raw.headers.get(name.toLowerCase()) ?? undefined;
        const headerData = {};
        this.raw.headers.forEach((value, key)=>{
            headerData[key] = value;
        });
        return headerData;
    }
    cookie(key) {
        const cookie = this.raw.headers.get('Cookie');
        if (!cookie) return;
        const obj = parse(cookie);
        if (key) {
            const value = obj[key];
            return value;
        } else {
            return obj;
        }
    }
    async parseBody(options) {
        if (this.bodyCache.parsedBody) return this.bodyCache.parsedBody;
        const parsedBody = await parseBody(this, options);
        this.bodyCache.parsedBody = parsedBody;
        return parsedBody;
    }
    cachedBody = (key)=>{
        const { bodyCache , raw  } = this;
        const cachedBody = bodyCache[key];
        if (cachedBody) return cachedBody;
        /**
     * If an arrayBuffer cache is exist,
     * use it for creating a text, json, and others.
     */ if (bodyCache.arrayBuffer) {
            return (async ()=>{
                return await new Response(bodyCache.arrayBuffer)[key]();
            })();
        }
        return bodyCache[key] = raw[key]();
    };
    json() {
        return this.cachedBody('json');
    }
    text() {
        return this.cachedBody('text');
    }
    arrayBuffer() {
        return this.cachedBody('arrayBuffer');
    }
    blob() {
        return this.cachedBody('blob');
    }
    formData() {
        return this.cachedBody('formData');
    }
    addValidatedData(target, data) {
        this.vData[target] = data;
    }
    valid(target) {
        return this.vData[target];
    }
    get url() {
        return this.raw.url;
    }
    get method() {
        return this.raw.method;
    }
    /** @deprecated
   * Use `c.req.raw.headers` instead of `c.req.headers`. The `c.req.headers` will be removed in v4.
   * Or you can get the header values with using `c.req.header`.
   * @example
   *
   * app.get('/', (c) => {
   *   const userAgent = c.req.header('User-Agent')
   *   //...
   * })
   */ get headers() {
        return this.raw.headers;
    }
    /** @deprecated
   * Use `c.req.raw.body` instead of `c.req.body`. The `c.req.body` will be removed in v4.
   */ get body() {
        return this.raw.body;
    }
    /** @deprecated
   * Use `c.req.raw.bodyUsed` instead of `c.req.bodyUsed`. The `c.req.bodyUsed` will be removed in v4.
   */ get bodyUsed() {
        return this.raw.bodyUsed;
    }
    /** @deprecated
   * Use `c.req.raw.integrity` instead of `c.req.integrity`. The `c.req.integrity` will be removed in v4.
   */ get integrity() {
        return this.raw.integrity;
    }
    /** @deprecated
   * Use `c.req.raw.keepalive` instead of `c.req.keepalive`. The `c.req.keepalive` will be removed in v4.
   */ get keepalive() {
        return this.raw.keepalive;
    }
    /** @deprecated
   * Use `c.req.raw.referrer` instead of `c.req.referrer`. The `c.req.referrer` will be removed in v4.
   */ get referrer() {
        return this.raw.referrer;
    }
    /** @deprecated
   * Use `c.req.raw.signal` instead of `c.req.signal`. The `c.req.signal` will be removed in v4.
   */ get signal() {
        return this.raw.signal;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvcmVxdWVzdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55ICovXG4vKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbm9uLW51bGwtYXNzZXJ0aW9uICovXG5pbXBvcnQgdHlwZSB7IFBhcmFtSW5kZXhNYXAsIFBhcmFtU3Rhc2gsIFBhcmFtcyB9IGZyb20gJy4vcm91dGVyLnRzJ1xuaW1wb3J0IHR5cGUge1xuICBJbnB1dCxcbiAgSW5wdXRUb0RhdGFCeVRhcmdldCxcbiAgUGFyYW1LZXlzLFxuICBQYXJhbUtleVRvUmVjb3JkLFxuICBSZW1vdmVRdWVzdGlvbixcbiAgVW5kZWZpbmVkSWZIYXZpbmdRdWVzdGlvbixcbiAgVmFsaWRhdGlvblRhcmdldHMsXG59IGZyb20gJy4vdHlwZXMudHMnXG5pbXBvcnQgeyBwYXJzZUJvZHkgfSBmcm9tICcuL3V0aWxzL2JvZHkudHMnXG5pbXBvcnQgdHlwZSB7IEJvZHlEYXRhLCBQYXJzZUJvZHlPcHRpb25zIH0gZnJvbSAnLi91dGlscy9ib2R5LnRzJ1xuaW1wb3J0IHR5cGUgeyBDb29raWUgfSBmcm9tICcuL3V0aWxzL2Nvb2tpZS50cydcbmltcG9ydCB7IHBhcnNlIH0gZnJvbSAnLi91dGlscy9jb29raWUudHMnXG5pbXBvcnQgdHlwZSB7IFVuaW9uVG9JbnRlcnNlY3Rpb24gfSBmcm9tICcuL3V0aWxzL3R5cGVzLnRzJ1xuaW1wb3J0IHsgZ2V0UXVlcnlQYXJhbSwgZ2V0UXVlcnlQYXJhbXMsIGRlY29kZVVSSUNvbXBvbmVudF8gfSBmcm9tICcuL3V0aWxzL3VybC50cydcblxudHlwZSBCb2R5ID0ge1xuICBqc29uOiBhbnlcbiAgdGV4dDogc3RyaW5nXG4gIGFycmF5QnVmZmVyOiBBcnJheUJ1ZmZlclxuICBibG9iOiBCbG9iXG4gIGZvcm1EYXRhOiBGb3JtRGF0YVxufVxudHlwZSBCb2R5Q2FjaGUgPSBQYXJ0aWFsPEJvZHkgJiB7IHBhcnNlZEJvZHk6IEJvZHlEYXRhIH0+XG5cbmV4cG9ydCBjbGFzcyBIb25vUmVxdWVzdDxQIGV4dGVuZHMgc3RyaW5nID0gJy8nLCBJIGV4dGVuZHMgSW5wdXRbJ291dCddID0ge30+IHtcbiAgcmF3OiBSZXF1ZXN0XG5cbiAgcHJpdmF0ZSBfczogUGFyYW1TdGFzaFxuICBwcml2YXRlIHZEYXRhOiB7IFtLIGluIGtleW9mIFZhbGlkYXRpb25UYXJnZXRzXT86IHt9IH0gLy8gU2hvcnQgbmFtZSBvZiB2YWxpZGF0ZWREYXRhXG4gIHByaXZhdGUgX3A6IFBhcmFtSW5kZXhNYXAgfCBQYXJhbXMgPSB7fVxuICBwYXRoOiBzdHJpbmdcbiAgYm9keUNhY2hlOiBCb2R5Q2FjaGUgPSB7fVxuXG4gIGNvbnN0cnVjdG9yKHJlcXVlc3Q6IFJlcXVlc3QsIHBhdGg6IHN0cmluZyA9ICcvJywgcGFyYW1TdGFzaDogUGFyYW1TdGFzaCA9IFtdKSB7XG4gICAgdGhpcy5yYXcgPSByZXF1ZXN0XG4gICAgdGhpcy5wYXRoID0gcGF0aFxuICAgIHRoaXMuX3MgPSBwYXJhbVN0YXNoXG4gICAgdGhpcy52RGF0YSA9IHt9XG4gIH1cblxuICBzZXRQYXJhbXMocGFyYW1zOiBQYXJhbUluZGV4TWFwIHwgUGFyYW1zKSB7XG4gICAgdGhpcy5fcCA9IHBhcmFtc1xuICB9XG5cbiAgcGFyYW08UDIgZXh0ZW5kcyBzdHJpbmcgPSBQPihcbiAgICBrZXk6IFJlbW92ZVF1ZXN0aW9uPFBhcmFtS2V5czxQMj4+XG4gICk6IFVuZGVmaW5lZElmSGF2aW5nUXVlc3Rpb248UGFyYW1LZXlzPFAyPj5cbiAgcGFyYW08UDIgZXh0ZW5kcyBzdHJpbmcgPSBQPigpOiBVbmlvblRvSW50ZXJzZWN0aW9uPFBhcmFtS2V5VG9SZWNvcmQ8UGFyYW1LZXlzPFAyPj4+XG4gIHBhcmFtKGtleT86IHN0cmluZyk6IHVua25vd24ge1xuICAgIGlmICh0aGlzLl9zKSB7XG4gICAgICBpZiAoa2V5KSB7XG4gICAgICAgIGNvbnN0IHBhcmFtID0gdGhpcy5fc1t0aGlzLl9wW2tleV0gYXMgYW55XSA/PyB0aGlzLl9wW2tleV1cbiAgICAgICAgcmV0dXJuIHBhcmFtID8gKC9cXCUvLnRlc3QocGFyYW0pID8gZGVjb2RlVVJJQ29tcG9uZW50XyhwYXJhbSkgOiBwYXJhbSkgOiB1bmRlZmluZWRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGRlY29kZWQ6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fVxuXG4gICAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLl9wKVxuICAgICAgICBmb3IgKGxldCBpID0gMCwgbGVuID0ga2V5cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgIGNvbnN0IGtleSA9IGtleXNbaV1cbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuX3NbdGhpcy5fcFtrZXldIGFzIGFueV0gPz8gdGhpcy5fcFtrZXldXG4gICAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGRlY29kZWRba2V5XSA9IC9cXCUvLnRlc3QodmFsdWUpID8gZGVjb2RlVVJJQ29tcG9uZW50Xyh2YWx1ZSkgOiB2YWx1ZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBkZWNvZGVkXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBxdWVyeShrZXk6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZFxuICBxdWVyeSgpOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+XG4gIHF1ZXJ5KGtleT86IHN0cmluZykge1xuICAgIHJldHVybiBnZXRRdWVyeVBhcmFtKHRoaXMudXJsLCBrZXkpXG4gIH1cblxuICBxdWVyaWVzKGtleTogc3RyaW5nKTogc3RyaW5nW10gfCB1bmRlZmluZWRcbiAgcXVlcmllcygpOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT5cbiAgcXVlcmllcyhrZXk/OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gZ2V0UXVlcnlQYXJhbXModGhpcy51cmwsIGtleSlcbiAgfVxuXG4gIGhlYWRlcihuYW1lOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgaGVhZGVyKCk6IFJlY29yZDxzdHJpbmcsIHN0cmluZz5cbiAgaGVhZGVyKG5hbWU/OiBzdHJpbmcpIHtcbiAgICBpZiAobmFtZSkgcmV0dXJuIHRoaXMucmF3LmhlYWRlcnMuZ2V0KG5hbWUudG9Mb3dlckNhc2UoKSkgPz8gdW5kZWZpbmVkXG5cbiAgICBjb25zdCBoZWFkZXJEYXRhOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCB1bmRlZmluZWQ+ID0ge31cbiAgICB0aGlzLnJhdy5oZWFkZXJzLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgIGhlYWRlckRhdGFba2V5XSA9IHZhbHVlXG4gICAgfSlcbiAgICByZXR1cm4gaGVhZGVyRGF0YVxuICB9XG5cbiAgLyoqIEBkZXByZWNhdGVkXG4gICAqIFVzZSBDb29raWUgTWlkZGxld2FyZSBpbnN0ZWFkIG9mIGBjLnJlcS5jb29raWUoKWAuIFRoZSBgYy5yZXEuY29va2llKClgIHdpbGwgYmUgcmVtb3ZlZCBpbiB2NC5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICpcbiAgICogaW1wb3J0IHsgZ2V0Q29va2llIH0gZnJvbSAnaG9uby9jb29raWUnXG4gICAqIC8vIC4uLlxuICAgKiBhcHAuZ2V0KCcvJywgKGMpID0+IGMudGV4dChnZXRDb29raWUoYywgJ2Nvb2tpZS1uYW1lJykpKVxuICAgKi9cbiAgY29va2llKGtleTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkXG5cbiAgLyoqIEBkZXByZWNhdGVkXG4gICAqIFVzZSBDb29raWUgTWlkZGxld2FyZSBpbnN0ZWFkIG9mIGBjLnJlcS5jb29raWUoKWAuIFRoZSBgYy5yZXEuY29va2llKClgIHdpbGwgYmUgcmVtb3ZlZCBpbiB2NC5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICpcbiAgICogaW1wb3J0IHsgZ2V0Q29va2llIH0gZnJvbSAnaG9uby9jb29raWUnXG4gICAqIC8vIC4uLlxuICAgKiBhcHAuZ2V0KCcvJywgKGMpID0+IGMuanNvbihnZXRDb29raWUoYykpKVxuICAgKi9cbiAgY29va2llKCk6IENvb2tpZVxuXG4gIGNvb2tpZShrZXk/OiBzdHJpbmcpIHtcbiAgICBjb25zdCBjb29raWUgPSB0aGlzLnJhdy5oZWFkZXJzLmdldCgnQ29va2llJylcbiAgICBpZiAoIWNvb2tpZSkgcmV0dXJuXG4gICAgY29uc3Qgb2JqID0gcGFyc2UoY29va2llKVxuICAgIGlmIChrZXkpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gb2JqW2tleV1cbiAgICAgIHJldHVybiB2YWx1ZVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb2JqXG4gICAgfVxuICB9XG5cbiAgYXN5bmMgcGFyc2VCb2R5PFQgZXh0ZW5kcyBCb2R5RGF0YSA9IEJvZHlEYXRhPihvcHRpb25zPzogUGFyc2VCb2R5T3B0aW9ucyk6IFByb21pc2U8VD4ge1xuICAgIGlmICh0aGlzLmJvZHlDYWNoZS5wYXJzZWRCb2R5KSByZXR1cm4gdGhpcy5ib2R5Q2FjaGUucGFyc2VkQm9keSBhcyBUXG4gICAgY29uc3QgcGFyc2VkQm9keSA9IGF3YWl0IHBhcnNlQm9keTxUPih0aGlzLCBvcHRpb25zKVxuICAgIHRoaXMuYm9keUNhY2hlLnBhcnNlZEJvZHkgPSBwYXJzZWRCb2R5XG4gICAgcmV0dXJuIHBhcnNlZEJvZHlcbiAgfVxuXG4gIHByaXZhdGUgY2FjaGVkQm9keSA9IChrZXk6IGtleW9mIEJvZHkpID0+IHtcbiAgICBjb25zdCB7IGJvZHlDYWNoZSwgcmF3IH0gPSB0aGlzXG4gICAgY29uc3QgY2FjaGVkQm9keSA9IGJvZHlDYWNoZVtrZXldXG4gICAgaWYgKGNhY2hlZEJvZHkpIHJldHVybiBjYWNoZWRCb2R5XG4gICAgLyoqXG4gICAgICogSWYgYW4gYXJyYXlCdWZmZXIgY2FjaGUgaXMgZXhpc3QsXG4gICAgICogdXNlIGl0IGZvciBjcmVhdGluZyBhIHRleHQsIGpzb24sIGFuZCBvdGhlcnMuXG4gICAgICovXG4gICAgaWYgKGJvZHlDYWNoZS5hcnJheUJ1ZmZlcikge1xuICAgICAgcmV0dXJuIChhc3luYyAoKSA9PiB7XG4gICAgICAgIHJldHVybiBhd2FpdCBuZXcgUmVzcG9uc2UoYm9keUNhY2hlLmFycmF5QnVmZmVyKVtrZXldKClcbiAgICAgIH0pKClcbiAgICB9XG4gICAgcmV0dXJuIChib2R5Q2FjaGVba2V5XSA9IHJhd1trZXldKCkpXG4gIH1cblxuICBqc29uPFQgPSBhbnk+KCk6IFByb21pc2U8VD4ge1xuICAgIHJldHVybiB0aGlzLmNhY2hlZEJvZHkoJ2pzb24nKVxuICB9XG5cbiAgdGV4dCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLmNhY2hlZEJvZHkoJ3RleHQnKVxuICB9XG5cbiAgYXJyYXlCdWZmZXIoKTogUHJvbWlzZTxBcnJheUJ1ZmZlcj4ge1xuICAgIHJldHVybiB0aGlzLmNhY2hlZEJvZHkoJ2FycmF5QnVmZmVyJylcbiAgfVxuXG4gIGJsb2IoKTogUHJvbWlzZTxCbG9iPiB7XG4gICAgcmV0dXJuIHRoaXMuY2FjaGVkQm9keSgnYmxvYicpXG4gIH1cblxuICBmb3JtRGF0YSgpOiBQcm9taXNlPEZvcm1EYXRhPiB7XG4gICAgcmV0dXJuIHRoaXMuY2FjaGVkQm9keSgnZm9ybURhdGEnKVxuICB9XG5cbiAgYWRkVmFsaWRhdGVkRGF0YSh0YXJnZXQ6IGtleW9mIFZhbGlkYXRpb25UYXJnZXRzLCBkYXRhOiB7fSkge1xuICAgIHRoaXMudkRhdGFbdGFyZ2V0XSA9IGRhdGFcbiAgfVxuXG4gIHZhbGlkPFQgZXh0ZW5kcyBrZXlvZiBJICYga2V5b2YgVmFsaWRhdGlvblRhcmdldHM+KHRhcmdldDogVCk6IElucHV0VG9EYXRhQnlUYXJnZXQ8SSwgVD5cbiAgdmFsaWQodGFyZ2V0OiBrZXlvZiBWYWxpZGF0aW9uVGFyZ2V0cykge1xuICAgIHJldHVybiB0aGlzLnZEYXRhW3RhcmdldF0gYXMgdW5rbm93blxuICB9XG5cbiAgZ2V0IHVybCgpIHtcbiAgICByZXR1cm4gdGhpcy5yYXcudXJsXG4gIH1cblxuICBnZXQgbWV0aG9kKCkge1xuICAgIHJldHVybiB0aGlzLnJhdy5tZXRob2RcbiAgfVxuXG4gIC8qKiBAZGVwcmVjYXRlZFxuICAgKiBVc2UgYGMucmVxLnJhdy5oZWFkZXJzYCBpbnN0ZWFkIG9mIGBjLnJlcS5oZWFkZXJzYC4gVGhlIGBjLnJlcS5oZWFkZXJzYCB3aWxsIGJlIHJlbW92ZWQgaW4gdjQuXG4gICAqIE9yIHlvdSBjYW4gZ2V0IHRoZSBoZWFkZXIgdmFsdWVzIHdpdGggdXNpbmcgYGMucmVxLmhlYWRlcmAuXG4gICAqIEBleGFtcGxlXG4gICAqXG4gICAqIGFwcC5nZXQoJy8nLCAoYykgPT4ge1xuICAgKiAgIGNvbnN0IHVzZXJBZ2VudCA9IGMucmVxLmhlYWRlcignVXNlci1BZ2VudCcpXG4gICAqICAgLy8uLi5cbiAgICogfSlcbiAgICovXG4gIGdldCBoZWFkZXJzKCkge1xuICAgIHJldHVybiB0aGlzLnJhdy5oZWFkZXJzXG4gIH1cblxuICAvKiogQGRlcHJlY2F0ZWRcbiAgICogVXNlIGBjLnJlcS5yYXcuYm9keWAgaW5zdGVhZCBvZiBgYy5yZXEuYm9keWAuIFRoZSBgYy5yZXEuYm9keWAgd2lsbCBiZSByZW1vdmVkIGluIHY0LlxuICAgKi9cbiAgZ2V0IGJvZHkoKSB7XG4gICAgcmV0dXJuIHRoaXMucmF3LmJvZHlcbiAgfVxuXG4gIC8qKiBAZGVwcmVjYXRlZFxuICAgKiBVc2UgYGMucmVxLnJhdy5ib2R5VXNlZGAgaW5zdGVhZCBvZiBgYy5yZXEuYm9keVVzZWRgLiBUaGUgYGMucmVxLmJvZHlVc2VkYCB3aWxsIGJlIHJlbW92ZWQgaW4gdjQuXG4gICAqL1xuICBnZXQgYm9keVVzZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMucmF3LmJvZHlVc2VkXG4gIH1cblxuICAvKiogQGRlcHJlY2F0ZWRcbiAgICogVXNlIGBjLnJlcS5yYXcuaW50ZWdyaXR5YCBpbnN0ZWFkIG9mIGBjLnJlcS5pbnRlZ3JpdHlgLiBUaGUgYGMucmVxLmludGVncml0eWAgd2lsbCBiZSByZW1vdmVkIGluIHY0LlxuICAgKi9cbiAgZ2V0IGludGVncml0eSgpIHtcbiAgICByZXR1cm4gdGhpcy5yYXcuaW50ZWdyaXR5XG4gIH1cblxuICAvKiogQGRlcHJlY2F0ZWRcbiAgICogVXNlIGBjLnJlcS5yYXcua2VlcGFsaXZlYCBpbnN0ZWFkIG9mIGBjLnJlcS5rZWVwYWxpdmVgLiBUaGUgYGMucmVxLmtlZXBhbGl2ZWAgd2lsbCBiZSByZW1vdmVkIGluIHY0LlxuICAgKi9cbiAgZ2V0IGtlZXBhbGl2ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5yYXcua2VlcGFsaXZlXG4gIH1cblxuICAvKiogQGRlcHJlY2F0ZWRcbiAgICogVXNlIGBjLnJlcS5yYXcucmVmZXJyZXJgIGluc3RlYWQgb2YgYGMucmVxLnJlZmVycmVyYC4gVGhlIGBjLnJlcS5yZWZlcnJlcmAgd2lsbCBiZSByZW1vdmVkIGluIHY0LlxuICAgKi9cbiAgZ2V0IHJlZmVycmVyKCkge1xuICAgIHJldHVybiB0aGlzLnJhdy5yZWZlcnJlclxuICB9XG5cbiAgLyoqIEBkZXByZWNhdGVkXG4gICAqIFVzZSBgYy5yZXEucmF3LnNpZ25hbGAgaW5zdGVhZCBvZiBgYy5yZXEuc2lnbmFsYC4gVGhlIGBjLnJlcS5zaWduYWxgIHdpbGwgYmUgcmVtb3ZlZCBpbiB2NC5cbiAgICovXG4gIGdldCBzaWduYWwoKSB7XG4gICAgcmV0dXJuIHRoaXMucmF3LnNpZ25hbFxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEscURBQXFELEdBQ3JELDJEQUEyRCxHQVczRCxTQUFTLFNBQVMsUUFBUSxrQkFBaUI7QUFHM0MsU0FBUyxLQUFLLFFBQVEsb0JBQW1CO0FBRXpDLFNBQVMsYUFBYSxFQUFFLGNBQWMsRUFBRSxtQkFBbUIsUUFBUSxpQkFBZ0I7QUFX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