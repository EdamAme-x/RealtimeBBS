import { serialize } from '../utils/cookie.ts';
import { deepMerge, mergePath, removeIndexString, replaceUrlParam } from './utils.ts';
const createProxy = (callback, path)=>{
    const proxy = new Proxy(()=>{}, {
        get (_obj, key) {
            if (typeof key !== 'string') return undefined;
            return createProxy(callback, [
                ...path,
                key
            ]);
        },
        apply (_1, _2, args) {
            return callback({
                path,
                args
            });
        }
    });
    return proxy;
};
class ClientRequestImpl {
    url;
    method;
    queryParams = undefined;
    pathParams = {};
    rBody;
    cType = undefined;
    constructor(url, method){
        this.url = url;
        this.method = method;
    }
    fetch = (args, opt)=>{
        if (args) {
            if (args.query) {
                for (const [k, v] of Object.entries(args.query)){
                    if (v === undefined) {
                        continue;
                    }
                    this.queryParams ||= new URLSearchParams();
                    if (Array.isArray(v)) {
                        for (const v2 of v){
                            this.queryParams.append(k, v2);
                        }
                    } else {
                        this.queryParams.set(k, v);
                    }
                }
            }
            if (args.queries) {
                for (const [k, v] of Object.entries(args.queries)){
                    for (const v2 of v){
                        this.queryParams ||= new URLSearchParams();
                        this.queryParams.append(k, v2);
                    }
                }
            }
            if (args.form) {
                const form = new FormData();
                for (const [k, v] of Object.entries(args.form)){
                    form.append(k, v);
                }
                this.rBody = form;
            }
            if (args.json) {
                this.rBody = JSON.stringify(args.json);
                this.cType = 'application/json';
            }
            if (args.param) {
                this.pathParams = args.param;
            }
        }
        let methodUpperCase = this.method.toUpperCase();
        let setBody = !(methodUpperCase === 'GET' || methodUpperCase === 'HEAD');
        const headerValues = {
            ...args?.header ?? {},
            ...opt?.headers ? opt.headers : {}
        };
        if (args?.cookie) {
            const cookies = [];
            for (const [key, value] of Object.entries(args.cookie)){
                cookies.push(serialize(key, value, {
                    path: '/'
                }));
            }
            headerValues['Cookie'] = cookies.join(',');
        }
        if (this.cType) headerValues['Content-Type'] = this.cType;
        const headers = new Headers(headerValues ?? undefined);
        let url = this.url;
        url = removeIndexString(url);
        url = replaceUrlParam(url, this.pathParams);
        if (this.queryParams) {
            url = url + '?' + this.queryParams.toString();
        }
        methodUpperCase = this.method.toUpperCase();
        setBody = !(methodUpperCase === 'GET' || methodUpperCase === 'HEAD');
        // Pass URL string to 1st arg for testing with MSW and node-fetch
        return (opt?.fetch || fetch)(url, {
            body: setBody ? this.rBody : undefined,
            method: methodUpperCase,
            headers: headers
        });
    };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const hc = (baseUrl, options)=>createProxy((opts)=>{
        const parts = [
            ...opts.path
        ];
        let method = '';
        if (/^\$/.test(parts[parts.length - 1])) {
            const last = parts.pop();
            if (last) {
                method = last.replace(/^\$/, '');
            }
        }
        const path = parts.join('/');
        const url = mergePath(baseUrl, path);
        if (method === 'url') {
            return new URL(url);
        }
        const req = new ClientRequestImpl(url, method);
        if (method) {
            options ??= {};
            const args = deepMerge(options, {
                ...opts.args[1] ?? {}
            });
            return req.fetch(opts.args[0], args);
        }
        return req;
    }, []);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvY2xpZW50L2NsaWVudC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEhvbm8gfSBmcm9tICcuLi9ob25vLnRzJ1xuaW1wb3J0IHR5cGUgeyBWYWxpZGF0aW9uVGFyZ2V0cyB9IGZyb20gJy4uL3R5cGVzLnRzJ1xuaW1wb3J0IHsgc2VyaWFsaXplIH0gZnJvbSAnLi4vdXRpbHMvY29va2llLnRzJ1xuaW1wb3J0IHR5cGUgeyBVbmlvblRvSW50ZXJzZWN0aW9uIH0gZnJvbSAnLi4vdXRpbHMvdHlwZXMudHMnXG5pbXBvcnQgdHlwZSB7IENhbGxiYWNrLCBDbGllbnQsIENsaWVudFJlcXVlc3RPcHRpb25zIH0gZnJvbSAnLi90eXBlcy50cydcbmltcG9ydCB7IGRlZXBNZXJnZSwgbWVyZ2VQYXRoLCByZW1vdmVJbmRleFN0cmluZywgcmVwbGFjZVVybFBhcmFtIH0gZnJvbSAnLi91dGlscy50cydcblxuY29uc3QgY3JlYXRlUHJveHkgPSAoY2FsbGJhY2s6IENhbGxiYWNrLCBwYXRoOiBzdHJpbmdbXSkgPT4ge1xuICBjb25zdCBwcm94eTogdW5rbm93biA9IG5ldyBQcm94eSgoKSA9PiB7fSwge1xuICAgIGdldChfb2JqLCBrZXkpIHtcbiAgICAgIGlmICh0eXBlb2Yga2V5ICE9PSAnc3RyaW5nJykgcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgcmV0dXJuIGNyZWF0ZVByb3h5KGNhbGxiYWNrLCBbLi4ucGF0aCwga2V5XSlcbiAgICB9LFxuICAgIGFwcGx5KF8xLCBfMiwgYXJncykge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKHtcbiAgICAgICAgcGF0aCxcbiAgICAgICAgYXJncyxcbiAgICAgIH0pXG4gICAgfSxcbiAgfSlcbiAgcmV0dXJuIHByb3h5XG59XG5cbmNsYXNzIENsaWVudFJlcXVlc3RJbXBsIHtcbiAgcHJpdmF0ZSB1cmw6IHN0cmluZ1xuICBwcml2YXRlIG1ldGhvZDogc3RyaW5nXG4gIHByaXZhdGUgcXVlcnlQYXJhbXM6IFVSTFNlYXJjaFBhcmFtcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZFxuICBwcml2YXRlIHBhdGhQYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fVxuICBwcml2YXRlIHJCb2R5OiBCb2R5SW5pdCB8IHVuZGVmaW5lZFxuICBwcml2YXRlIGNUeXBlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWRcblxuICBjb25zdHJ1Y3Rvcih1cmw6IHN0cmluZywgbWV0aG9kOiBzdHJpbmcpIHtcbiAgICB0aGlzLnVybCA9IHVybFxuICAgIHRoaXMubWV0aG9kID0gbWV0aG9kXG4gIH1cbiAgZmV0Y2ggPSAoXG4gICAgYXJncz86IFZhbGlkYXRpb25UYXJnZXRzICYge1xuICAgICAgcGFyYW0/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+XG4gICAgfSxcbiAgICBvcHQ/OiBDbGllbnRSZXF1ZXN0T3B0aW9uc1xuICApID0+IHtcbiAgICBpZiAoYXJncykge1xuICAgICAgaWYgKGFyZ3MucXVlcnkpIHtcbiAgICAgICAgZm9yIChjb25zdCBbaywgdl0gb2YgT2JqZWN0LmVudHJpZXMoYXJncy5xdWVyeSkpIHtcbiAgICAgICAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMucXVlcnlQYXJhbXMgfHw9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKVxuICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHYpKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHYyIG9mIHYpIHtcbiAgICAgICAgICAgICAgdGhpcy5xdWVyeVBhcmFtcy5hcHBlbmQoaywgdjIpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucXVlcnlQYXJhbXMuc2V0KGssIHYpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChhcmdzLnF1ZXJpZXMpIHtcbiAgICAgICAgZm9yIChjb25zdCBbaywgdl0gb2YgT2JqZWN0LmVudHJpZXMoYXJncy5xdWVyaWVzKSkge1xuICAgICAgICAgIGZvciAoY29uc3QgdjIgb2Ygdikge1xuICAgICAgICAgICAgdGhpcy5xdWVyeVBhcmFtcyB8fD0gbmV3IFVSTFNlYXJjaFBhcmFtcygpXG4gICAgICAgICAgICB0aGlzLnF1ZXJ5UGFyYW1zLmFwcGVuZChrLCB2MilcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGFyZ3MuZm9ybSkge1xuICAgICAgICBjb25zdCBmb3JtID0gbmV3IEZvcm1EYXRhKClcbiAgICAgICAgZm9yIChjb25zdCBbaywgdl0gb2YgT2JqZWN0LmVudHJpZXMoYXJncy5mb3JtKSkge1xuICAgICAgICAgIGZvcm0uYXBwZW5kKGssIHYpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yQm9keSA9IGZvcm1cbiAgICAgIH1cblxuICAgICAgaWYgKGFyZ3MuanNvbikge1xuICAgICAgICB0aGlzLnJCb2R5ID0gSlNPTi5zdHJpbmdpZnkoYXJncy5qc29uKVxuICAgICAgICB0aGlzLmNUeXBlID0gJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgICB9XG5cbiAgICAgIGlmIChhcmdzLnBhcmFtKSB7XG4gICAgICAgIHRoaXMucGF0aFBhcmFtcyA9IGFyZ3MucGFyYW1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgbWV0aG9kVXBwZXJDYXNlID0gdGhpcy5tZXRob2QudG9VcHBlckNhc2UoKVxuICAgIGxldCBzZXRCb2R5ID0gIShtZXRob2RVcHBlckNhc2UgPT09ICdHRVQnIHx8IG1ldGhvZFVwcGVyQ2FzZSA9PT0gJ0hFQUQnKVxuXG4gICAgY29uc3QgaGVhZGVyVmFsdWVzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICAgLi4uKGFyZ3M/LmhlYWRlciA/PyB7fSksXG4gICAgICAuLi4ob3B0Py5oZWFkZXJzID8gb3B0LmhlYWRlcnMgOiB7fSksXG4gICAgfVxuXG4gICAgaWYgKGFyZ3M/LmNvb2tpZSkge1xuICAgICAgY29uc3QgY29va2llczogc3RyaW5nW10gPSBbXVxuICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoYXJncy5jb29raWUpKSB7XG4gICAgICAgIGNvb2tpZXMucHVzaChzZXJpYWxpemUoa2V5LCB2YWx1ZSwgeyBwYXRoOiAnLycgfSkpXG4gICAgICB9XG4gICAgICBoZWFkZXJWYWx1ZXNbJ0Nvb2tpZSddID0gY29va2llcy5qb2luKCcsJylcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jVHlwZSkgaGVhZGVyVmFsdWVzWydDb250ZW50LVR5cGUnXSA9IHRoaXMuY1R5cGVcblxuICAgIGNvbnN0IGhlYWRlcnMgPSBuZXcgSGVhZGVycyhoZWFkZXJWYWx1ZXMgPz8gdW5kZWZpbmVkKVxuICAgIGxldCB1cmwgPSB0aGlzLnVybFxuXG4gICAgdXJsID0gcmVtb3ZlSW5kZXhTdHJpbmcodXJsKVxuICAgIHVybCA9IHJlcGxhY2VVcmxQYXJhbSh1cmwsIHRoaXMucGF0aFBhcmFtcylcblxuICAgIGlmICh0aGlzLnF1ZXJ5UGFyYW1zKSB7XG4gICAgICB1cmwgPSB1cmwgKyAnPycgKyB0aGlzLnF1ZXJ5UGFyYW1zLnRvU3RyaW5nKClcbiAgICB9XG4gICAgbWV0aG9kVXBwZXJDYXNlID0gdGhpcy5tZXRob2QudG9VcHBlckNhc2UoKVxuICAgIHNldEJvZHkgPSAhKG1ldGhvZFVwcGVyQ2FzZSA9PT0gJ0dFVCcgfHwgbWV0aG9kVXBwZXJDYXNlID09PSAnSEVBRCcpXG5cbiAgICAvLyBQYXNzIFVSTCBzdHJpbmcgdG8gMXN0IGFyZyBmb3IgdGVzdGluZyB3aXRoIE1TVyBhbmQgbm9kZS1mZXRjaFxuICAgIHJldHVybiAob3B0Py5mZXRjaCB8fCBmZXRjaCkodXJsLCB7XG4gICAgICBib2R5OiBzZXRCb2R5ID8gdGhpcy5yQm9keSA6IHVuZGVmaW5lZCxcbiAgICAgIG1ldGhvZDogbWV0aG9kVXBwZXJDYXNlLFxuICAgICAgaGVhZGVyczogaGVhZGVycyxcbiAgICB9KVxuICB9XG59XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG5leHBvcnQgY29uc3QgaGMgPSA8VCBleHRlbmRzIEhvbm88YW55LCBhbnksIGFueT4+KFxuICBiYXNlVXJsOiBzdHJpbmcsXG4gIG9wdGlvbnM/OiBDbGllbnRSZXF1ZXN0T3B0aW9uc1xuKSA9PlxuICBjcmVhdGVQcm94eSgob3B0cykgPT4ge1xuICAgIGNvbnN0IHBhcnRzID0gWy4uLm9wdHMucGF0aF1cblxuICAgIGxldCBtZXRob2QgPSAnJ1xuICAgIGlmICgvXlxcJC8udGVzdChwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXSkpIHtcbiAgICAgIGNvbnN0IGxhc3QgPSBwYXJ0cy5wb3AoKVxuICAgICAgaWYgKGxhc3QpIHtcbiAgICAgICAgbWV0aG9kID0gbGFzdC5yZXBsYWNlKC9eXFwkLywgJycpXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgcGF0aCA9IHBhcnRzLmpvaW4oJy8nKVxuICAgIGNvbnN0IHVybCA9IG1lcmdlUGF0aChiYXNlVXJsLCBwYXRoKVxuICAgIGlmIChtZXRob2QgPT09ICd1cmwnKSB7XG4gICAgICByZXR1cm4gbmV3IFVSTCh1cmwpXG4gICAgfVxuXG4gICAgY29uc3QgcmVxID0gbmV3IENsaWVudFJlcXVlc3RJbXBsKHVybCwgbWV0aG9kKVxuICAgIGlmIChtZXRob2QpIHtcbiAgICAgIG9wdGlvbnMgPz89IHt9XG4gICAgICBjb25zdCBhcmdzID0gZGVlcE1lcmdlPENsaWVudFJlcXVlc3RPcHRpb25zPihvcHRpb25zLCB7IC4uLihvcHRzLmFyZ3NbMV0gPz8ge30pIH0pXG4gICAgICByZXR1cm4gcmVxLmZldGNoKG9wdHMuYXJnc1swXSwgYXJncylcbiAgICB9XG4gICAgcmV0dXJuIHJlcVxuICB9LCBbXSkgYXMg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