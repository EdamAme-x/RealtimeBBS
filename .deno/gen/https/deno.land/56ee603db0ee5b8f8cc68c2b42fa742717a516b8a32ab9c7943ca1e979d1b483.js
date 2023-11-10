import { METHOD_NAME_ALL, UnsupportedPathError } from '../../router.ts';
const emptyParams = {};
const splitPathRe = /\/(:\w+(?:{[^}]+})?)|\/[^\/\?]+|(\?)/g;
const splitByStarRe = /\*/;
export class LinearRouter {
    name = 'LinearRouter';
    routes = [];
    add(method, path, handler) {
        if (path.charCodeAt(path.length - 1) === 63) {
            // /path/to/:label? means /path/to/:label or /path/to
            this.routes.push([
                method,
                path.slice(0, -1),
                handler
            ]);
            this.routes.push([
                method,
                path.replace(/\/[^/]+$/, ''),
                handler
            ]);
        } else {
            this.routes.push([
                method,
                path,
                handler
            ]);
        }
    }
    match(method, path) {
        const handlers = [];
        ROUTES_LOOP: for(let i = 0; i < this.routes.length; i++){
            const [routeMethod, routePath, handler] = this.routes[i];
            if (routeMethod !== method && routeMethod !== METHOD_NAME_ALL) {
                continue;
            }
            if (routePath === '*' || routePath === '/*') {
                handlers.push([
                    handler,
                    emptyParams
                ]);
                continue;
            }
            const hasStar = routePath.indexOf('*') !== -1;
            const hasLabel = routePath.indexOf(':') !== -1;
            if (!hasStar && !hasLabel) {
                if (routePath === path || routePath + '/' === path) {
                    handlers.push([
                        handler,
                        emptyParams
                    ]);
                }
            } else if (hasStar && !hasLabel) {
                const endsWithStar = routePath.charCodeAt(routePath.length - 1) === 42;
                const parts = (endsWithStar ? routePath.slice(0, -2) : routePath).split(splitByStarRe);
                const lastIndex = parts.length - 1;
                for(let j = 0, pos = 0; j < parts.length; j++){
                    const part = parts[j];
                    const index = path.indexOf(part, pos);
                    if (index !== pos) {
                        continue ROUTES_LOOP;
                    }
                    pos += part.length;
                    if (j === lastIndex) {
                        if (!endsWithStar && pos !== path.length && !(pos === path.length - 1 && path.charCodeAt(pos) === 47)) {
                            continue ROUTES_LOOP;
                        }
                    } else {
                        const index = path.indexOf('/', pos);
                        if (index === -1) {
                            continue ROUTES_LOOP;
                        }
                        pos = index;
                    }
                }
                handlers.push([
                    handler,
                    emptyParams
                ]);
            } else if (hasLabel && !hasStar) {
                const params = {};
                const parts = routePath.match(splitPathRe);
                const lastIndex = parts.length - 1;
                for(let j = 0, pos = 0; j < parts.length; j++){
                    if (pos === -1 || pos >= path.length) {
                        continue ROUTES_LOOP;
                    }
                    const part = parts[j];
                    if (part.charCodeAt(1) === 58) {
                        // /:label
                        let name = part.slice(2);
                        let value;
                        if (name.charCodeAt(name.length - 1) === 125) {
                            // :label{pattern}
                            const openBracePos = name.indexOf('{');
                            const pattern = name.slice(openBracePos + 1, -1);
                            const restPath = path.slice(pos + 1);
                            const match = new RegExp(pattern, 'd').exec(restPath);
                            if (!match || match.indices[0][0] !== 0 || match.indices[0][1] === 0) {
                                continue ROUTES_LOOP;
                            }
                            name = name.slice(0, openBracePos);
                            value = restPath.slice(...match.indices[0]);
                            pos += match.indices[0][1] + 1;
                        } else {
                            let endValuePos = path.indexOf('/', pos + 1);
                            if (endValuePos === -1) {
                                if (pos + 1 === path.length) {
                                    continue ROUTES_LOOP;
                                }
                                endValuePos = path.length;
                            }
                            value = path.slice(pos + 1, endValuePos);
                            pos = endValuePos;
                        }
                        params[name] ||= value;
                    } else {
                        const index = path.indexOf(part, pos);
                        if (index !== pos) {
                            continue ROUTES_LOOP;
                        }
                        pos += part.length;
                    }
                    if (j === lastIndex) {
                        if (pos !== path.length && !(pos === path.length - 1 && path.charCodeAt(pos) === 47)) {
                            continue ROUTES_LOOP;
                        }
                    }
                }
                handlers.push([
                    handler,
                    params
                ]);
            } else if (hasLabel && hasStar) {
                throw new UnsupportedPathError();
            }
        }
        return [
            handlers
        ];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvcm91dGVyL2xpbmVhci1yb3V0ZXIvcm91dGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgUm91dGVyLCBSZXN1bHQsIFBhcmFtcyB9IGZyb20gJy4uLy4uL3JvdXRlci50cydcbmltcG9ydCB7IE1FVEhPRF9OQU1FX0FMTCwgVW5zdXBwb3J0ZWRQYXRoRXJyb3IgfSBmcm9tICcuLi8uLi9yb3V0ZXIudHMnXG5cbnR5cGUgUmVnRXhwTWF0Y2hBcnJheVdpdGhJbmRpY2VzID0gUmVnRXhwTWF0Y2hBcnJheSAmIHsgaW5kaWNlczogW251bWJlciwgbnVtYmVyXVtdIH1cblxuY29uc3QgZW1wdHlQYXJhbXMgPSB7fVxuXG5jb25zdCBzcGxpdFBhdGhSZSA9IC9cXC8oOlxcdysoPzp7W159XSt9KT8pfFxcL1teXFwvXFw/XSt8KFxcPykvZ1xuY29uc3Qgc3BsaXRCeVN0YXJSZSA9IC9cXCovXG5leHBvcnQgY2xhc3MgTGluZWFyUm91dGVyPFQ+IGltcGxlbWVudHMgUm91dGVyPFQ+IHtcbiAgbmFtZTogc3RyaW5nID0gJ0xpbmVhclJvdXRlcidcbiAgcm91dGVzOiBbc3RyaW5nLCBzdHJpbmcsIFRdW10gPSBbXVxuXG4gIGFkZChtZXRob2Q6IHN0cmluZywgcGF0aDogc3RyaW5nLCBoYW5kbGVyOiBUKSB7XG4gICAgaWYgKHBhdGguY2hhckNvZGVBdChwYXRoLmxlbmd0aCAtIDEpID09PSA2Mykge1xuICAgICAgLy8gL3BhdGgvdG8vOmxhYmVsPyBtZWFucyAvcGF0aC90by86bGFiZWwgb3IgL3BhdGgvdG9cbiAgICAgIHRoaXMucm91dGVzLnB1c2goW21ldGhvZCwgcGF0aC5zbGljZSgwLCAtMSksIGhhbmRsZXJdKVxuICAgICAgdGhpcy5yb3V0ZXMucHVzaChbbWV0aG9kLCBwYXRoLnJlcGxhY2UoL1xcL1teL10rJC8sICcnKSwgaGFuZGxlcl0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucm91dGVzLnB1c2goW21ldGhvZCwgcGF0aCwgaGFuZGxlcl0pXG4gICAgfVxuICB9XG5cbiAgbWF0Y2gobWV0aG9kOiBzdHJpbmcsIHBhdGg6IHN0cmluZyk6IFJlc3VsdDxUPiB7XG4gICAgY29uc3QgaGFuZGxlcnM6IFtULCBQYXJhbXNdW10gPSBbXVxuICAgIFJPVVRFU19MT09QOiBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucm91dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBbcm91dGVNZXRob2QsIHJvdXRlUGF0aCwgaGFuZGxlcl0gPSB0aGlzLnJvdXRlc1tpXVxuICAgICAgaWYgKHJvdXRlTWV0aG9kICE9PSBtZXRob2QgJiYgcm91dGVNZXRob2QgIT09IE1FVEhPRF9OQU1FX0FMTCkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgaWYgKHJvdXRlUGF0aCA9PT0gJyonIHx8IHJvdXRlUGF0aCA9PT0gJy8qJykge1xuICAgICAgICBoYW5kbGVycy5wdXNoKFtoYW5kbGVyLCBlbXB0eVBhcmFtc10pXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGhhc1N0YXIgPSByb3V0ZVBhdGguaW5kZXhPZignKicpICE9PSAtMVxuICAgICAgY29uc3QgaGFzTGFiZWwgPSByb3V0ZVBhdGguaW5kZXhPZignOicpICE9PSAtMVxuICAgICAgaWYgKCFoYXNTdGFyICYmICFoYXNMYWJlbCkge1xuICAgICAgICBpZiAocm91dGVQYXRoID09PSBwYXRoIHx8IHJvdXRlUGF0aCArICcvJyA9PT0gcGF0aCkge1xuICAgICAgICAgIGhhbmRsZXJzLnB1c2goW2hhbmRsZXIsIGVtcHR5UGFyYW1zXSlcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChoYXNTdGFyICYmICFoYXNMYWJlbCkge1xuICAgICAgICBjb25zdCBlbmRzV2l0aFN0YXIgPSByb3V0ZVBhdGguY2hhckNvZGVBdChyb3V0ZVBhdGgubGVuZ3RoIC0gMSkgPT09IDQyXG4gICAgICAgIGNvbnN0IHBhcnRzID0gKGVuZHNXaXRoU3RhciA/IHJvdXRlUGF0aC5zbGljZSgwLCAtMikgOiByb3V0ZVBhdGgpLnNwbGl0KHNwbGl0QnlTdGFyUmUpXG5cbiAgICAgICAgY29uc3QgbGFzdEluZGV4ID0gcGFydHMubGVuZ3RoIC0gMVxuICAgICAgICBmb3IgKGxldCBqID0gMCwgcG9zID0gMDsgaiA8IHBhcnRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgY29uc3QgcGFydCA9IHBhcnRzW2pdXG4gICAgICAgICAgY29uc3QgaW5kZXggPSBwYXRoLmluZGV4T2YocGFydCwgcG9zKVxuICAgICAgICAgIGlmIChpbmRleCAhPT0gcG9zKSB7XG4gICAgICAgICAgICBjb250aW51ZSBST1VURVNfTE9PUFxuICAgICAgICAgIH1cbiAgICAgICAgICBwb3MgKz0gcGFydC5sZW5ndGhcbiAgICAgICAgICBpZiAoaiA9PT0gbGFzdEluZGV4KSB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICFlbmRzV2l0aFN0YXIgJiZcbiAgICAgICAgICAgICAgcG9zICE9PSBwYXRoLmxlbmd0aCAmJlxuICAgICAgICAgICAgICAhKHBvcyA9PT0gcGF0aC5sZW5ndGggLSAxICYmIHBhdGguY2hhckNvZGVBdChwb3MpID09PSA0NylcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICBjb250aW51ZSBST1VURVNfTE9PUFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IHBhdGguaW5kZXhPZignLycsIHBvcylcbiAgICAgICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgY29udGludWUgUk9VVEVTX0xPT1BcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBvcyA9IGluZGV4XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGhhbmRsZXJzLnB1c2goW2hhbmRsZXIsIGVtcHR5UGFyYW1zXSlcbiAgICAgIH0gZWxzZSBpZiAoaGFzTGFiZWwgJiYgIWhhc1N0YXIpIHtcbiAgICAgICAgY29uc3QgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge31cbiAgICAgICAgY29uc3QgcGFydHMgPSByb3V0ZVBhdGgubWF0Y2goc3BsaXRQYXRoUmUpIGFzIHN0cmluZ1tdXG5cbiAgICAgICAgY29uc3QgbGFzdEluZGV4ID0gcGFydHMubGVuZ3RoIC0gMVxuICAgICAgICBmb3IgKGxldCBqID0gMCwgcG9zID0gMDsgaiA8IHBhcnRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgaWYgKHBvcyA9PT0gLTEgfHwgcG9zID49IHBhdGgubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb250aW51ZSBST1VURVNfTE9PUFxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHBhcnQgPSBwYXJ0c1tqXVxuICAgICAgICAgIGlmIChwYXJ0LmNoYXJDb2RlQXQoMSkgPT09IDU4KSB7XG4gICAgICAgICAgICAvLyAvOmxhYmVsXG4gICAgICAgICAgICBsZXQgbmFtZSA9IHBhcnQuc2xpY2UoMilcbiAgICAgICAgICAgIGxldCB2YWx1ZVxuXG4gICAgICAgICAgICBpZiAobmFtZS5jaGFyQ29kZUF0KG5hbWUubGVuZ3RoIC0gMSkgPT09IDEyNSkge1xuICAgICAgICAgICAgICAvLyA6bGFiZWx7cGF0dGVybn1cbiAgICAgICAgICAgICAgY29uc3Qgb3BlbkJyYWNlUG9zID0gbmFtZS5pbmRleE9mKCd7JylcbiAgICAgICAgICAgICAgY29uc3QgcGF0dGVybiA9IG5hbWUuc2xpY2Uob3BlbkJyYWNlUG9zICsgMSwgLTEpXG4gICAgICAgICAgICAgIGNvbnN0IHJlc3RQYXRoID0gcGF0aC5zbGljZShwb3MgKyAxKVxuICAgICAgICAgICAgICBjb25zdCBtYXRjaCA9IG5ldyBSZWdFeHAocGF0dGVybiwgJ2QnKS5leGVjKHJlc3RQYXRoKSBhcyBSZWdFeHBNYXRjaEFycmF5V2l0aEluZGljZXNcbiAgICAgICAgICAgICAgaWYgKCFtYXRjaCB8fCBtYXRjaC5pbmRpY2VzWzBdWzBdICE9PSAwIHx8IG1hdGNoLmluZGljZXNbMF1bMV0gPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZSBST1VURVNfTE9PUFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIG5hbWUgPSBuYW1lLnNsaWNlKDAsIG9wZW5CcmFjZVBvcylcbiAgICAgICAgICAgICAgdmFsdWUgPSByZXN0UGF0aC5zbGljZSguLi5tYXRjaC5pbmRpY2VzWzBdKVxuICAgICAgICAgICAgICBwb3MgKz0gbWF0Y2guaW5kaWNlc1swXVsxXSArIDFcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGxldCBlbmRWYWx1ZVBvcyA9IHBhdGguaW5kZXhPZignLycsIHBvcyArIDEpXG4gICAgICAgICAgICAgIGlmIChlbmRWYWx1ZVBvcyA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBpZiAocG9zICsgMSA9PT0gcGF0aC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnRpbnVlIFJPVVRFU19MT09QXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVuZFZhbHVlUG9zID0gcGF0aC5sZW5ndGhcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB2YWx1ZSA9IHBhdGguc2xpY2UocG9zICsgMSwgZW5kVmFsdWVQb3MpXG4gICAgICAgICAgICAgIHBvcyA9IGVuZFZhbHVlUG9zXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHBhcmFtc1tuYW1lXSB8fD0gdmFsdWUgYXMgc3RyaW5nXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gcGF0aC5pbmRleE9mKHBhcnQsIHBvcylcbiAgICAgICAgICAgIGlmIChpbmRleCAhPT0gcG9zKSB7XG4gICAgICAgICAgICAgIGNvbnRpbnVlIFJPVVRFU19MT09QXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwb3MgKz0gcGFydC5sZW5ndGhcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaiA9PT0gbGFzdEluZGV4KSB7XG4gICAgICAgICAgICBpZiAocG9zICE9PSBwYXRoLmxlbmd0aCAmJiAhKHBvcyA9PT0gcGF0aC5sZW5ndGggLSAxICYmIHBhdGguY2hhckNvZGVBdChwb3MpID09PSA0NykpIHtcbiAgICAgICAgICAgICAgY29udGludWUgUk9VVEVTX0xPT1BcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBoYW5kbGVycy5wdXNoKFtoYW5kbGVyLCBwYXJhbXNdKVxuICAgICAgfSBlbHNlIGlmIChoYXNMYWJlbCAmJiBoYXNTdGFyKSB7XG4gICAgICAgIHRocm93IG5ldyBVbnN1cHBvcnRlZFBhdGhFcnJvcigpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIFtoYW5kbGVyc11cbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLFNBQVMsZUFBZSxFQUFFLG9CQUFvQixRQUFRLGtCQUFpQjtBQUl2RSxNQUFNLGNBQWMsQ0FBQztBQUVyQixNQUFNLGNBQWM7QUFDcEIsTUFBTSxnQkFBZ0I7QUFDdEIsT0FBTyxNQUFNO0lBQ1gsT0FBZSxlQUFjO0lBQzdCLFNBQWdDLEVBQUUsQ0FBQTtJQUVsQyxJQUFJLE1BQWMsRUFBRSxJQUFZLEVBQUUsT0FBVSxFQUFFO1FBQzVDLElBQUksS0FBSyxVQUFVLENBQUMsS0FBSyxNQUFNLEdBQUcsT0FBTyxJQUFJO1lBQzNDLHFEQUFxRDtZQUNyRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFBQztnQkFBUSxLQUFLLEtBQUssQ0FBQyxHQUFHLENBQUM7Z0JBQUk7YUFBUTtZQUNyRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFBQztnQkFBUSxLQUFLLE9BQU8sQ0FBQyxZQUFZO2dCQUFLO2FBQVE7UUFDbEUsT0FBTztZQUNMLElBQUksQ0FBQyxNQUFN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