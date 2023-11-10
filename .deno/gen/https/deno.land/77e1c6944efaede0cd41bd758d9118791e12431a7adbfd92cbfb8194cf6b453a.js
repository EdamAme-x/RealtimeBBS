/* eslint-disable @typescript-eslint/ban-ts-comment */ import { METHOD_NAME_ALL, METHODS, UnsupportedPathError } from '../../router.ts';
import { checkOptionalParameter } from '../../utils/url.ts';
import { PATH_ERROR } from './node.ts';
import { Trie } from './trie.ts';
const methodNames = [
    METHOD_NAME_ALL,
    ...METHODS
].map((method)=>method.toUpperCase());
const emptyParam = [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nullMatcher = [
    /^$/,
    [],
    {}
];
let wildcardRegExpCache = {};
function buildWildcardRegExp(path) {
    return wildcardRegExpCache[path] ??= new RegExp(path === '*' ? '' : `^${path.replace(/\/\*/, '(?:|/.*)')}$`);
}
function clearWildcardRegExpCache() {
    wildcardRegExpCache = {};
}
function buildMatcherFromPreprocessedRoutes(routes) {
    const trie = new Trie();
    const handlerData = [];
    if (routes.length === 0) {
        return nullMatcher;
    }
    const routesWithStaticPathFlag = routes.map((route)=>[
            !/\*|\/:/.test(route[0]),
            ...route
        ]).sort(([isStaticA, pathA], [isStaticB, pathB])=>isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length);
    const staticMap = {};
    for(let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++){
        const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
        if (pathErrorCheckOnly) {
            staticMap[path] = [
                handlers.map(([h])=>[
                        h,
                        {}
                    ]),
                emptyParam
            ];
        } else {
            j++;
        }
        let paramAssoc;
        try {
            paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
        } catch (e) {
            throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
        }
        if (pathErrorCheckOnly) {
            continue;
        }
        handlerData[j] = handlers.map(([h, paramCount])=>{
            const paramIndexMap = {};
            paramCount -= 1;
            for(; paramCount >= 0; paramCount--){
                const [key, value] = paramAssoc[paramCount];
                paramIndexMap[key] = value;
            }
            return [
                h,
                paramIndexMap
            ];
        });
    }
    const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
    for(let i = 0, len = handlerData.length; i < len; i++){
        for(let j = 0, len = handlerData[i].length; j < len; j++){
            const map = handlerData[i][j]?.[1];
            if (!map) {
                continue;
            }
            const keys = Object.keys(map);
            for(let k = 0, len = keys.length; k < len; k++){
                map[keys[k]] = paramReplacementMap[map[keys[k]]];
            }
        }
    }
    const handlerMap = [];
    // using `in` because indexReplacementMap is a sparse array
    for(const i in indexReplacementMap){
        handlerMap[i] = handlerData[indexReplacementMap[i]];
    }
    return [
        regexp,
        handlerMap,
        staticMap
    ];
}
function findMiddleware(middleware, path) {
    if (!middleware) {
        return undefined;
    }
    for (const k of Object.keys(middleware).sort((a, b)=>b.length - a.length)){
        if (buildWildcardRegExp(k).test(path)) {
            return [
                ...middleware[k]
            ];
        }
    }
    return undefined;
}
export class RegExpRouter {
    name = 'RegExpRouter';
    middleware;
    routes;
    constructor(){
        this.middleware = {
            [METHOD_NAME_ALL]: {}
        };
        this.routes = {
            [METHOD_NAME_ALL]: {}
        };
    }
    add(method, path, handler) {
        const { middleware , routes  } = this;
        if (!middleware || !routes) {
            throw new Error('Can not add a route since the matcher is already built.');
        }
        if (methodNames.indexOf(method) === -1) methodNames.push(method);
        if (!middleware[method]) {
            [
                middleware,
                routes
            ].forEach((handlerMap)=>{
                handlerMap[method] = {};
                Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p)=>{
                    handlerMap[method][p] = [
                        ...handlerMap[METHOD_NAME_ALL][p]
                    ];
                });
            });
        }
        if (path === '/*') {
            path = '*';
        }
        const paramCount = (path.match(/\/:/g) || []).length;
        if (/\*$/.test(path)) {
            const re = buildWildcardRegExp(path);
            if (method === METHOD_NAME_ALL) {
                Object.keys(middleware).forEach((m)=>{
                    middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
                });
            } else {
                middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
            }
            Object.keys(middleware).forEach((m)=>{
                if (method === METHOD_NAME_ALL || method === m) {
                    Object.keys(middleware[m]).forEach((p)=>{
                        re.test(p) && middleware[m][p].push([
                            handler,
                            paramCount
                        ]);
                    });
                }
            });
            Object.keys(routes).forEach((m)=>{
                if (method === METHOD_NAME_ALL || method === m) {
                    Object.keys(routes[m]).forEach((p)=>re.test(p) && routes[m][p].push([
                            handler,
                            paramCount
                        ]));
                }
            });
            return;
        }
        const paths = checkOptionalParameter(path) || [
            path
        ];
        for(let i = 0, len = paths.length; i < len; i++){
            const path = paths[i];
            Object.keys(routes).forEach((m)=>{
                if (method === METHOD_NAME_ALL || method === m) {
                    routes[m][path] ||= [
                        ...findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || []
                    ];
                    routes[m][path].push([
                        handler,
                        paths.length === 2 && i === 0 ? paramCount - 1 : paramCount
                    ]);
                }
            });
        }
    }
    match(method, path) {
        clearWildcardRegExpCache() // no longer used.
        ;
        const matchers = this.buildAllMatchers();
        this.match = (method, path)=>{
            const matcher = matchers[method];
            const staticMatch = matcher[2][path];
            if (staticMatch) {
                return staticMatch;
            }
            const match = path.match(matcher[0]);
            if (!match) {
                return [
                    [],
                    emptyParam
                ];
            }
            const index = match.indexOf('', 1);
            return [
                matcher[1][index],
                match
            ];
        };
        return this.match(method, path);
    }
    buildAllMatchers() {
        const matchers = {};
        methodNames.forEach((method)=>{
            matchers[method] = this.buildMatcher(method) || matchers[METHOD_NAME_ALL];
        });
        // Release cache
        this.middleware = this.routes = undefined;
        return matchers;
    }
    buildMatcher(method) {
        const routes = [];
        let hasOwnRoute = method === METHOD_NAME_ALL;
        [
            this.middleware,
            this.routes
        ].forEach((r)=>{
            const ownRoute = r[method] ? Object.keys(r[method]).map((path)=>[
                    path,
                    r[method][path]
                ]) : [];
            if (ownRoute.length !== 0) {
                hasOwnRoute ||= true;
                routes.push(...ownRoute);
            } else if (method !== METHOD_NAME_ALL) {
                routes.push(...Object.keys(r[METHOD_NAME_ALL]).map((path)=>[
                        path,
                        r[METHOD_NAME_ALL][path]
                    ]));
            }
        });
        if (!hasOwnRoute) {
            return null;
        } else {
            return buildMatcherFromPreprocessedRoutes(routes);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvcm91dGVyL3JlZy1leHAtcm91dGVyL3JvdXRlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnQgKi9cbmltcG9ydCB0eXBlIHsgUm91dGVyLCBSZXN1bHQsIFBhcmFtSW5kZXhNYXAgfSBmcm9tICcuLi8uLi9yb3V0ZXIudHMnXG5pbXBvcnQgeyBNRVRIT0RfTkFNRV9BTEwsIE1FVEhPRFMsIFVuc3VwcG9ydGVkUGF0aEVycm9yIH0gZnJvbSAnLi4vLi4vcm91dGVyLnRzJ1xuaW1wb3J0IHsgY2hlY2tPcHRpb25hbFBhcmFtZXRlciB9IGZyb20gJy4uLy4uL3V0aWxzL3VybC50cydcbmltcG9ydCB7IFBBVEhfRVJST1IsIHR5cGUgUGFyYW1Bc3NvY0FycmF5IH0gZnJvbSAnLi9ub2RlLnRzJ1xuaW1wb3J0IHsgVHJpZSB9IGZyb20gJy4vdHJpZS50cydcblxuY29uc3QgbWV0aG9kTmFtZXMgPSBbTUVUSE9EX05BTUVfQUxMLCAuLi5NRVRIT0RTXS5tYXAoKG1ldGhvZCkgPT4gbWV0aG9kLnRvVXBwZXJDYXNlKCkpXG5cbnR5cGUgSGFuZGxlckRhdGE8VD4gPSBbVCwgUGFyYW1JbmRleE1hcF1bXVxudHlwZSBTdGF0aWNNYXA8VD4gPSBSZWNvcmQ8c3RyaW5nLCBSZXN1bHQ8VD4+XG50eXBlIE1hdGNoZXI8VD4gPSBbUmVnRXhwLCBIYW5kbGVyRGF0YTxUPltdLCBTdGF0aWNNYXA8VD5dXG50eXBlIEhhbmRsZXJXaXRoTWV0YWRhdGE8VD4gPSBbVCwgbnVtYmVyXSAvLyBbaGFuZGxlciwgcGFyYW1Db3VudF1cblxuY29uc3QgZW1wdHlQYXJhbTogc3RyaW5nW10gPSBbXVxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbmNvbnN0IG51bGxNYXRjaGVyOiBNYXRjaGVyPGFueT4gPSBbL14kLywgW10sIHt9XVxuXG5sZXQgd2lsZGNhcmRSZWdFeHBDYWNoZTogUmVjb3JkPHN0cmluZywgUmVnRXhwPiA9IHt9XG5mdW5jdGlvbiBidWlsZFdpbGRjYXJkUmVnRXhwKHBhdGg6IHN0cmluZyk6IFJlZ0V4cCB7XG4gIHJldHVybiAod2lsZGNhcmRSZWdFeHBDYWNoZVtwYXRoXSA/Pz0gbmV3IFJlZ0V4cChcbiAgICBwYXRoID09PSAnKicgPyAnJyA6IGBeJHtwYXRoLnJlcGxhY2UoL1xcL1xcKi8sICcoPzp8Ly4qKScpfSRgXG4gICkpXG59XG5cbmZ1bmN0aW9uIGNsZWFyV2lsZGNhcmRSZWdFeHBDYWNoZSgpIHtcbiAgd2lsZGNhcmRSZWdFeHBDYWNoZSA9IHt9XG59XG5cbmZ1bmN0aW9uIGJ1aWxkTWF0Y2hlckZyb21QcmVwcm9jZXNzZWRSb3V0ZXM8VD4oXG4gIHJvdXRlczogW3N0cmluZywgSGFuZGxlcldpdGhNZXRhZGF0YTxUPltdXVtdXG4pOiBNYXRjaGVyPFQ+IHtcbiAgY29uc3QgdHJpZSA9IG5ldyBUcmllKClcbiAgY29uc3QgaGFuZGxlckRhdGE6IEhhbmRsZXJEYXRhPFQ+W10gPSBbXVxuICBpZiAocm91dGVzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBudWxsTWF0Y2hlclxuICB9XG5cbiAgY29uc3Qgcm91dGVzV2l0aFN0YXRpY1BhdGhGbGFnID0gcm91dGVzXG4gICAgLm1hcChcbiAgICAgIChyb3V0ZSkgPT4gWyEvXFwqfFxcLzovLnRlc3Qocm91dGVbMF0pLCAuLi5yb3V0ZV0gYXMgW2Jvb2xlYW4sIHN0cmluZywgSGFuZGxlcldpdGhNZXRhZGF0YTxUPltdXVxuICAgIClcbiAgICAuc29ydCgoW2lzU3RhdGljQSwgcGF0aEFdLCBbaXNTdGF0aWNCLCBwYXRoQl0pID0+XG4gICAgICBpc1N0YXRpY0EgPyAxIDogaXNTdGF0aWNCID8gLTEgOiBwYXRoQS5sZW5ndGggLSBwYXRoQi5sZW5ndGhcbiAgICApXG5cbiAgY29uc3Qgc3RhdGljTWFwOiBTdGF0aWNNYXA8VD4gPSB7fVxuICBmb3IgKGxldCBpID0gMCwgaiA9IC0xLCBsZW4gPSByb3V0ZXNXaXRoU3RhdGljUGF0aEZsYWcubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBjb25zdCBbcGF0aEVycm9yQ2hlY2tPbmx5LCBwYXRoLCBoYW5kbGVyc10gPSByb3V0ZXNXaXRoU3RhdGljUGF0aEZsYWdbaV1cbiAgICBpZiAocGF0aEVycm9yQ2hlY2tPbmx5KSB7XG4gICAgICBzdGF0aWNNYXBbcGF0aF0gPSBbaGFuZGxlcnMubWFwKChbaF0pID0+IFtoLCB7fV0pLCBlbXB0eVBhcmFtXVxuICAgIH0gZWxzZSB7XG4gICAgICBqKytcbiAgICB9XG5cbiAgICBsZXQgcGFyYW1Bc3NvYzogUGFyYW1Bc3NvY0FycmF5XG4gICAgdHJ5IHtcbiAgICAgIHBhcmFtQXNzb2MgPSB0cmllLmluc2VydChwYXRoLCBqLCBwYXRoRXJyb3JDaGVja09ubHkpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgZSA9PT0gUEFUSF9FUlJPUiA/IG5ldyBVbnN1cHBvcnRlZFBhdGhFcnJvcihwYXRoKSA6IGVcbiAgICB9XG5cbiAgICBpZiAocGF0aEVycm9yQ2hlY2tPbmx5KSB7XG4gICAgICBjb250aW51ZVxuICAgIH1cblxuICAgIGhhbmRsZXJEYXRhW2pdID0gaGFuZGxlcnMubWFwKChbaCwgcGFyYW1Db3VudF0pID0+IHtcbiAgICAgIGNvbnN0IHBhcmFtSW5kZXhNYXA6IFBhcmFtSW5kZXhNYXAgPSB7fVxuICAgICAgcGFyYW1Db3VudCAtPSAxXG4gICAgICBmb3IgKDsgcGFyYW1Db3VudCA+PSAwOyBwYXJhbUNvdW50LS0pIHtcbiAgICAgICAgY29uc3QgW2tleSwgdmFsdWVdID0gcGFyYW1Bc3NvY1twYXJhbUNvdW50XVxuICAgICAgICBwYXJhbUluZGV4TWFwW2tleV0gPSB2YWx1ZVxuICAgICAgfVxuICAgICAgcmV0dXJuIFtoLCBwYXJhbUluZGV4TWFwXVxuICAgIH0pXG4gIH1cblxuICBjb25zdCBbcmVnZXhwLCBpbmRleFJlcGxhY2VtZW50TWFwLCBwYXJhbVJlcGxhY2VtZW50TWFwXSA9IHRyaWUuYnVpbGRSZWdFeHAoKVxuICBmb3IgKGxldCBpID0gMCwgbGVuID0gaGFuZGxlckRhdGEubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBmb3IgKGxldCBqID0gMCwgbGVuID0gaGFuZGxlckRhdGFbaV0ubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIGNvbnN0IG1hcCA9IGhhbmRsZXJEYXRhW2ldW2pdPy5bMV1cbiAgICAgIGlmICghbWFwKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMobWFwKVxuICAgICAgZm9yIChsZXQgayA9IDAsIGxlbiA9IGtleXMubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgICAgbWFwW2tleXNba11dID0gcGFyYW1SZXBsYWNlbWVudE1hcFttYXBba2V5c1trXV1dXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29uc3QgaGFuZGxlck1hcDogSGFuZGxlckRhdGE8VD5bXSA9IFtdXG4gIC8vIHVzaW5nIGBpbmAgYmVjYXVzZSBpbmRleFJlcGxhY2VtZW50TWFwIGlzIGEgc3BhcnNlIGFycmF5XG4gIGZvciAoY29uc3QgaSBpbiBpbmRleFJlcGxhY2VtZW50TWFwKSB7XG4gICAgaGFuZGxlck1hcFtpXSA9IGhhbmRsZXJEYXRhW2luZGV4UmVwbGFjZW1lbnRNYXBbaV1dXG4gIH1cblxuICByZXR1cm4gW3JlZ2V4cCwgaGFuZGxlck1hcCwgc3RhdGljTWFwXSBhcyBNYXRjaGVyPFQ+XG59XG5cbmZ1bmN0aW9uIGZpbmRNaWRkbGV3YXJlPFQ+KFxuICBtaWRkbGV3YXJlOiBSZWNvcmQ8c3RyaW5nLCBUW10+IHwgdW5kZWZpbmVkLFxuICBwYXRoOiBzdHJpbmdcbik6IFRbXSB8IHVuZGVmaW5lZCB7XG4gIGlmICghbWlkZGxld2FyZSkge1xuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIGZvciAoY29uc3QgayBvZiBPYmplY3Qua2V5cyhtaWRkbGV3YXJlKS5zb3J0KChhLCBiKSA9PiBiLmxlbmd0aCAtIGEubGVuZ3RoKSkge1xuICAgIGlmIChidWlsZFdpbGRjYXJkUmVnRXhwKGspLnRlc3QocGF0aCkpIHtcbiAgICAgIHJldHVybiBbLi4ubWlkZGxld2FyZVtrXV1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdW5kZWZpbmVkXG59XG5cbmV4cG9ydCBjbGFzcyBSZWdFeHBSb3V0ZXI8VD4gaW1wbGVtZW50cyBSb3V0ZXI8VD4ge1xuICBuYW1lOiBzdHJpbmcgPSAnUmVnRXhwUm91dGVyJ1xuICBtaWRkbGV3YXJlPzogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgSGFuZGxlcldpdGhNZXRhZGF0YTxUPltdPj5cbiAgcm91dGVzPzogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgSGFuZGxlcldpdGhNZXRhZGF0YTxUPltdPj5cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLm1pZGRsZXdhcmUgPSB7IFtNRVRIT0RfTkFNRV9BTExdOiB7fSB9XG4gICAgdGhpcy5yb3V0ZXMgPSB7IFtNRVRIT0RfTkFNRV9BTExdOiB7fSB9XG4gIH1cblxuICBhZGQobWV0aG9kOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgaGFuZGxlcjogVCkge1xuICAgIGNvbnN0IHsgbWlkZGxld2FyZSwgcm91dGVzIH0gPSB0aGlzXG5cbiAgICBpZiAoIW1pZGRsZXdhcmUgfHwgIXJvdXRlcykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW4gbm90IGFkZCBhIHJvdXRlIHNpbmNlIHRoZSBtYXRjaGVyIGlzIGFscmVhZHkgYnVpbHQuJylcbiAgICB9XG5cbiAgICBpZiAobWV0aG9kTmFtZXMuaW5kZXhPZihtZXRob2QpID09PSAtMSkgbWV0aG9kTmFtZXMucHVzaChtZXRob2QpXG4gICAgaWYgKCFtaWRkbGV3YXJlW21ldGhvZF0pIHtcbiAgICAgIDtbbWlkZGxld2FyZSwgcm91dGVzXS5mb3JFYWNoKChoYW5kbGVyTWFwKSA9PiB7XG4gICAgICAgIGhhbmRsZXJNYXBbbWV0aG9kXSA9IHt9XG4gICAgICAgIE9iamVjdC5rZXlzKGhhbmRsZXJNYXBbTUVUSE9EX05BTUVfQUxMXSkuZm9yRWFjaCgocCkgPT4ge1xuICAgICAgICAgIGhhbmRsZXJNYXBbbWV0aG9kXVtwXSA9IFsuLi5oYW5kbGVyTWFwW01FVEhPRF9OQU1FX0FMTF1bcF1dXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH1cblxuICAgIGlmIChwYXRoID09PSAnLyonKSB7XG4gICAgICBwYXRoID0gJyonXG4gICAgfVxuXG4gICAgY29uc3QgcGFyYW1Db3VudCA9IChwYXRoLm1hdGNoKC9cXC86L2cpIHx8IFtdKS5sZW5ndGhcblxuICAgIGlmICgvXFwqJC8udGVzdChwYXRoKSkge1xuICAgICAgY29uc3QgcmUgPSBidWlsZFdpbGRjYXJkUmVnRXhwKHBhdGgpXG4gICAgICBpZiAobWV0aG9kID09PSBNRVRIT0RfTkFNRV9BTEwpIHtcbiAgICAgICAgT2JqZWN0LmtleXMobWlkZGxld2FyZSkuZm9yRWFjaCgobSkgPT4ge1xuICAgICAgICAgIG1pZGRsZXdhcmVbbV1bcGF0aF0gfHw9XG4gICAgICAgICAgICBmaW5kTWlkZGxld2FyZShtaWRkbGV3YXJlW21dLCBwYXRoKSB8fFxuICAgICAgICAgICAgZmluZE1pZGRsZXdhcmUobWlkZGxld2FyZVtNRVRIT0RfTkFNRV9BTExdLCBwYXRoKSB8fFxuICAgICAgICAgICAgW11cbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1pZGRsZXdhcmVbbWV0aG9kXVtwYXRoXSB8fD1cbiAgICAgICAgICBmaW5kTWlkZGxld2FyZShtaWRkbGV3YXJlW21ldGhvZF0sIHBhdGgpIHx8XG4gICAgICAgICAgZmluZE1pZGRsZXdhcmUobWlkZGxld2FyZVtNRVRIT0RfTkFNRV9BTExdLCBwYXRoKSB8fFxuICAgICAgICAgIFtdXG4gICAgICB9XG4gICAgICBPYmplY3Qua2V5cyhtaWRkbGV3YXJlKS5mb3JFYWNoKChtKSA9PiB7XG4gICAgICAgIGlmIChtZXRob2QgPT09IE1FVEhPRF9OQU1FX0FMTCB8fCBtZXRob2QgPT09IG0pIHtcbiAgICAgICAgICBPYmplY3Qua2V5cyhtaWRkbGV3YXJlW21dKS5mb3JFYWNoKChwKSA9PiB7XG4gICAgICAgICAgICByZS50ZXN0KHApICYmIG1pZGRsZXdhcmVbbV1bcF0ucHVzaChbaGFuZGxlciwgcGFyYW1Db3VudF0pXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgT2JqZWN0LmtleXMocm91dGVzKS5mb3JFYWNoKChtKSA9PiB7XG4gICAgICAgIGlmIChtZXRob2QgPT09IE1FVEhPRF9OQU1FX0FMTCB8fCBtZXRob2QgPT09IG0pIHtcbiAgICAgICAgICBPYmplY3Qua2V5cyhyb3V0ZXNbbV0pLmZvckVhY2goXG4gICAgICAgICAgICAocCkgPT4gcmUudGVzdChwKSAmJiByb3V0ZXNbbV1bcF0ucHVzaChbaGFuZGxlciwgcGFyYW1Db3VudF0pXG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBwYXRocyA9IGNoZWNrT3B0aW9uYWxQYXJhbWV0ZXIocGF0aCkgfHwgW3BhdGhdXG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHBhdGhzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBjb25zdCBwYXRoID0gcGF0aHNbaV1cblxuICAgICAgT2JqZWN0LmtleXMocm91dGVzKS5mb3JFYWNoKChtKSA9PiB7XG4gICAgICAgIGlmIChtZXRob2QgPT09IE1FVEhPRF9OQU1FX0FMTCB8fCBtZXRob2QgPT09IG0pIHtcbiAgICAgICAgICByb3V0ZXNbbV1bcGF0aF0gfHw9IFtcbiAgICAgICAgICAgIC4uLihmaW5kTWlkZGxld2FyZShtaWRkbGV3YXJlW21dLCBwYXRoKSB8fFxuICAgICAgICAgICAgICBmaW5kTWlkZGxld2FyZShtaWRkbGV3YXJlW01FVEhPRF9OQU1FX0FMTF0sIHBhdGgpIHx8XG4gICAgICAgICAgICAgIFtdKSxcbiAgICAgICAgICBdXG4gICAgICAgICAgcm91dGVzW21dW3BhdGhdLnB1c2goW1xuICAgICAgICAgICAgaGFuZGxlcixcbiAgICAgICAgICAgIHBhdGhzLmxlbmd0aCA9PT0gMiAmJiBpID09PSAwID8gcGFyYW1Db3VudCAtIDEgOiBwYXJhbUNvdW50LFxuICAgICAgICAgIF0pXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgbWF0Y2gobWV0aG9kOiBzdHJpbmcsIHBhdGg6IHN0cmluZyk6IFJlc3VsdDxUPiB7XG4gICAgY2xlYXJXaWxkY2FyZFJlZ0V4cENhY2hlKCkgLy8gbm8gbG9uZ2VyIHVzZWQuXG5cbiAgICBjb25zdCBtYXRjaGVycyA9IHRoaXMuYnVpbGRBbGxNYXRjaGVycygpXG5cbiAgICB0aGlzLm1hdGNoID0gKG1ldGhvZCwgcGF0aCkgPT4ge1xuICAgICAgY29uc3QgbWF0Y2hlciA9IG1hdGNoZXJzW21ldGhvZF1cblxuICAgICAgY29uc3Qgc3RhdGljTWF0Y2ggPSBtYXRjaGVyWzJdW3BhdGhdXG4gICAgICBpZiAoc3RhdGljTWF0Y2gpIHtcbiAgICAgICAgcmV0dXJuIHN0YXRpY01hdGNoXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG1hdGNoID0gcGF0aC5tYXRjaChtYXRjaGVyWzBdKVxuICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICByZXR1cm4gW1tdLCBlbXB0eVBhcmFtXVxuICAgICAgfVxuXG4gICAgICBjb25zdCBpbmRleCA9IG1hdGNoLmluZGV4T2YoJycsIDEpXG4gICAgICByZXR1cm4gW21hdGNoZXJbMV1baW5kZXhdLCBtYXRjaF1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5tYXRjaChtZXRob2QsIHBhdGgpXG4gIH1cblxuICBwcml2YXRlIGJ1aWxkQWxsTWF0Y2hlcnMoKTogUmVjb3JkPHN0cmluZywgTWF0Y2hlcjxUPj4ge1xuICAgIGNvbnN0IG1hdGNoZXJzOiBSZWNvcmQ8c3RyaW5nLCBNYXRjaGVyPFQ+PiA9IHt9XG5cbiAgICBtZXRob2ROYW1lcy5mb3JFYWNoKChtZXRob2QpID0+IHtcbiAgICAgIG1hdGNoZXJzW21ldGhvZF0gPSB0aGlzLmJ1aWxkTWF0Y2hlcihtZXRob2QpIHx8IG1hdGNoZXJzW01FVEhPRF9OQU1FX0FMTF1cbiAgICB9KVxuXG4gICAgLy8gUmVsZWFzZSBjYWNoZVxuICAgIHRoaXMubWlkZGxld2FyZSA9IHRoaXMucm91dGVzID0gdW5kZWZpbmVkXG5cbiAgICByZXR1cm4gbWF0Y2hlcnNcbiAgfVxuXG4gIHByaXZhdGUgYnVpbGRNYXRjaGVyKG1ldGhvZDogc3RyaW5nKTogTWF0Y2hlcjxUPiB8IG51bGwge1xuICAgIGNvbnN0IHJvdXRlczogW3N0cmluZywgSGFuZGxlcldpdGhNZXRhZGF0YTxUPltdXVtdID0gW11cblxuICAgIGxldCBoYXNPd25Sb3V0ZSA9IG1ldGhvZCA9PT0gTUVUSE9EX05BTUVfQUxMXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1ub24tbnVsbC1hc3NlcnRpb25cbiAgICA7W3RoaXMubWlkZGxld2FyZSEsIHRoaXMucm91dGVzIV0uZm9yRWFjaCgocikgPT4ge1xuICAgICAgY29uc3Qgb3duUm91dGUgPSByW21ldGhvZF1cbiAgICAgICAgPyBPYmplY3Qua2V5cyhyW21ldGhvZF0pLm1hcCgocGF0aCkgPT4gW3BhdGgsIHJbbWV0aG9kXVtwYXRoXV0pXG4gICAgICAgIDogW11cbiAgICAgIGlmIChvd25Sb3V0ZS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgaGFzT3duUm91dGUgfHw9IHRydWVcbiAgICAgICAgcm91dGVzLnB1c2goLi4uKG93blJvdXRlIGFzIFtzdHJpbmcsIEhhbmRsZXJXaXRoTWV0YWRhdGE8VD5bXV1bXSkpXG4gICAgICB9IGVsc2UgaWYgKG1ldGhvZCAhPT0gTUVUSE9EX05BTUVfQUxMKSB7XG4gICAgICAgIHJvdXRlcy5wdXNoKFxuICAgICAgICAgIC4uLihPYmplY3Qua2V5cyhyW01FVEhPRF9OQU1FX0FMTF0pLm1hcCgocGF0aCkgPT4gW3BhdGgsIHJbTUVUSE9EX05BTUVfQUxMXVtwYXRoXV0pIGFzIFtcbiAgICAgICAgICAgIHN0cmluZyxcbiAgICAgICAgICAgIEhhbmRsZXJXaXRoTWV0YWRhdGE8VD5bXVxuICAgICAgICAgIF1bXSlcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBpZiAoIWhhc093blJvdXRlKSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYnVpbGRNYXRjaGVyRnJvbVByZXByb2Nlc3NlZFJvdXRlcyhyb3V0ZXMpXG4gICAgfVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsb0RBQW9ELEdBRXBELFNBQVMsZUFBZSxFQUFFLE9BQU8sRUFBRSxvQkFBb0IsUUFBUSxrQkFBaUI7QUFDaEYsU0FBUyxzQkFBc0IsUUFBUSxxQkFBb0I7QUFDM0QsU0FBUyxVQUFVLFFBQThCLFlBQVc7QUFDNUQsU0FBUyxJQUFJLFFBQVEsWUFBVztBQUVoQyxNQUFNLGNBQWM7SUFBQztPQUFvQjtDQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsU0FBVyxPQUFPLFdBQVc7QUFPcEYsTUFBTSxhQUF1QixFQUFFO0FBQy9CLDhEQUE4RDtBQUM5RCxNQUFNLGNBQTRCO0lBQUM7SUFBTSxFQUFFO0lBQUUsQ0FBQztDQUFFO0FBRWhELElBQUksc0JBQThDLENBQUM7QUFDbkQsU0FBUyxvQkFBb0IsSUFBWSxFQUFVO0lBQ2pELE9BQVEsbUJBQW1CLENBQUMsS0FBSyxLQUFLLElBQUksT0FDeEMsU0FBUyxNQUFNLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxPQUFPLENBQUMsUUFBUSxZQUFZLENBQUMsQ0FBQztBQUUvRDtBQUVBLFNBQVMsMkJBQTJCO0lBQ2xDLHNCQUFzQixDQUFD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