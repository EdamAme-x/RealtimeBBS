import { Node } from './node.ts';
export class Trie {
    context = {
        varIndex: 0
    };
    root = new Node();
    insert(path, index, pathErrorCheckOnly) {
        const paramAssoc = [];
        const groups = [] // [mark, original string]
        ;
        for(let i = 0;;){
            let replaced = false;
            path = path.replace(/\{[^}]+\}/g, (m)=>{
                const mark = `@\\${i}`;
                groups[i] = [
                    mark,
                    m
                ];
                i++;
                replaced = true;
                return mark;
            });
            if (!replaced) {
                break;
            }
        }
        /**
     *  - pattern (:label, :label{0-9]+}, ...)
     *  - /* wildcard
     *  - character
     */ const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
        for(let i = groups.length - 1; i >= 0; i--){
            const [mark] = groups[i];
            for(let j = tokens.length - 1; j >= 0; j--){
                if (tokens[j].indexOf(mark) !== -1) {
                    tokens[j] = tokens[j].replace(mark, groups[i][1]);
                    break;
                }
            }
        }
        this.root.insert(tokens, index, paramAssoc, this.context, pathErrorCheckOnly);
        return paramAssoc;
    }
    buildRegExp() {
        let regexp = this.root.buildRegExpStr();
        if (regexp === '') {
            return [
                /^$/,
                [],
                []
            ] // never match
            ;
        }
        let captureIndex = 0;
        const indexReplacementMap = [];
        const paramReplacementMap = [];
        regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex)=>{
            if (typeof handlerIndex !== 'undefined') {
                indexReplacementMap[++captureIndex] = Number(handlerIndex);
                return '$()';
            }
            if (typeof paramIndex !== 'undefined') {
                paramReplacementMap[Number(paramIndex)] = ++captureIndex;
                return '';
            }
            return '';
        });
        return [
            new RegExp(`^${regexp}`),
            indexReplacementMap,
            paramReplacementMap
        ];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvcm91dGVyL3JlZy1leHAtcm91dGVyL3RyaWUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBQYXJhbUFzc29jQXJyYXksIENvbnRleHQgfSBmcm9tICcuL25vZGUudHMnXG5pbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi9ub2RlLnRzJ1xuXG5leHBvcnQgdHlwZSBSZXBsYWNlbWVudE1hcCA9IG51bWJlcltdXG5cbmV4cG9ydCBjbGFzcyBUcmllIHtcbiAgY29udGV4dDogQ29udGV4dCA9IHsgdmFySW5kZXg6IDAgfVxuICByb290OiBOb2RlID0gbmV3IE5vZGUoKVxuXG4gIGluc2VydChwYXRoOiBzdHJpbmcsIGluZGV4OiBudW1iZXIsIHBhdGhFcnJvckNoZWNrT25seTogYm9vbGVhbik6IFBhcmFtQXNzb2NBcnJheSB7XG4gICAgY29uc3QgcGFyYW1Bc3NvYzogUGFyYW1Bc3NvY0FycmF5ID0gW11cblxuICAgIGNvbnN0IGdyb3VwczogW3N0cmluZywgc3RyaW5nXVtdID0gW10gLy8gW21hcmssIG9yaWdpbmFsIHN0cmluZ11cbiAgICBmb3IgKGxldCBpID0gMDsgOyApIHtcbiAgICAgIGxldCByZXBsYWNlZCA9IGZhbHNlXG4gICAgICBwYXRoID0gcGF0aC5yZXBsYWNlKC9cXHtbXn1dK1xcfS9nLCAobSkgPT4ge1xuICAgICAgICBjb25zdCBtYXJrID0gYEBcXFxcJHtpfWBcbiAgICAgICAgZ3JvdXBzW2ldID0gW21hcmssIG1dXG4gICAgICAgIGkrK1xuICAgICAgICByZXBsYWNlZCA9IHRydWVcbiAgICAgICAgcmV0dXJuIG1hcmtcbiAgICAgIH0pXG4gICAgICBpZiAoIXJlcGxhY2VkKSB7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogIC0gcGF0dGVybiAoOmxhYmVsLCA6bGFiZWx7MC05XSt9LCAuLi4pXG4gICAgICogIC0gLyogd2lsZGNhcmRcbiAgICAgKiAgLSBjaGFyYWN0ZXJcbiAgICAgKi9cbiAgICBjb25zdCB0b2tlbnMgPSBwYXRoLm1hdGNoKC8oPzo6W15cXC9dKyl8KD86XFwvXFwqJCl8Li9nKSB8fCBbXVxuICAgIGZvciAobGV0IGkgPSBncm91cHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGNvbnN0IFttYXJrXSA9IGdyb3Vwc1tpXVxuICAgICAgZm9yIChsZXQgaiA9IHRva2Vucy5sZW5ndGggLSAxOyBqID49IDA7IGotLSkge1xuICAgICAgICBpZiAodG9rZW5zW2pdLmluZGV4T2YobWFyaykgIT09IC0xKSB7XG4gICAgICAgICAgdG9rZW5zW2pdID0gdG9rZW5zW2pdLnJlcGxhY2UobWFyaywgZ3JvdXBzW2ldWzFdKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnJvb3QuaW5zZXJ0KHRva2VucywgaW5kZXgsIHBhcmFtQXNzb2MsIHRoaXMuY29udGV4dCwgcGF0aEVycm9yQ2hlY2tPbmx5KVxuXG4gICAgcmV0dXJuIHBhcmFtQXNzb2NcbiAgfVxuXG4gIGJ1aWxkUmVnRXhwKCk6IFtSZWdFeHAsIFJlcGxhY2VtZW50TWFwLCBSZXBsYWNlbWVudE1hcF0ge1xuICAgIGxldCByZWdleHAgPSB0aGlzLnJvb3QuYnVpbGRSZWdFeHBTdHIoKVxuICAgIGlmIChyZWdleHAgPT09ICcnKSB7XG4gICAgICByZXR1cm4gWy9eJC8sIFtdLCBbXV0gLy8gbmV2ZXIgbWF0Y2hcbiAgICB9XG5cbiAgICBsZXQgY2FwdHVyZUluZGV4ID0gMFxuICAgIGNvbnN0IGluZGV4UmVwbGFjZW1lbnRNYXA6IFJlcGxhY2VtZW50TWFwID0gW11cbiAgICBjb25zdCBwYXJhbVJlcGxhY2VtZW50TWFwOiBSZXBsYWNlbWVudE1hcCA9IFtdXG5cbiAgICByZWdleHAgPSByZWdleHAucmVwbGFjZSgvIyhcXGQrKXxAKFxcZCspfFxcLlxcKlxcJC9nLCAoXywgaGFuZGxlckluZGV4LCBwYXJhbUluZGV4KSA9PiB7XG4gICAgICBpZiAodHlwZW9mIGhhbmRsZXJJbmRleCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgaW5kZXhSZXBsYWNlbWVudE1hcFsrK2NhcHR1cmVJbmRleF0gPSBOdW1iZXIoaGFuZGxlckluZGV4KVxuICAgICAgICByZXR1cm4gJyQoKSdcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgcGFyYW1JbmRleCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcGFyYW1SZXBsYWNlbWVudE1hcFtOdW1iZXIocGFyYW1JbmRleCldID0gKytjYXB0dXJlSW5kZXhcbiAgICAgICAgcmV0dXJuICcnXG4gICAgICB9XG5cbiAgICAgIHJldHVybiAnJ1xuICAgIH0pXG5cbiAgICByZXR1cm4gW25ldyBSZWdFeHAoYF4ke3JlZ2V4cH1gKSwgaW5kZXhSZXBsYWNlbWVudE1hcCwgcGFyYW1SZXBsYWNlbWVudE1hcF1cbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLFNBQVMsSUFBSSxRQUFRLFlBQVc7QUFJaEMsT0FBTyxNQUFNO0lBQ1gsVUFBbUI7UUFBRSxVQUFVO0lBQUUsRUFBQztJQUNsQyxPQUFhLElBQUksT0FBTTtJQUV2QixPQUFPLElBQVksRUFBRSxLQUFhLEVBQUUsa0JBQTJCLEVBQW1CO1FBQ2hGLE1BQU0sYUFBOEIsRUFBRTtRQUV0QyxNQUFNLFNBQTZCLEVBQUUsQ0FBQywwQkFBMEI7O1FBQ2hFLElBQUssSUFBSSxJQUFJLElBQU87WUFDbEIsSUFBSSxXQUFXLEtBQUs7WUFDcEIsT0FBTyxLQUFLLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBTTtnQkFDdkMsTUFBTSxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztnQkFDdEIsTUFBTSxDQUFDLEVBQUUsR0FBRztvQkFBQztvQkFBTTtpQkFBRTtnQkFDckI7Z0JBQ0EsV0FBVyxJQUFJO2dCQUNmLE9BQU87WUFDVDtZQUNBLElBQUksQ0FBQyxVQUFVO2dCQUNiLEtBQUs7WUFDUCxDQUFDO1FBQ0g7UUFFQTs7OztLQUlDLEdBQ0QsTUFBTSxTQUFTLEtBQUssS0FBSyxDQUFDLCtCQUErQixFQUFFO1FBQzNELElBQUssSUFBSSxJQUFJLE9BQU8sTUFBTSxHQUFHLEdBQUcsS0FBSyxHQUFHLElBQUs7WUFDM0MsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsRUFBRTtZQUN4QixJQUFLLElBQUksSUFBSSxPQUFPLE1BQU0sR0FBRyxHQUFHLEtBQUssR0FBRyxJQUFLO2dCQUMzQyxJQUFJLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHO29CQUNsQyxNQUFNLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFO29CQUNoRCxLQUFLO2dCQUNQLENBQUM7WUFDSDtRQUNGO1FBRUEsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxPQUFPLFlBQVksSUFBSSxDQUFDLE9BQU8sRUFBRTtRQUUxRCxPQUFPO0lBQ1Q7SUFFQSxjQUF3RDtRQUN0RCxJQUFJLFNBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjO1FBQ3JDLElBQUksV0FBVyxJQUFJO1lBQ2pCLE9BQU87Z0JBQUM7Z0JBQU0sRUFBRTtnQkFBRSxFQUFFO2FBQUMsQ0FBQyxjQUFjOztRQUN0QyxDQUFDO1FBRUQsSUFBSSxlQUFlO1FBQ25CLE1BQU0sc0JBQXNDLEVBQUU7UUFDOUMsTUFBTSxzQkFBc0MsRUFBRTtRQUU5QyxTQUFTLE9BQU8sT0FBTyxDQUFDLHlCQUF5QixDQUFDLEdBQUcsY0FBYyxhQUFlO1lBQ2hGLElBQUksT0FBTyxpQkFBaUIsYUFBYTtnQkFDdkMsbUJBQW1CLENBQUMsRUFBRSxhQUFhLEdBQUcsT0FBTztnQkFDN0MsT0FBTztZQUNULENBQUM7WUFDRCxJQUFJLE9BQU8sZUFBZSxhQUFhO2dCQUNyQyxtQkFBbUIsQ0FBQyxPQUFPLFlBQVksR0FBRyxFQUFFO2dCQUM1QyxPQUFPO1lBQ1QsQ0FBQztZQUVELE9BQU87UUFDVDtRQUVBLE9BQU87WUFBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDO1lBQUc7WUFBcUI7U0FBb0I7SUFDN0U7QUFDRixDQUFDIn0=