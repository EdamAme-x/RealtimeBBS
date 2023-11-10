/* eslint-disable @typescript-eslint/ban-ts-comment */ import { UnsupportedPathError } from '../../router.ts';
export class SmartRouter {
    name = 'SmartRouter';
    routers = [];
    routes = [];
    constructor(init){
        Object.assign(this, init);
    }
    add(method, path, handler) {
        if (!this.routes) {
            throw new Error('Can not add a route since the matcher is already built.');
        }
        this.routes.push([
            method,
            path,
            handler
        ]);
    }
    match(method, path) {
        if (!this.routes) {
            throw new Error('Fatal error');
        }
        const { routers , routes  } = this;
        const len = routers.length;
        let i = 0;
        let res;
        for(; i < len; i++){
            const router = routers[i];
            try {
                routes.forEach((args)=>{
                    router.add(...args);
                });
                res = router.match(method, path);
            } catch (e) {
                if (e instanceof UnsupportedPathError) {
                    continue;
                }
                throw e;
            }
            this.match = router.match.bind(router);
            this.routers = [
                router
            ];
            this.routes = undefined;
            break;
        }
        if (i === len) {
            // not found
            throw new Error('Fatal error');
        }
        // e.g. "SmartRouter + RegExpRouter"
        this.name = `SmartRouter + ${this.activeRouter.name}`;
        return res;
    }
    get activeRouter() {
        if (this.routes || this.routers.length !== 1) {
            throw new Error('No active router has been determined yet.');
        }
        return this.routers[0];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvcm91dGVyL3NtYXJ0LXJvdXRlci9yb3V0ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50ICovXG5pbXBvcnQgdHlwZSB7IFJvdXRlciwgUmVzdWx0IH0gZnJvbSAnLi4vLi4vcm91dGVyLnRzJ1xuaW1wb3J0IHsgVW5zdXBwb3J0ZWRQYXRoRXJyb3IgfSBmcm9tICcuLi8uLi9yb3V0ZXIudHMnXG5cbmV4cG9ydCBjbGFzcyBTbWFydFJvdXRlcjxUPiBpbXBsZW1lbnRzIFJvdXRlcjxUPiB7XG4gIG5hbWU6IHN0cmluZyA9ICdTbWFydFJvdXRlcidcbiAgcm91dGVyczogUm91dGVyPFQ+W10gPSBbXVxuICByb3V0ZXM/OiBbc3RyaW5nLCBzdHJpbmcsIFRdW10gPSBbXVxuXG4gIGNvbnN0cnVjdG9yKGluaXQ6IFBpY2s8U21hcnRSb3V0ZXI8VD4sICdyb3V0ZXJzJz4pIHtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMsIGluaXQpXG4gIH1cblxuICBhZGQobWV0aG9kOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgaGFuZGxlcjogVCkge1xuICAgIGlmICghdGhpcy5yb3V0ZXMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2FuIG5vdCBhZGQgYSByb3V0ZSBzaW5jZSB0aGUgbWF0Y2hlciBpcyBhbHJlYWR5IGJ1aWx0LicpXG4gICAgfVxuXG4gICAgdGhpcy5yb3V0ZXMucHVzaChbbWV0aG9kLCBwYXRoLCBoYW5kbGVyXSlcbiAgfVxuXG4gIG1hdGNoKG1ldGhvZDogc3RyaW5nLCBwYXRoOiBzdHJpbmcpOiBSZXN1bHQ8VD4ge1xuICAgIGlmICghdGhpcy5yb3V0ZXMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRmF0YWwgZXJyb3InKVxuICAgIH1cblxuICAgIGNvbnN0IHsgcm91dGVycywgcm91dGVzIH0gPSB0aGlzXG4gICAgY29uc3QgbGVuID0gcm91dGVycy5sZW5ndGhcbiAgICBsZXQgaSA9IDBcbiAgICBsZXQgcmVzXG4gICAgZm9yICg7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3Qgcm91dGVyID0gcm91dGVyc1tpXVxuICAgICAgdHJ5IHtcbiAgICAgICAgcm91dGVzLmZvckVhY2goKGFyZ3MpID0+IHtcbiAgICAgICAgICByb3V0ZXIuYWRkKC4uLmFyZ3MpXG4gICAgICAgIH0pXG4gICAgICAgIHJlcyA9IHJvdXRlci5tYXRjaChtZXRob2QsIHBhdGgpXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChlIGluc3RhbmNlb2YgVW5zdXBwb3J0ZWRQYXRoRXJyb3IpIHtcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG4gICAgICAgIHRocm93IGVcbiAgICAgIH1cblxuICAgICAgdGhpcy5tYXRjaCA9IHJvdXRlci5tYXRjaC5iaW5kKHJvdXRlcilcbiAgICAgIHRoaXMucm91dGVycyA9IFtyb3V0ZXJdXG4gICAgICB0aGlzLnJvdXRlcyA9IHVuZGVmaW5lZFxuICAgICAgYnJlYWtcbiAgICB9XG5cbiAgICBpZiAoaSA9PT0gbGVuKSB7XG4gICAgICAvLyBub3QgZm91bmRcbiAgICAgIHRocm93IG5ldyBFcnJvcignRmF0YWwgZXJyb3InKVxuICAgIH1cblxuICAgIC8vIGUuZy4gXCJTbWFydFJvdXRlciArIFJlZ0V4cFJvdXRlclwiXG4gICAgdGhpcy5uYW1lID0gYFNtYXJ0Um91dGVyICsgJHt0aGlzLmFjdGl2ZVJvdXRlci5uYW1lfWBcblxuICAgIHJldHVybiByZXMgYXMgUmVzdWx0PFQ+XG4gIH1cblxuICBnZXQgYWN0aXZlUm91dGVyKCkge1xuICAgIGlmICh0aGlzLnJvdXRlcyB8fCB0aGlzLnJvdXRlcnMubGVuZ3RoICE9PSAxKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGFjdGl2ZSByb3V0ZXIgaGFzIGJlZW4gZGV0ZXJtaW5lZCB5ZXQuJylcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5yb3V0ZXJzWzBdXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxvREFBb0QsR0FFcEQsU0FBUyxvQkFBb0IsUUFBUSxrQkFBaUI7QUFFdEQsT0FBTyxNQUFNO0lBQ1gsT0FBZSxjQUFhO0lBQzVCLFVBQXVCLEVBQUUsQ0FBQTtJQUN6QixTQUFpQyxFQUFFLENBQUE7SUFFbkMsWUFBWSxJQUFxQyxDQUFFO1FBQ2pELE9BQU8sTUFBTSxDQUFDLElBQUksRUFBRTtJQUN0QjtJQUVBLElBQUksTUFBYyxFQUFFLElBQVksRUFBRSxPQUFVLEVBQUU7UUFDNUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDaEIsTUFBTSxJQUFJLE1BQU0sMkRBQTBEO1FBQzVFLENBQUM7UUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUFDO1lBQVE7WUFBTTtTQUFRO0lBQzFDO0lBRUEsTUFBTSxNQUFjLEVBQUUsSUFBWSxFQUFhO1FBQzdDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2hCLE1BQU0sSUFBSSxNQUFNLGVBQWM7UUFDaEMsQ0FBQztRQUVELE1BQU0sRUFBRSxRQUFPLEVBQUUsT0FBTSxFQUFFLEdBQUcsSUFBSTtRQUNoQyxNQUFNLE1BQU0sUUFBUSxNQUFNO1FBQzFCLElBQUksSUFBSTtRQUNSLElBQUk7UUFDSixNQUFPLElBQUksS0FBSyxJQUFLO1lBQ25CLE1BQU0sU0FBUyxPQUFPLENBQUMsRUFBRTtZQUN6QixJQUFJO2dCQUNGLE9BQU8sT0FBTyxDQUFDLENBQUMsT0FBUztvQkFDdkIsT0FBTyxHQUFHLElBQUk7Z0JBQ2hCO2dCQUNBLE1BQU0sT0FBTyxLQUFLLENBQUMsUUFBUTtZQUM3QixFQUFFLE9BQU8sR0FBRztnQkFDVixJQUFJLGFBQWEsc0JBQXNCO29CQUNyQyxRQUFRO2dCQUNWLENBQUM7Z0JBQ0QsTUFBTSxFQUFDO1lBQ1Q7WUFFQSxJQUFJLENBQUMsS0FBSyxHQUFHLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQztZQUMvQixJQUFJLENBQUMsT0FBTyxHQUFHO2dCQUFDO2FBQU87WUFDdkIsSUFBSSxDQUFDLE1BQU0sR0FBRztZQUNkLEtBQUs7UUFDUDtRQUVBLElBQUksTUFBTSxLQUFLO1lBQ2IsWUFBWTtZQUNaLE1BQU0sSUFBSSxNQUFNLGVBQWM7UUFDaEMsQ0FBQztRQUVELG9DQUFvQztRQUNwQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFckQsT0FBTztJQUNUO0lBRUEsSUFBSSxlQUFlO1FBQ2pCLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sS0FBSyxHQUFHO1lBQzVDLE1BQU0sSUFBSSxNQUFNLDZDQUE0QztRQUM5RCxDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7SUFDeEI7QUFDRixDQUFDIn0=