import { METHOD_NAME_ALL, UnsupportedPathError } from '../../router.ts';
export class PatternRouter {
    name = 'PatternRouter';
    routes = [];
    add(method, path, handler) {
        const endsWithWildcard = path[path.length - 1] === '*';
        if (endsWithWildcard) {
            path = path.slice(0, -2);
        }
        const parts = path.match(/\/?(:\w+(?:{[^}]+})?)|\/?[^\/\?]+|(\?)/g) || [];
        if (parts[parts.length - 1] === '?') {
            this.add(method, parts.slice(0, parts.length - 2).join(''), handler);
            parts.pop();
        }
        for(let i = 0, len = parts.length; i < len; i++){
            const match = parts[i].match(/^\/:([^{]+)(?:{(.*)})?/);
            if (match) {
                parts[i] = `/(?<${match[1]}>${match[2] || '[^/]+'})`;
            } else if (parts[i] === '/*') {
                parts[i] = '/[^/]+';
            }
        }
        let re;
        try {
            re = new RegExp(`^${parts.join('')}${endsWithWildcard ? '' : '/?$'}`);
        } catch (e) {
            throw new UnsupportedPathError();
        }
        this.routes.push([
            re,
            method,
            handler
        ]);
    }
    match(method, path) {
        const handlers = [];
        for (const [pattern, routeMethod, handler] of this.routes){
            if (routeMethod === METHOD_NAME_ALL || routeMethod === method) {
                const match = pattern.exec(path);
                if (match) {
                    handlers.push([
                        handler,
                        match.groups || {}
                    ]);
                }
            }
        }
        return [
            handlers
        ];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvcm91dGVyL3BhdHRlcm4tcm91dGVyL3JvdXRlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFJlc3VsdCwgUm91dGVyLCBQYXJhbXMgfSBmcm9tICcuLi8uLi9yb3V0ZXIudHMnXG5pbXBvcnQgeyBNRVRIT0RfTkFNRV9BTEwsIFVuc3VwcG9ydGVkUGF0aEVycm9yIH0gZnJvbSAnLi4vLi4vcm91dGVyLnRzJ1xuXG50eXBlIFJvdXRlPFQ+ID0gW1JlZ0V4cCwgc3RyaW5nLCBUXSAvLyBbcGF0dGVybiwgbWV0aG9kLCBoYW5kbGVyLCBwYXRoXVxuXG5leHBvcnQgY2xhc3MgUGF0dGVyblJvdXRlcjxUPiBpbXBsZW1lbnRzIFJvdXRlcjxUPiB7XG4gIG5hbWU6IHN0cmluZyA9ICdQYXR0ZXJuUm91dGVyJ1xuICBwcml2YXRlIHJvdXRlczogUm91dGU8VD5bXSA9IFtdXG5cbiAgYWRkKG1ldGhvZDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIGhhbmRsZXI6IFQpIHtcbiAgICBjb25zdCBlbmRzV2l0aFdpbGRjYXJkID0gcGF0aFtwYXRoLmxlbmd0aCAtIDFdID09PSAnKidcbiAgICBpZiAoZW5kc1dpdGhXaWxkY2FyZCkge1xuICAgICAgcGF0aCA9IHBhdGguc2xpY2UoMCwgLTIpXG4gICAgfVxuXG4gICAgY29uc3QgcGFydHMgPSBwYXRoLm1hdGNoKC9cXC8/KDpcXHcrKD86e1tefV0rfSk/KXxcXC8/W15cXC9cXD9dK3woXFw/KS9nKSB8fCBbXVxuICAgIGlmIChwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXSA9PT0gJz8nKSB7XG4gICAgICB0aGlzLmFkZChtZXRob2QsIHBhcnRzLnNsaWNlKDAsIHBhcnRzLmxlbmd0aCAtIDIpLmpvaW4oJycpLCBoYW5kbGVyKVxuICAgICAgcGFydHMucG9wKClcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gcGFydHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IG1hdGNoID0gcGFydHNbaV0ubWF0Y2goL15cXC86KFtee10rKSg/OnsoLiopfSk/LylcbiAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICBwYXJ0c1tpXSA9IGAvKD88JHttYXRjaFsxXX0+JHttYXRjaFsyXSB8fCAnW14vXSsnfSlgXG4gICAgICB9IGVsc2UgaWYgKHBhcnRzW2ldID09PSAnLyonKSB7XG4gICAgICAgIHBhcnRzW2ldID0gJy9bXi9dKydcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgcmVcbiAgICB0cnkge1xuICAgICAgcmUgPSBuZXcgUmVnRXhwKGBeJHtwYXJ0cy5qb2luKCcnKX0ke2VuZHNXaXRoV2lsZGNhcmQgPyAnJyA6ICcvPyQnfWApXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgbmV3IFVuc3VwcG9ydGVkUGF0aEVycm9yKClcbiAgICB9XG4gICAgdGhpcy5yb3V0ZXMucHVzaChbcmUsIG1ldGhvZCwgaGFuZGxlcl0pXG4gIH1cblxuICBtYXRjaChtZXRob2Q6IHN0cmluZywgcGF0aDogc3RyaW5nKTogUmVzdWx0PFQ+IHtcbiAgICBjb25zdCBoYW5kbGVyczogW1QsIFBhcmFtc11bXSA9IFtdXG5cbiAgICBmb3IgKGNvbnN0IFtwYXR0ZXJuLCByb3V0ZU1ldGhvZCwgaGFuZGxlcl0gb2YgdGhpcy5yb3V0ZXMpIHtcbiAgICAgIGlmIChyb3V0ZU1ldGhvZCA9PT0gTUVUSE9EX05BTUVfQUxMIHx8IHJvdXRlTWV0aG9kID09PSBtZXRob2QpIHtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSBwYXR0ZXJuLmV4ZWMocGF0aClcbiAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgaGFuZGxlcnMucHVzaChbaGFuZGxlciwgbWF0Y2guZ3JvdXBzIHx8IHt9XSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBbaGFuZGxlcnNdXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxTQUFTLGVBQWUsRUFBRSxvQkFBb0IsUUFBUSxrQkFBaUI7QUFJdkUsT0FBTyxNQUFNO0lBQ1gsT0FBZSxnQkFBZTtJQUN0QixTQUFxQixFQUFFLENBQUE7SUFFL0IsSUFBSSxNQUFjLEVBQUUsSUFBWSxFQUFFLE9BQVUsRUFBRTtRQUM1QyxNQUFNLG1CQUFtQixJQUFJLENBQUMsS0FBSyxNQUFNLEdBQUcsRUFBRSxLQUFLO1FBQ25ELElBQUksa0JBQWtCO1lBQ3BCLE9BQU8sS0FBSyxLQUFLLENBQUMsR0FBRyxDQUFDO1FBQ3hCLENBQUM7UUFFRCxNQUFNLFFBQVEsS0FBSyxLQUFLLENBQUMsOENBQThDLEVBQUU7UUFDekUsSUFBSSxLQUFLLENBQUMsTUFBTSxNQUFNLEdBQUcsRUFBRSxLQUFLLEtBQUs7WUFDbkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLE1BQU0sS0FBSyxDQUFDLEdBQUcsTUFBTSxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSztZQUM1RCxNQUFNLEdBQUc7UUFDWCxDQUFDO1FBRUQsSUFBSyxJQUFJLElBQUksR0FBRyxNQUFNLE1BQU0sTUFBTSxFQUFFLElBQUksS0FBSyxJQUFLO1lBQ2hELE1BQU0sUUFBUSxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQztZQUM3QixJQUFJLE9BQU87Z0JBQ1QsS0FBSyxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRSxJQUFJLFFBQVEsQ0FBQyxDQUFDO1lBQ3RELE9BQU8sSUFBSSxLQUFLLENBQUMsRUFBRSxLQUFLLE1BQU07Z0JBQzVCLEtBQUssQ0FBQyxFQUFFLEdBQUc7WUFDYixDQUFDO1FBQ0g7UUFFQSxJQUFJO1FBQ0osSUFBSTtZQUNGLEtBQUssSUFBSSxPQUFPLENBQUMsQ0FBQyxFQUFFLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxtQkFBbUIsS0FBSyxLQUFLLENBQUMsQ0FBQztRQUN0RSxFQUFFLE9BQU8sR0FBRztZQUNWLE1BQU0sSUFBSSx1QkFBc0I7UUFDbEM7UUFDQSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUFDO1lBQUk7WUFBUTtTQUFRO0lBQ3hDO0lBRUEsTUFBTSxNQUFjLEVBQUUsSUFBWSxFQUFhO1FBQzdDLE1BQU0sV0FBMEIsRUFBRTtRQUVsQyxLQUFLLE1BQU0sQ0FBQyxTQUFTLGFBQWEsUUFBUSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUU7WUFDekQsSUFBSSxnQkFBZ0IsbUJBQW1CLGdCQUFnQixRQUFRO2dCQUM3RCxNQUFNLFFBQVEsUUFBUSxJQUFJLENBQUM7Z0JBQzNCLElBQUksT0FBTztvQkFDVCxTQUFTLElBQUksQ0FBQzt3QkFBQzt3QkFBUyxNQUFNLE1BQU0sSUFBSSxDQUFDO3FCQUFFO2dCQUM3QyxDQUFDO1lBQ0gsQ0FBQztRQUNIO1FBRUEsT0FBTztZQUFDO1NBQVM7SUFDbkI7QUFDRixDQUFDIn0=