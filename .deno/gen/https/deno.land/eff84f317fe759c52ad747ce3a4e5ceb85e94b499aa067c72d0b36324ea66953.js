import { METHOD_NAME_ALL } from '../../router.ts';
import { splitPath, splitRoutingPath, getPattern } from '../../utils/url.ts';
export class Node {
    methods;
    children;
    patterns;
    order = 0;
    name;
    params = {};
    constructor(method, handler, children){
        this.children = children || {};
        this.methods = [];
        this.name = '';
        if (method && handler) {
            const m = {};
            m[method] = {
                handler,
                params: {},
                possibleKeys: [],
                score: 0,
                name: this.name
            };
            this.methods = [
                m
            ];
        }
        this.patterns = [];
    }
    insert(method, path, handler) {
        this.name = `${method} ${path}`;
        this.order = ++this.order;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let curNode = this;
        const parts = splitRoutingPath(path);
        const possibleKeys = [];
        const parentPatterns = [];
        for(let i = 0, len = parts.length; i < len; i++){
            const p = parts[i];
            if (Object.keys(curNode.children).includes(p)) {
                parentPatterns.push(...curNode.patterns);
                curNode = curNode.children[p];
                const pattern = getPattern(p);
                if (pattern) possibleKeys.push(pattern[1]);
                continue;
            }
            curNode.children[p] = new Node();
            const pattern = getPattern(p);
            if (pattern) {
                curNode.patterns.push(pattern);
                parentPatterns.push(...curNode.patterns);
                possibleKeys.push(pattern[1]);
            }
            parentPatterns.push(...curNode.patterns);
            curNode = curNode.children[p];
        }
        if (!curNode.methods.length) {
            curNode.methods = [];
        }
        const m = {};
        const handlerSet = {
            handler,
            params: {},
            possibleKeys,
            name: this.name,
            score: this.order
        };
        m[method] = handlerSet;
        curNode.methods.push(m);
        return curNode;
    }
    // getHandlerSets
    gHSets(node, method, params) {
        const handlerSets = [];
        for(let i = 0, len = node.methods.length; i < len; i++){
            const m = node.methods[i];
            const handlerSet = m[method] || m[METHOD_NAME_ALL];
            if (handlerSet !== undefined) {
                handlerSet.possibleKeys.map((key)=>{
                    handlerSet.params[key] = params[key];
                });
                handlerSets.push(handlerSet);
            }
        }
        return handlerSets;
    }
    search(method, path) {
        const handlerSets = [];
        const params = {};
        this.params = {};
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const curNode = this;
        let curNodes = [
            curNode
        ];
        const parts = splitPath(path);
        for(let i = 0, len = parts.length; i < len; i++){
            const part = parts[i];
            const isLast = i === len - 1;
            const tempNodes = [];
            for(let j = 0, len2 = curNodes.length; j < len2; j++){
                const node = curNodes[j];
                const nextNode = node.children[part];
                if (nextNode) {
                    if (isLast === true) {
                        // '/hello/*' => match '/hello'
                        if (nextNode.children['*']) {
                            handlerSets.push(...this.gHSets(nextNode.children['*'], method, {
                                ...params,
                                ...node.params
                            }));
                        }
                        handlerSets.push(...this.gHSets(nextNode, method, {
                            ...params,
                            ...node.params
                        }));
                    } else {
                        tempNodes.push(nextNode);
                    }
                }
                for(let k = 0, len3 = node.patterns.length; k < len3; k++){
                    const pattern = node.patterns[k];
                    // Wildcard
                    // '/hello/*/foo' => match /hello/bar/foo
                    if (pattern === '*') {
                        const astNode = node.children['*'];
                        if (astNode) {
                            handlerSets.push(...this.gHSets(astNode, method, {
                                ...params,
                                ...node.params
                            }));
                            tempNodes.push(astNode);
                        }
                        continue;
                    }
                    if (part === '') continue;
                    const [key, name, matcher] = pattern;
                    const child = node.children[key];
                    // `/js/:filename{[a-z]+.js}` => match /js/chunk/123.js
                    const restPathString = parts.slice(i).join('/');
                    if (matcher instanceof RegExp && matcher.test(restPathString)) {
                        params[name] = restPathString;
                        handlerSets.push(...this.gHSets(child, method, {
                            ...params,
                            ...node.params
                        }));
                        continue;
                    }
                    if (matcher === true || matcher instanceof RegExp && matcher.test(part)) {
                        if (typeof key === 'string') {
                            params[name] = part;
                            if (isLast === true) {
                                handlerSets.push(...this.gHSets(child, method, {
                                    ...params,
                                    ...node.params
                                }));
                                if (child.children['*']) {
                                    handlerSets.push(...this.gHSets(child.children['*'], method, {
                                        ...params,
                                        ...node.params
                                    }));
                                }
                            } else {
                                child.params = {
                                    ...params
                                };
                                tempNodes.push(child);
                            }
                        }
                    }
                }
            }
            curNodes = tempNodes;
        }
        const results = handlerSets.sort((a, b)=>{
            return a.score - b.score;
        });
        return [
            results.map(({ handler , params  })=>[
                    handler,
                    params
                ])
        ];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvcm91dGVyL3RyaWUtcm91dGVyL25vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBQYXJhbXMgfSBmcm9tICcuLi8uLi9yb3V0ZXIudHMnXG5pbXBvcnQgeyBNRVRIT0RfTkFNRV9BTEwgfSBmcm9tICcuLi8uLi9yb3V0ZXIudHMnXG5pbXBvcnQgdHlwZSB7IFBhdHRlcm4gfSBmcm9tICcuLi8uLi91dGlscy91cmwudHMnXG5pbXBvcnQgeyBzcGxpdFBhdGgsIHNwbGl0Um91dGluZ1BhdGgsIGdldFBhdHRlcm4gfSBmcm9tICcuLi8uLi91dGlscy91cmwudHMnXG5cbnR5cGUgSGFuZGxlclNldDxUPiA9IHtcbiAgaGFuZGxlcjogVFxuICBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz5cbiAgcG9zc2libGVLZXlzOiBzdHJpbmdbXVxuICBzY29yZTogbnVtYmVyXG4gIG5hbWU6IHN0cmluZyAvLyBGb3IgZGVidWdcbn1cblxuZXhwb3J0IGNsYXNzIE5vZGU8VD4ge1xuICBtZXRob2RzOiBSZWNvcmQ8c3RyaW5nLCBIYW5kbGVyU2V0PFQ+PltdXG5cbiAgY2hpbGRyZW46IFJlY29yZDxzdHJpbmcsIE5vZGU8VD4+XG4gIHBhdHRlcm5zOiBQYXR0ZXJuW11cbiAgb3JkZXI6IG51bWJlciA9IDBcbiAgbmFtZTogc3RyaW5nXG4gIHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9XG5cbiAgY29uc3RydWN0b3IobWV0aG9kPzogc3RyaW5nLCBoYW5kbGVyPzogVCwgY2hpbGRyZW4/OiBSZWNvcmQ8c3RyaW5nLCBOb2RlPFQ+Pikge1xuICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbiB8fCB7fVxuICAgIHRoaXMubWV0aG9kcyA9IFtdXG4gICAgdGhpcy5uYW1lID0gJydcbiAgICBpZiAobWV0aG9kICYmIGhhbmRsZXIpIHtcbiAgICAgIGNvbnN0IG06IFJlY29yZDxzdHJpbmcsIEhhbmRsZXJTZXQ8VD4+ID0ge31cbiAgICAgIG1bbWV0aG9kXSA9IHsgaGFuZGxlciwgcGFyYW1zOiB7fSwgcG9zc2libGVLZXlzOiBbXSwgc2NvcmU6IDAsIG5hbWU6IHRoaXMubmFtZSB9XG4gICAgICB0aGlzLm1ldGhvZHMgPSBbbV1cbiAgICB9XG4gICAgdGhpcy5wYXR0ZXJucyA9IFtdXG4gIH1cblxuICBpbnNlcnQobWV0aG9kOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgaGFuZGxlcjogVCk6IE5vZGU8VD4ge1xuICAgIHRoaXMubmFtZSA9IGAke21ldGhvZH0gJHtwYXRofWBcbiAgICB0aGlzLm9yZGVyID0gKyt0aGlzLm9yZGVyXG5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXRoaXMtYWxpYXNcbiAgICBsZXQgY3VyTm9kZTogTm9kZTxUPiA9IHRoaXNcbiAgICBjb25zdCBwYXJ0cyA9IHNwbGl0Um91dGluZ1BhdGgocGF0aClcblxuICAgIGNvbnN0IHBvc3NpYmxlS2V5czogc3RyaW5nW10gPSBbXVxuICAgIGNvbnN0IHBhcmVudFBhdHRlcm5zOiBQYXR0ZXJuW10gPSBbXVxuXG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHBhcnRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBjb25zdCBwOiBzdHJpbmcgPSBwYXJ0c1tpXVxuXG4gICAgICBpZiAoT2JqZWN0LmtleXMoY3VyTm9kZS5jaGlsZHJlbikuaW5jbHVkZXMocCkpIHtcbiAgICAgICAgcGFyZW50UGF0dGVybnMucHVzaCguLi5jdXJOb2RlLnBhdHRlcm5zKVxuICAgICAgICBjdXJOb2RlID0gY3VyTm9kZS5jaGlsZHJlbltwXVxuICAgICAgICBjb25zdCBwYXR0ZXJuID0gZ2V0UGF0dGVybihwKVxuICAgICAgICBpZiAocGF0dGVybikgcG9zc2libGVLZXlzLnB1c2gocGF0dGVyblsxXSlcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgY3VyTm9kZS5jaGlsZHJlbltwXSA9IG5ldyBOb2RlKClcblxuICAgICAgY29uc3QgcGF0dGVybiA9IGdldFBhdHRlcm4ocClcbiAgICAgIGlmIChwYXR0ZXJuKSB7XG4gICAgICAgIGN1ck5vZGUucGF0dGVybnMucHVzaChwYXR0ZXJuKVxuICAgICAgICBwYXJlbnRQYXR0ZXJucy5wdXNoKC4uLmN1ck5vZGUucGF0dGVybnMpXG4gICAgICAgIHBvc3NpYmxlS2V5cy5wdXNoKHBhdHRlcm5bMV0pXG4gICAgICB9XG4gICAgICBwYXJlbnRQYXR0ZXJucy5wdXNoKC4uLmN1ck5vZGUucGF0dGVybnMpXG4gICAgICBjdXJOb2RlID0gY3VyTm9kZS5jaGlsZHJlbltwXVxuICAgIH1cblxuICAgIGlmICghY3VyTm9kZS5tZXRob2RzLmxlbmd0aCkge1xuICAgICAgY3VyTm9kZS5tZXRob2RzID0gW11cbiAgICB9XG5cbiAgICBjb25zdCBtOiBSZWNvcmQ8c3RyaW5nLCBIYW5kbGVyU2V0PFQ+PiA9IHt9XG5cbiAgICBjb25zdCBoYW5kbGVyU2V0OiBIYW5kbGVyU2V0PFQ+ID0ge1xuICAgICAgaGFuZGxlcixcbiAgICAgIHBhcmFtczoge30sXG4gICAgICBwb3NzaWJsZUtleXMsXG4gICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICBzY29yZTogdGhpcy5vcmRlcixcbiAgICB9XG5cbiAgICBtW21ldGhvZF0gPSBoYW5kbGVyU2V0XG4gICAgY3VyTm9kZS5tZXRob2RzLnB1c2gobSlcblxuICAgIHJldHVybiBjdXJOb2RlXG4gIH1cblxuICAvLyBnZXRIYW5kbGVyU2V0c1xuICBwcml2YXRlIGdIU2V0cyhub2RlOiBOb2RlPFQ+LCBtZXRob2Q6IHN0cmluZywgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KTogSGFuZGxlclNldDxUPltdIHtcbiAgICBjb25zdCBoYW5kbGVyU2V0czogSGFuZGxlclNldDxUPltdID0gW11cbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gbm9kZS5tZXRob2RzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBjb25zdCBtID0gbm9kZS5tZXRob2RzW2ldXG4gICAgICBjb25zdCBoYW5kbGVyU2V0ID0gbVttZXRob2RdIHx8IG1bTUVUSE9EX05BTUVfQUxMXVxuICAgICAgaWYgKGhhbmRsZXJTZXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBoYW5kbGVyU2V0LnBvc3NpYmxlS2V5cy5tYXAoKGtleSkgPT4ge1xuICAgICAgICAgIGhhbmRsZXJTZXQucGFyYW1zW2tleV0gPSBwYXJhbXNba2V5XVxuICAgICAgICB9KVxuICAgICAgICBoYW5kbGVyU2V0cy5wdXNoKGhhbmRsZXJTZXQpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBoYW5kbGVyU2V0c1xuICB9XG5cbiAgc2VhcmNoKG1ldGhvZDogc3RyaW5nLCBwYXRoOiBzdHJpbmcpOiBbW1QsIFBhcmFtc11bXV0ge1xuICAgIGNvbnN0IGhhbmRsZXJTZXRzOiBIYW5kbGVyU2V0PFQ+W10gPSBbXVxuXG4gICAgY29uc3QgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge31cbiAgICB0aGlzLnBhcmFtcyA9IHt9XG5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXRoaXMtYWxpYXNcbiAgICBjb25zdCBjdXJOb2RlOiBOb2RlPFQ+ID0gdGhpc1xuICAgIGxldCBjdXJOb2RlcyA9IFtjdXJOb2RlXVxuICAgIGNvbnN0IHBhcnRzID0gc3BsaXRQYXRoKHBhdGgpXG5cbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gcGFydHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IHBhcnQ6IHN0cmluZyA9IHBhcnRzW2ldXG4gICAgICBjb25zdCBpc0xhc3QgPSBpID09PSBsZW4gLSAxXG4gICAgICBjb25zdCB0ZW1wTm9kZXM6IE5vZGU8VD5bXSA9IFtdXG5cbiAgICAgIGZvciAobGV0IGogPSAwLCBsZW4yID0gY3VyTm9kZXMubGVuZ3RoOyBqIDwgbGVuMjsgaisrKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBjdXJOb2Rlc1tqXVxuICAgICAgICBjb25zdCBuZXh0Tm9kZSA9IG5vZGUuY2hpbGRyZW5bcGFydF1cblxuICAgICAgICBpZiAobmV4dE5vZGUpIHtcbiAgICAgICAgICBpZiAoaXNMYXN0ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAvLyAnL2hlbGxvLyonID0+IG1hdGNoICcvaGVsbG8nXG4gICAgICAgICAgICBpZiAobmV4dE5vZGUuY2hpbGRyZW5bJyonXSkge1xuICAgICAgICAgICAgICBoYW5kbGVyU2V0cy5wdXNoKFxuICAgICAgICAgICAgICAgIC4uLnRoaXMuZ0hTZXRzKG5leHROb2RlLmNoaWxkcmVuWycqJ10sIG1ldGhvZCwgeyAuLi5wYXJhbXMsIC4uLm5vZGUucGFyYW1zIH0pXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGhhbmRsZXJTZXRzLnB1c2goLi4udGhpcy5nSFNldHMobmV4dE5vZGUsIG1ldGhvZCwgeyAuLi5wYXJhbXMsIC4uLm5vZGUucGFyYW1zIH0pKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0ZW1wTm9kZXMucHVzaChuZXh0Tm9kZSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBrID0gMCwgbGVuMyA9IG5vZGUucGF0dGVybnMubGVuZ3RoOyBrIDwgbGVuMzsgaysrKSB7XG4gICAgICAgICAgY29uc3QgcGF0dGVybiA9IG5vZGUucGF0dGVybnNba11cblxuICAgICAgICAgIC8vIFdpbGRjYXJkXG4gICAgICAgICAgLy8gJy9oZWxsby8qL2ZvbycgPT4gbWF0Y2ggL2hlbGxvL2Jhci9mb29cbiAgICAgICAgICBpZiAocGF0dGVybiA9PT0gJyonKSB7XG4gICAgICAgICAgICBjb25zdCBhc3ROb2RlID0gbm9kZS5jaGlsZHJlblsnKiddXG4gICAgICAgICAgICBpZiAoYXN0Tm9kZSkge1xuICAgICAgICAgICAgICBoYW5kbGVyU2V0cy5wdXNoKC4uLnRoaXMuZ0hTZXRzKGFzdE5vZGUsIG1ldGhvZCwgeyAuLi5wYXJhbXMsIC4uLm5vZGUucGFyYW1zIH0pKVxuICAgICAgICAgICAgICB0ZW1wTm9kZXMucHVzaChhc3ROb2RlKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAocGFydCA9PT0gJycpIGNvbnRpbnVlXG5cbiAgICAgICAgICBjb25zdCBba2V5LCBuYW1lLCBtYXRjaGVyXSA9IHBhdHRlcm5cblxuICAgICAgICAgIGNvbnN0IGNoaWxkID0gbm9kZS5jaGlsZHJlbltrZXldXG5cbiAgICAgICAgICAvLyBgL2pzLzpmaWxlbmFtZXtbYS16XSsuanN9YCA9PiBtYXRjaCAvanMvY2h1bmsvMTIzLmpzXG4gICAgICAgICAgY29uc3QgcmVzdFBhdGhTdHJpbmcgPSBwYXJ0cy5zbGljZShpKS5qb2luKCcvJylcbiAgICAgICAgICBpZiAobWF0Y2hlciBpbnN0YW5jZW9mIFJlZ0V4cCAmJiBtYXRjaGVyLnRlc3QocmVzdFBhdGhTdHJpbmcpKSB7XG4gICAgICAgICAgICBwYXJhbXNbbmFtZV0gPSByZXN0UGF0aFN0cmluZ1xuICAgICAgICAgICAgaGFuZGxlclNldHMucHVzaCguLi50aGlzLmdIU2V0cyhjaGlsZCwgbWV0aG9kLCB7IC4uLnBhcmFtcywgLi4ubm9kZS5wYXJhbXMgfSkpXG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChtYXRjaGVyID09PSB0cnVlIHx8IChtYXRjaGVyIGluc3RhbmNlb2YgUmVnRXhwICYmIG1hdGNoZXIudGVzdChwYXJ0KSkpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICBwYXJhbXNbbmFtZV0gPSBwYXJ0XG4gICAgICAgICAgICAgIGlmIChpc0xhc3QgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyU2V0cy5wdXNoKC4uLnRoaXMuZ0hTZXRzKGNoaWxkLCBtZXRob2QsIHsgLi4ucGFyYW1zLCAuLi5ub2RlLnBhcmFtcyB9KSlcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQuY2hpbGRyZW5bJyonXSkge1xuICAgICAgICAgICAgICAgICAgaGFuZGxlclNldHMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgLi4udGhpcy5nSFNldHMoY2hpbGQuY2hpbGRyZW5bJyonXSwgbWV0aG9kLCB7IC4uLnBhcmFtcywgLi4ubm9kZS5wYXJhbXMgfSlcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2hpbGQucGFyYW1zID0geyAuLi5wYXJhbXMgfVxuICAgICAgICAgICAgICAgIHRlbXBOb2Rlcy5wdXNoKGNoaWxkKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGN1ck5vZGVzID0gdGVtcE5vZGVzXG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdHMgPSBoYW5kbGVyU2V0cy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICByZXR1cm4gYS5zY29yZSAtIGIuc2NvcmVcbiAgICB9KVxuXG4gICAgcmV0dXJuIFtyZXN1bHRzLm1hcCgoeyBoYW5kbGVyLCBwYXJhbXMgfSkgPT4gW2hhbmRsZXIsIHBhcmFtc10gYXMgW1QsIFBhcmFtc10pXVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsU0FBUyxlQUFlLFFBQVEsa0JBQWlCO0FBRWpELFNBQVMsU0FBUyxFQUFFLGdCQUFnQixFQUFFLFVBQVUsUUFBUSxxQkFBb0I7QUFVNUUsT0FBTyxNQUFNO0lBQ1gsUUFBd0M7SUFFeEMsU0FBaUM7SUFDakMsU0FBbUI7SUFDbkIsUUFBZ0IsRUFBQztJQUNqQixL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