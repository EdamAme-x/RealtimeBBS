import { checkOptionalParameter } from '../../utils/url.ts';
import { Node } from './node.ts';
export class TrieRouter {
    name = 'TrieRouter';
    node;
    constructor(){
        this.node = new Node();
    }
    add(method, path, handler) {
        const results = checkOptionalParameter(path);
        if (results) {
            for (const p of results){
                this.node.insert(method, p, handler);
            }
            return;
        }
        this.node.insert(method, path, handler);
    }
    match(method, path) {
        return this.node.search(method, path);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvcm91dGVyL3RyaWUtcm91dGVyL3JvdXRlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFJlc3VsdCwgUm91dGVyIH0gZnJvbSAnLi4vLi4vcm91dGVyLnRzJ1xuaW1wb3J0IHsgY2hlY2tPcHRpb25hbFBhcmFtZXRlciB9IGZyb20gJy4uLy4uL3V0aWxzL3VybC50cydcbmltcG9ydCB7IE5vZGUgfSBmcm9tICcuL25vZGUudHMnXG5cbmV4cG9ydCBjbGFzcyBUcmllUm91dGVyPFQ+IGltcGxlbWVudHMgUm91dGVyPFQ+IHtcbiAgbmFtZTogc3RyaW5nID0gJ1RyaWVSb3V0ZXInXG4gIG5vZGU6IE5vZGU8VD5cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLm5vZGUgPSBuZXcgTm9kZSgpXG4gIH1cblxuICBhZGQobWV0aG9kOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgaGFuZGxlcjogVCkge1xuICAgIGNvbnN0IHJlc3VsdHMgPSBjaGVja09wdGlvbmFsUGFyYW1ldGVyKHBhdGgpXG4gICAgaWYgKHJlc3VsdHMpIHtcbiAgICAgIGZvciAoY29uc3QgcCBvZiByZXN1bHRzKSB7XG4gICAgICAgIHRoaXMubm9kZS5pbnNlcnQobWV0aG9kLCBwLCBoYW5kbGVyKVxuICAgICAgfVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5ub2RlLmluc2VydChtZXRob2QsIHBhdGgsIGhhbmRsZXIpXG4gIH1cblxuICBtYXRjaChtZXRob2Q6IHN0cmluZywgcGF0aDogc3RyaW5nKTogUmVzdWx0PFQ+IHtcbiAgICByZXR1cm4gdGhpcy5ub2RlLnNlYXJjaChtZXRob2QsIHBhdGgpXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxTQUFTLHNCQUFzQixRQUFRLHFCQUFvQjtBQUMzRCxTQUFTLElBQUksUUFBUSxZQUFXO0FBRWhDLE9BQU8sTUFBTTtJQUNYLE9BQWUsYUFBWTtJQUMzQixLQUFhO0lBRWIsYUFBYztRQUNaLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSTtJQUNsQjtJQUVBLElBQUksTUFBYyxFQUFFLElBQVksRUFBRSxPQUFVLEVBQUU7UUFDNUMsTUFBTSxVQUFVLHVCQUF1QjtRQUN2QyxJQUFJLFNBQVM7WUFDWCxLQUFLLE1BQU0sS0FBSyxRQUFTO2dCQUN2QixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEdBQUc7WUFDOUI7WUFDQTtRQUNGLENBQUM7UUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLE1BQU07SUFDakM7SUFFQSxNQUFNLE1BQWMsRUFBRSxJQUFZLEVBQWE7UUFDN0MsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRO0lBQ2xDO0FBQ0YsQ0FBQyJ9