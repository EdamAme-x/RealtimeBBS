import { HonoBase } from './hono-base.ts';
import { RegExpRouter } from './router/reg-exp-router/index.ts';
import { SmartRouter } from './router/smart-router/index.ts';
import { TrieRouter } from './router/trie-router/index.ts';
export class Hono extends HonoBase {
    constructor(options = {}){
        super(options);
        this.router = options.router ?? new SmartRouter({
            routers: [
                new RegExpRouter(),
                new TrieRouter()
            ]
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvaG9uby50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIb25vQmFzZSB9IGZyb20gJy4vaG9uby1iYXNlLnRzJ1xuaW1wb3J0IHR5cGUgeyBIb25vT3B0aW9ucyB9IGZyb20gJy4vaG9uby1iYXNlLnRzJ1xuaW1wb3J0IHsgUmVnRXhwUm91dGVyIH0gZnJvbSAnLi9yb3V0ZXIvcmVnLWV4cC1yb3V0ZXIvaW5kZXgudHMnXG5pbXBvcnQgeyBTbWFydFJvdXRlciB9IGZyb20gJy4vcm91dGVyL3NtYXJ0LXJvdXRlci9pbmRleC50cydcbmltcG9ydCB7IFRyaWVSb3V0ZXIgfSBmcm9tICcuL3JvdXRlci90cmllLXJvdXRlci9pbmRleC50cydcbmltcG9ydCB0eXBlIHsgRW52LCBTY2hlbWEgfSBmcm9tICcuL3R5cGVzLnRzJ1xuXG5leHBvcnQgY2xhc3MgSG9ubzxcbiAgRSBleHRlbmRzIEVudiA9IEVudixcbiAgUyBleHRlbmRzIFNjaGVtYSA9IHt9LFxuICBCYXNlUGF0aCBleHRlbmRzIHN0cmluZyA9ICcvJ1xuPiBleHRlbmRzIEhvbm9CYXNlPEUsIFMsIEJhc2VQYXRoPiB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IEhvbm9PcHRpb25zPEU+ID0ge30pIHtcbiAgICBzdXBlcihvcHRpb25zKVxuICAgIHRoaXMucm91dGVyID1cbiAgICAgIG9wdGlvbnMucm91dGVyID8/XG4gICAgICBuZXcgU21hcnRSb3V0ZXIoe1xuICAgICAgICByb3V0ZXJzOiBbbmV3IFJlZ0V4cFJvdXRlcigpLCBuZXcgVHJpZVJvdXRlcigpXSxcbiAgICAgIH0pXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLFFBQVEsUUFBUSxpQkFBZ0I7QUFFekMsU0FBUyxZQUFZLFFBQVEsbUNBQWtDO0FBQy9ELFNBQVMsV0FBVyxRQUFRLGlDQUFnQztBQUM1RCxTQUFTLFVBQVUsUUFBUSxnQ0FBK0I7QUFHMUQsT0FBTyxNQUFNLGFBSUg7SUFDUixZQUFZLFVBQTBCLENBQUMsQ0FBQyxDQUFFO1FBQ3hDLEtBQUssQ0FBQztRQUNOLElBQUksQ0FBQyxNQUFNLEdBQ1QsUUFBUSxNQUFNLElBQ2QsSUFBSSxZQUFZO1lBQ2QsU0FBUztnQkFBQyxJQUFJO2dCQUFnQixJQUFJO2FBQWE7UUFDakQ7SUFDSjtBQUNGLENBQUMifQ==