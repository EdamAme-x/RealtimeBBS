import { escapeToBuffer } from '../utils/html.ts';
const emptyTags = [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'keygen',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
];
const booleanAttributes = [
    'allowfullscreen',
    'async',
    'autofocus',
    'autoplay',
    'checked',
    'controls',
    'default',
    'defer',
    'disabled',
    'formnovalidate',
    'hidden',
    'inert',
    'ismap',
    'itemscope',
    'loop',
    'multiple',
    'muted',
    'nomodule',
    'novalidate',
    'open',
    'playsinline',
    'readonly',
    'required',
    'reversed',
    'selected'
];
const childrenToStringToBuffer = (children, buffer)=>{
    for(let i = 0, len = children.length; i < len; i++){
        const child = children[i];
        if (typeof child === 'string') {
            escapeToBuffer(child, buffer);
        } else if (typeof child === 'boolean' || child === null || child === undefined) {
            continue;
        } else if (child instanceof JSXNode) {
            child.toStringToBuffer(buffer);
        } else if (typeof child === 'number' || child.isEscaped) {
            buffer[0] += child;
        } else {
            // `child` type is `Child[]`, so stringify recursively
            childrenToStringToBuffer(child, buffer);
        }
    }
};
export class JSXNode {
    tag;
    props;
    children;
    isEscaped = true;
    constructor(tag, props, children){
        this.tag = tag;
        this.props = props;
        this.children = children;
    }
    toString() {
        const buffer = [
            ''
        ];
        this.toStringToBuffer(buffer);
        return buffer[0];
    }
    toStringToBuffer(buffer) {
        const tag = this.tag;
        const props = this.props;
        let { children  } = this;
        buffer[0] += `<${tag}`;
        const propsKeys = Object.keys(props || {});
        for(let i = 0, len = propsKeys.length; i < len; i++){
            const key = propsKeys[i];
            const v = props[key];
            // object to style strings
            if (key === 'style' && typeof v === 'object') {
                const styles = Object.keys(v).map((k)=>{
                    const property = k.replace(/[A-Z]/g, (match)=>`-${match.toLowerCase()}`);
                    return `${property}:${v[k]}`;
                }).join(';');
                buffer[0] += ` style="${styles}"`;
            } else if (typeof v === 'string') {
                buffer[0] += ` ${key}="`;
                escapeToBuffer(v, buffer);
                buffer[0] += '"';
            } else if (typeof v === 'number') {
                buffer[0] += ` ${key}="${v}"`;
            } else if (v === null || v === undefined) {
            // Do nothing
            } else if (typeof v === 'boolean' && booleanAttributes.includes(key)) {
                if (v) {
                    buffer[0] += ` ${key}=""`;
                }
            } else if (key === 'dangerouslySetInnerHTML') {
                if (children.length > 0) {
                    throw 'Can only set one of `children` or `props.dangerouslySetInnerHTML`.';
                }
                const escapedString = new String(v.__html);
                escapedString.isEscaped = true;
                children = [
                    escapedString
                ];
            } else {
                buffer[0] += ` ${key}="`;
                escapeToBuffer(v.toString(), buffer);
                buffer[0] += '"';
            }
        }
        if (emptyTags.includes(tag)) {
            buffer[0] += '/>';
            return;
        }
        buffer[0] += '>';
        childrenToStringToBuffer(children, buffer);
        buffer[0] += `</${tag}>`;
    }
}
class JSXFunctionNode extends JSXNode {
    toStringToBuffer(buffer) {
        const { children  } = this;
        const res = this.tag.call(null, {
            ...this.props,
            children: children.length <= 1 ? children[0] : children
        });
        if (res instanceof JSXNode) {
            res.toStringToBuffer(buffer);
        } else if (typeof res === 'number' || res.isEscaped) {
            buffer[0] += res;
        } else {
            escapeToBuffer(res, buffer);
        }
    }
}
class JSXFragmentNode extends JSXNode {
    toStringToBuffer(buffer) {
        childrenToStringToBuffer(this.children, buffer);
    }
}
export { jsxFn as jsx };
const jsxFn = (tag, props, ...children)=>{
    if (typeof tag === 'function') {
        return new JSXFunctionNode(tag, props, children);
    } else {
        return new JSXNode(tag, props, children);
    }
};
const shallowEqual = (a, b)=>{
    if (a === b) {
        return true;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
        return false;
    }
    for(let i = 0, len = aKeys.length; i < len; i++){
        if (a[aKeys[i]] !== b[aKeys[i]]) {
            return false;
        }
    }
    return true;
};
export const memo = (component, propsAreEqual = shallowEqual)=>{
    let computed = undefined;
    let prevProps = undefined;
    return (props)=>{
        if (prevProps && !propsAreEqual(prevProps, props)) {
            computed = undefined;
        }
        prevProps = props;
        return computed ||= component(props);
    };
};
export const Fragment = (props)=>{
    return new JSXFragmentNode('', {}, props.children ? [
        props.children
    ] : []);
};
export const createContext = (defaultValue)=>{
    const values = [
        defaultValue
    ];
    return {
        values,
        Provider (props) {
            values.push(props.value);
            const res = new String(props.children ? (Array.isArray(props.children) ? new JSXFragmentNode('', {}, props.children) : props.children).toString() : '');
            res.isEscaped = true;
            values.pop();
            return res;
        }
    };
};
export const useContext = (context)=>{
    return context.values[context.values.length - 1];
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvanN4L2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGVzY2FwZVRvQnVmZmVyIH0gZnJvbSAnLi4vdXRpbHMvaHRtbC50cydcbmltcG9ydCB0eXBlIHsgU3RyaW5nQnVmZmVyLCBIdG1sRXNjYXBlZCwgSHRtbEVzY2FwZWRTdHJpbmcgfSBmcm9tICcuLi91dGlscy9odG1sLnRzJ1xuaW1wb3J0IHR5cGUgeyBJbnRyaW5zaWNFbGVtZW50cyBhcyBJbnRyaW5zaWNFbGVtZW50c0RlZmluZWQgfSBmcm9tICcuL2ludHJpbnNpYy1lbGVtZW50cy50cydcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbnR5cGUgUHJvcHMgPSBSZWNvcmQ8c3RyaW5nLCBhbnk+XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1uYW1lc3BhY2VcbiAgbmFtZXNwYWNlIEpTWCB7XG4gICAgdHlwZSBFbGVtZW50ID0gSHRtbEVzY2FwZWRTdHJpbmdcbiAgICBpbnRlcmZhY2UgRWxlbWVudENoaWxkcmVuQXR0cmlidXRlIHtcbiAgICAgIGNoaWxkcmVuOiBDaGlsZFxuICAgIH1cbiAgICBpbnRlcmZhY2UgSW50cmluc2ljRWxlbWVudHMgZXh0ZW5kcyBJbnRyaW5zaWNFbGVtZW50c0RlZmluZWQge1xuICAgICAgW3RhZ05hbWU6IHN0cmluZ106IFByb3BzXG4gICAgfVxuICB9XG59XG5cbmNvbnN0IGVtcHR5VGFncyA9IFtcbiAgJ2FyZWEnLFxuICAnYmFzZScsXG4gICdicicsXG4gICdjb2wnLFxuICAnZW1iZWQnLFxuICAnaHInLFxuICAnaW1nJyxcbiAgJ2lucHV0JyxcbiAgJ2tleWdlbicsXG4gICdsaW5rJyxcbiAgJ21ldGEnLFxuICAncGFyYW0nLFxuICAnc291cmNlJyxcbiAgJ3RyYWNrJyxcbiAgJ3dicicsXG5dXG5jb25zdCBib29sZWFuQXR0cmlidXRlcyA9IFtcbiAgJ2FsbG93ZnVsbHNjcmVlbicsXG4gICdhc3luYycsXG4gICdhdXRvZm9jdXMnLFxuICAnYXV0b3BsYXknLFxuICAnY2hlY2tlZCcsXG4gICdjb250cm9scycsXG4gICdkZWZhdWx0JyxcbiAgJ2RlZmVyJyxcbiAgJ2Rpc2FibGVkJyxcbiAgJ2Zvcm1ub3ZhbGlkYXRlJyxcbiAgJ2hpZGRlbicsXG4gICdpbmVydCcsXG4gICdpc21hcCcsXG4gICdpdGVtc2NvcGUnLFxuICAnbG9vcCcsXG4gICdtdWx0aXBsZScsXG4gICdtdXRlZCcsXG4gICdub21vZHVsZScsXG4gICdub3ZhbGlkYXRlJyxcbiAgJ29wZW4nLFxuICAncGxheXNpbmxpbmUnLFxuICAncmVhZG9ubHknLFxuICAncmVxdWlyZWQnLFxuICAncmV2ZXJzZWQnLFxuICAnc2VsZWN0ZWQnLFxuXVxuXG5jb25zdCBjaGlsZHJlblRvU3RyaW5nVG9CdWZmZXIgPSAoY2hpbGRyZW46IENoaWxkW10sIGJ1ZmZlcjogU3RyaW5nQnVmZmVyKTogdm9pZCA9PiB7XG4gIGZvciAobGV0IGkgPSAwLCBsZW4gPSBjaGlsZHJlbi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGNvbnN0IGNoaWxkID0gY2hpbGRyZW5baV1cbiAgICBpZiAodHlwZW9mIGNoaWxkID09PSAnc3RyaW5nJykge1xuICAgICAgZXNjYXBlVG9CdWZmZXIoY2hpbGQsIGJ1ZmZlcilcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBjaGlsZCA9PT0gJ2Jvb2xlYW4nIHx8IGNoaWxkID09PSBudWxsIHx8IGNoaWxkID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnRpbnVlXG4gICAgfSBlbHNlIGlmIChjaGlsZCBpbnN0YW5jZW9mIEpTWE5vZGUpIHtcbiAgICAgIGNoaWxkLnRvU3RyaW5nVG9CdWZmZXIoYnVmZmVyKVxuICAgIH0gZWxzZSBpZiAoXG4gICAgICB0eXBlb2YgY2hpbGQgPT09ICdudW1iZXInIHx8XG4gICAgICAoY2hpbGQgYXMgdW5rbm93biBhcyB7IGlzRXNjYXBlZDogYm9vbGVhbiB9KS5pc0VzY2FwZWRcbiAgICApIHtcbiAgICAgIGJ1ZmZlclswXSArPSBjaGlsZFxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBgY2hpbGRgIHR5cGUgaXMgYENoaWxkW11gLCBzbyBzdHJpbmdpZnkgcmVjdXJzaXZlbHlcbiAgICAgIGNoaWxkcmVuVG9TdHJpbmdUb0J1ZmZlcihjaGlsZCwgYnVmZmVyKVxuICAgIH1cbiAgfVxufVxuXG50eXBlIENoaWxkID0gc3RyaW5nIHwgbnVtYmVyIHwgSlNYTm9kZSB8IENoaWxkW11cbmV4cG9ydCBjbGFzcyBKU1hOb2RlIGltcGxlbWVudHMgSHRtbEVzY2FwZWQge1xuICB0YWc6IHN0cmluZyB8IEZ1bmN0aW9uXG4gIHByb3BzOiBQcm9wc1xuICBjaGlsZHJlbjogQ2hpbGRbXVxuICBpc0VzY2FwZWQ6IHRydWUgPSB0cnVlIGFzIGNvbnN0XG4gIGNvbnN0cnVjdG9yKHRhZzogc3RyaW5nIHwgRnVuY3Rpb24sIHByb3BzOiBQcm9wcywgY2hpbGRyZW46IENoaWxkW10pIHtcbiAgICB0aGlzLnRhZyA9IHRhZ1xuICAgIHRoaXMucHJvcHMgPSBwcm9wc1xuICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlblxuICB9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICBjb25zdCBidWZmZXI6IFN0cmluZ0J1ZmZlciA9IFsnJ11cbiAgICB0aGlzLnRvU3RyaW5nVG9CdWZmZXIoYnVmZmVyKVxuICAgIHJldHVybiBidWZmZXJbMF1cbiAgfVxuXG4gIHRvU3RyaW5nVG9CdWZmZXIoYnVmZmVyOiBTdHJpbmdCdWZmZXIpOiB2b2lkIHtcbiAgICBjb25zdCB0YWcgPSB0aGlzLnRhZyBhcyBzdHJpbmdcbiAgICBjb25zdCBwcm9wcyA9IHRoaXMucHJvcHNcbiAgICBsZXQgeyBjaGlsZHJlbiB9ID0gdGhpc1xuXG4gICAgYnVmZmVyWzBdICs9IGA8JHt0YWd9YFxuXG4gICAgY29uc3QgcHJvcHNLZXlzID0gT2JqZWN0LmtleXMocHJvcHMgfHwge30pXG5cbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gcHJvcHNLZXlzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBjb25zdCBrZXkgPSBwcm9wc0tleXNbaV1cbiAgICAgIGNvbnN0IHYgPSBwcm9wc1trZXldXG4gICAgICAvLyBvYmplY3QgdG8gc3R5bGUgc3RyaW5nc1xuICAgICAgaWYgKGtleSA9PT0gJ3N0eWxlJyAmJiB0eXBlb2YgdiA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgY29uc3Qgc3R5bGVzID0gT2JqZWN0LmtleXModilcbiAgICAgICAgICAubWFwKChrKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9wZXJ0eSA9IGsucmVwbGFjZSgvW0EtWl0vZywgKG1hdGNoKSA9PiBgLSR7bWF0Y2gudG9Mb3dlckNhc2UoKX1gKVxuICAgICAgICAgICAgcmV0dXJuIGAke3Byb3BlcnR5fToke3Zba119YFxuICAgICAgICAgIH0pXG4gICAgICAgICAgLmpvaW4oJzsnKVxuICAgICAgICBidWZmZXJbMF0gKz0gYCBzdHlsZT1cIiR7c3R5bGVzfVwiYFxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgYnVmZmVyWzBdICs9IGAgJHtrZXl9PVwiYFxuICAgICAgICBlc2NhcGVUb0J1ZmZlcih2LCBidWZmZXIpXG4gICAgICAgIGJ1ZmZlclswXSArPSAnXCInXG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2ID09PSAnbnVtYmVyJykge1xuICAgICAgICBidWZmZXJbMF0gKz0gYCAke2tleX09XCIke3Z9XCJgXG4gICAgICB9IGVsc2UgaWYgKHYgPT09IG51bGwgfHwgdiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIERvIG5vdGhpbmdcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHYgPT09ICdib29sZWFuJyAmJiBib29sZWFuQXR0cmlidXRlcy5pbmNsdWRlcyhrZXkpKSB7XG4gICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgYnVmZmVyWzBdICs9IGAgJHtrZXl9PVwiXCJgXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUwnKSB7XG4gICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgdGhyb3cgJ0NhbiBvbmx5IHNldCBvbmUgb2YgYGNoaWxkcmVuYCBvciBgcHJvcHMuZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUxgLidcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGVzY2FwZWRTdHJpbmcgPSBuZXcgU3RyaW5nKHYuX19odG1sKSBhcyBIdG1sRXNjYXBlZFN0cmluZ1xuICAgICAgICBlc2NhcGVkU3RyaW5nLmlzRXNjYXBlZCA9IHRydWVcbiAgICAgICAgY2hpbGRyZW4gPSBbZXNjYXBlZFN0cmluZ11cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJ1ZmZlclswXSArPSBgICR7a2V5fT1cImBcbiAgICAgICAgZXNjYXBlVG9CdWZmZXIodi50b1N0cmluZygpLCBidWZmZXIpXG4gICAgICAgIGJ1ZmZlclswXSArPSAnXCInXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGVtcHR5VGFncy5pbmNsdWRlcyh0YWcgYXMgc3RyaW5nKSkge1xuICAgICAgYnVmZmVyWzBdICs9ICcvPidcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGJ1ZmZlclswXSArPSAnPidcblxuICAgIGNoaWxkcmVuVG9TdHJpbmdUb0J1ZmZlcihjaGlsZHJlbiwgYnVmZmVyKVxuXG4gICAgYnVmZmVyWzBdICs9IGA8LyR7dGFnfT5gXG4gIH1cbn1cblxuY2xhc3MgSlNYRnVuY3Rpb25Ob2RlIGV4dGVuZHMgSlNYTm9kZSB7XG4gIHRvU3RyaW5nVG9CdWZmZXIoYnVmZmVyOiBTdHJpbmdCdWZmZXIpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNoaWxkcmVuIH0gPSB0aGlzXG5cbiAgICBjb25zdCByZXMgPSAodGhpcy50YWcgYXMgRnVuY3Rpb24pLmNhbGwobnVsbCwge1xuICAgICAgLi4udGhpcy5wcm9wcyxcbiAgICAgIGNoaWxkcmVuOiBjaGlsZHJlbi5sZW5ndGggPD0gMSA/IGNoaWxkcmVuWzBdIDogY2hpbGRyZW4sXG4gICAgfSlcblxuICAgIGlmIChyZXMgaW5zdGFuY2VvZiBKU1hOb2RlKSB7XG4gICAgICByZXMudG9TdHJpbmdUb0J1ZmZlcihidWZmZXIpXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcmVzID09PSAnbnVtYmVyJyB8fCAocmVzIGFzIEh0bWxFc2NhcGVkKS5pc0VzY2FwZWQpIHtcbiAgICAgIGJ1ZmZlclswXSArPSByZXNcbiAgICB9IGVsc2Uge1xuICAgICAgZXNjYXBlVG9CdWZmZXIocmVzLCBidWZmZXIpXG4gICAgfVxuICB9XG59XG5cbmNsYXNzIEpTWEZyYWdtZW50Tm9kZSBleHRlbmRzIEpTWE5vZGUge1xuICB0b1N0cmluZ1RvQnVmZmVyKGJ1ZmZlcjogU3RyaW5nQnVmZmVyKTogdm9pZCB7XG4gICAgY2hpbGRyZW5Ub1N0cmluZ1RvQnVmZmVyKHRoaXMuY2hpbGRyZW4sIGJ1ZmZlcilcbiAgfVxufVxuXG5leHBvcnQgeyBqc3hGbiBhcyBqc3ggfVxuY29uc3QganN4Rm4gPSAoXG4gIHRhZzogc3RyaW5nIHwgRnVuY3Rpb24sXG4gIHByb3BzOiBQcm9wcyxcbiAgLi4uY2hpbGRyZW46IChzdHJpbmcgfCBIdG1sRXNjYXBlZFN0cmluZylbXVxuKTogSlNYTm9kZSA9PiB7XG4gIGlmICh0eXBlb2YgdGFnID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIG5ldyBKU1hGdW5jdGlvbk5vZGUodGFnLCBwcm9wcywgY2hpbGRyZW4pXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG5ldyBKU1hOb2RlKHRhZywgcHJvcHMsIGNoaWxkcmVuKVxuICB9XG59XG5cbmV4cG9ydCB0eXBlIEZDPFQgPSBQcm9wcz4gPSAocHJvcHM6IFQgJiB7IGNoaWxkcmVuPzogQ2hpbGQgfSkgPT4gSHRtbEVzY2FwZWRTdHJpbmdcblxuY29uc3Qgc2hhbGxvd0VxdWFsID0gKGE6IFByb3BzLCBiOiBQcm9wcyk6IGJvb2xlYW4gPT4ge1xuICBpZiAoYSA9PT0gYikge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBjb25zdCBhS2V5cyA9IE9iamVjdC5rZXlzKGEpXG4gIGNvbnN0IGJLZXlzID0gT2JqZWN0LmtleXMoYilcbiAgaWYgKGFLZXlzLmxlbmd0aCAhPT0gYktleXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBmb3IgKGxldCBpID0gMCwgbGVuID0gYUtleXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoYVthS2V5c1tpXV0gIT09IGJbYUtleXNbaV1dKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZVxufVxuXG5leHBvcnQgY29uc3QgbWVtbyA9IDxUPihcbiAgY29tcG9uZW50OiBGQzxUPixcbiAgcHJvcHNBcmVFcXVhbDogKHByZXZQcm9wczogUmVhZG9ubHk8VD4sIG5leHRQcm9wczogUmVhZG9ubHk8VD4pID0+IGJvb2xlYW4gPSBzaGFsbG93RXF1YWxcbik6IEZDPFQ+ID0+IHtcbiAgbGV0IGNvbXB1dGVkID0gdW5kZWZpbmVkXG4gIGxldCBwcmV2UHJvcHM6IFQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWRcbiAgcmV0dXJuICgocHJvcHM6IFQgJiB7IGNoaWxkcmVuPzogQ2hpbGQgfSk6IEh0bWxFc2NhcGVkU3RyaW5nID0+IHtcbiAgICBpZiAocHJldlByb3BzICYmICFwcm9wc0FyZUVxdWFsKHByZXZQcm9wcywgcHJvcHMpKSB7XG4gICAgICBjb21wdXRlZCA9IHVuZGVmaW5lZFxuICAgIH1cbiAgICBwcmV2UHJvcHMgPSBwcm9wc1xuICAgIHJldHVybiAoY29tcHV0ZWQgfHw9IGNvbXBvbmVudChwcm9wcykpXG4gIH0pIGFzIEZDPFQ+XG59XG5cbmV4cG9ydCBjb25zdCBGcmFnbWVudCA9IChwcm9wczoge1xuICBrZXk/OiBzdHJpbmdcbiAgY2hpbGRyZW4/OiBDaGlsZCB8IEh0bWxFc2NhcGVkU3RyaW5nXG59KTogSHRtbEVzY2FwZWRTdHJpbmcgPT4ge1xuICByZXR1cm4gbmV3IEpTWEZyYWdtZW50Tm9kZSgnJywge30sIHByb3BzLmNoaWxkcmVuID8gW3Byb3BzLmNoaWxkcmVuXSA6IFtdKSBhcyBuZXZlclxufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbnRleHQ8VD4ge1xuICB2YWx1ZXM6IFRbXVxuICBQcm92aWRlcjogRkM8eyB2YWx1ZTogVCB9PlxufVxuXG5leHBvcnQgY29uc3QgY3JlYXRlQ29udGV4dCA9IDxUPihkZWZhdWx0VmFsdWU6IFQpOiBDb250ZXh0PFQ+ID0+IHtcbiAgY29uc3QgdmFsdWVzID0gW2RlZmF1bHRWYWx1ZV1cbiAgcmV0dXJuIHtcbiAgICB2YWx1ZXMsXG4gICAgUHJvdmlkZXIocHJvcHMpOiBIdG1sRXNjYXBlZFN0cmluZyB7XG4gICAgICB2YWx1ZXMucHVzaChwcm9wcy52YWx1ZSlcblxuICAgICAgY29uc3QgcmVzID0gbmV3IFN0cmluZyhcbiAgICAgICAgcHJvcHMuY2hpbGRyZW5cbiAgICAgICAgICA/IChBcnJheS5pc0FycmF5KHByb3BzLmNoaWxkcmVuKVxuICAgICAgICAgICAgICA/IG5ldyBKU1hGcmFnbWVudE5vZGUoJycsIHt9LCBwcm9wcy5jaGlsZHJlbilcbiAgICAgICAgICAgICAgOiBwcm9wcy5jaGlsZHJlblxuICAgICAgICAgICAgKS50b1N0cmluZygpXG4gICAgICAgICAgOiAnJ1xuICAgICAgKSBhcyBIdG1sRXNjYXBlZFN0cmluZ1xuICAgICAgcmVzLmlzRXNjYXBlZCA9IHRydWVcblxuICAgICAgdmFsdWVzLnBvcCgpXG5cbiAgICAgIHJldHVybiByZXNcbiAgICB9LFxuICB9XG59XG5cbmV4cG9ydCBjb25zdCB1c2VDb250ZXh0ID0gPFQ+KGNvbnRleHQ6IENvbnRleHQ8VD4pOiBUID0+IHtcbiAgcmV0dXJuIGNvbnRleHQudmFsdWVzW2NvbnRleHQudmFsdWVzLmxlbmd0aCAtIDFdXG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxjQUFjLFFBQVEsbUJBQWtCO0FBb0JqRCxNQUFNLFlBQVk7SUFDaEI7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0NBQ0Q7QUFDRCxNQUFNLG9CQUFvQjtJQUN4QjtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtDQUNEO0FBRUQsTUFBTSwyQkFBMkIsQ0FBQyxVQUFtQixTQUErQjtJQUNsRixJQUFLLElBQUksSUFBSSxHQUFHLE1BQU0sU0FBUyxNQUFNLEVBQUUsSUFBSSxLQUFLLElBQUs7UUFDbkQsTUFBTSxRQUFRLFFBQVEsQ0FBQyxFQUFFO1FBQ3pCLElBQUksT0FBTyxVQUFVLFVBQVU7WUFDN0IsZUFBZSxPQUFPO1FBQ3hCLE9BQU8sSUFBSSxPQUFPLFVBQVUsYUFBYSxVQUFVLElBQUksSUFBSSxVQUFVLFdBQVc7WUFDOUUsUUFBUTtRQUNWLE9BQU8sSUFBSSxpQkFBaUIsU0FBUztZQUNuQyxNQUFNLGdCQUFnQixDQUFDO1FBQ3pCLE9BQU8sSUFDTCxPQUFPLFVBQVUsWUFDakIsQUFBQyxNQUE0QyxTQUFTLEVBQ3REO1lBQ0EsTUFBTSxDQUFDLEVBQUUsSUFBSTtRQUNmLE9BQU87WUFDTCxzREFBc0Q7WUFDdEQseUJBQXlCLE9BQU87UUFDbEMsQ0FBQztJQUNIO0FBQ0Y7QUFHQSxPQUFPLE1BQU07SUFDWCxJQUFzQjtJQUN0QixNQUFZO0lBQ1osU0FBaUI7SUFDakIsWUFBa0IsSUFBSSxDQUFTO0lBQy9CLFlBQVksR0FBc0IsRUFBRSxLQUFZLEVBQUUsUUFB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