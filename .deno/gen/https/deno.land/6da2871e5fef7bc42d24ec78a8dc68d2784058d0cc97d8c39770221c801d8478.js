import { Context } from './context.ts';
// Based on the code in the MIT licensed `koa-compose` package.
export const compose = (middleware, onError, onNotFound)=>{
    return (context, next)=>{
        let index = -1;
        return dispatch(0);
        function dispatch(i) {
            if (i <= index) {
                throw new Error('next() called multiple times');
            }
            index = i;
            let res;
            let isError = false;
            let handler;
            if (middleware[i]) {
                handler = middleware[i][0];
                if (context instanceof Context) {
                    context.req.setParams(middleware[i][1]);
                }
            } else {
                handler = i === middleware.length && next || undefined;
            }
            if (!handler) {
                if (context instanceof Context && context.finalized === false && onNotFound) {
                    res = onNotFound(context);
                }
            } else {
                try {
                    res = handler(context, ()=>{
                        const dispatchRes = dispatch(i + 1);
                        return dispatchRes instanceof Promise ? dispatchRes : Promise.resolve(dispatchRes);
                    });
                } catch (err) {
                    if (err instanceof Error && context instanceof Context && onError) {
                        context.error = err;
                        res = onError(err, context);
                        isError = true;
                    } else {
                        throw err;
                    }
                }
            }
            if (!(res instanceof Promise)) {
                if (res !== undefined && 'response' in res) {
                    res = res['response'];
                }
                if (res && (context.finalized === false || isError)) {
                    context.res = res;
                }
                return context;
            } else {
                return res.then((res)=>{
                    if (res !== undefined && 'response' in res) {
                        res = res['response'];
                    }
                    if (res && context.finalized === false) {
                        context.res = res;
                    }
                    return context;
                }).catch(async (err)=>{
                    if (err instanceof Error && context instanceof Context && onError) {
                        context.error = err;
                        context.res = await onError(err, context);
                        return context;
                    }
                    throw err;
                });
            }
        }
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvY29tcG9zZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb250ZXh0IH0gZnJvbSAnLi9jb250ZXh0LnRzJ1xuaW1wb3J0IHR5cGUgeyBQYXJhbUluZGV4TWFwLCBQYXJhbXMgfSBmcm9tICcuL3JvdXRlci50cydcbmltcG9ydCB0eXBlIHsgRW52LCBOb3RGb3VuZEhhbmRsZXIsIEVycm9ySGFuZGxlciB9IGZyb20gJy4vdHlwZXMudHMnXG5cbmludGVyZmFjZSBDb21wb3NlQ29udGV4dCB7XG4gIGZpbmFsaXplZDogYm9vbGVhblxuICByZXM6IHVua25vd25cbn1cblxuLy8gQmFzZWQgb24gdGhlIGNvZGUgaW4gdGhlIE1JVCBsaWNlbnNlZCBga29hLWNvbXBvc2VgIHBhY2thZ2UuXG5leHBvcnQgY29uc3QgY29tcG9zZSA9IDxDIGV4dGVuZHMgQ29tcG9zZUNvbnRleHQsIEUgZXh0ZW5kcyBFbnYgPSBFbnY+KFxuICBtaWRkbGV3YXJlOiBbRnVuY3Rpb24sIFBhcmFtSW5kZXhNYXAgfCBQYXJhbXNdW10sXG4gIG9uRXJyb3I/OiBFcnJvckhhbmRsZXI8RT4sXG4gIG9uTm90Rm91bmQ/OiBOb3RGb3VuZEhhbmRsZXI8RT5cbikgPT4ge1xuICByZXR1cm4gKGNvbnRleHQ6IEMsIG5leHQ/OiBGdW5jdGlvbikgPT4ge1xuICAgIGxldCBpbmRleCA9IC0xXG4gICAgcmV0dXJuIGRpc3BhdGNoKDApXG5cbiAgICBmdW5jdGlvbiBkaXNwYXRjaChpOiBudW1iZXIpOiBDIHwgUHJvbWlzZTxDPiB7XG4gICAgICBpZiAoaSA8PSBpbmRleCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ25leHQoKSBjYWxsZWQgbXVsdGlwbGUgdGltZXMnKVxuICAgICAgfVxuICAgICAgaW5kZXggPSBpXG5cbiAgICAgIGxldCByZXNcbiAgICAgIGxldCBpc0Vycm9yID0gZmFsc2VcbiAgICAgIGxldCBoYW5kbGVyXG5cbiAgICAgIGlmIChtaWRkbGV3YXJlW2ldKSB7XG4gICAgICAgIGhhbmRsZXIgPSBtaWRkbGV3YXJlW2ldWzBdXG4gICAgICAgIGlmIChjb250ZXh0IGluc3RhbmNlb2YgQ29udGV4dCkge1xuICAgICAgICAgIGNvbnRleHQucmVxLnNldFBhcmFtcyhtaWRkbGV3YXJlW2ldWzFdKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBoYW5kbGVyID0gKGkgPT09IG1pZGRsZXdhcmUubGVuZ3RoICYmIG5leHQpIHx8IHVuZGVmaW5lZFxuICAgICAgfVxuXG4gICAgICBpZiAoIWhhbmRsZXIpIHtcbiAgICAgICAgaWYgKGNvbnRleHQgaW5zdGFuY2VvZiBDb250ZXh0ICYmIGNvbnRleHQuZmluYWxpemVkID09PSBmYWxzZSAmJiBvbk5vdEZvdW5kKSB7XG4gICAgICAgICAgcmVzID0gb25Ob3RGb3VuZChjb250ZXh0KVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJlcyA9IGhhbmRsZXIoY29udGV4dCwgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZGlzcGF0Y2hSZXMgPSBkaXNwYXRjaChpICsgMSlcbiAgICAgICAgICAgIHJldHVybiBkaXNwYXRjaFJlcyBpbnN0YW5jZW9mIFByb21pc2UgPyBkaXNwYXRjaFJlcyA6IFByb21pc2UucmVzb2x2ZShkaXNwYXRjaFJlcylcbiAgICAgICAgICB9KVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBpZiAoZXJyIGluc3RhbmNlb2YgRXJyb3IgJiYgY29udGV4dCBpbnN0YW5jZW9mIENvbnRleHQgJiYgb25FcnJvcikge1xuICAgICAgICAgICAgY29udGV4dC5lcnJvciA9IGVyclxuICAgICAgICAgICAgcmVzID0gb25FcnJvcihlcnIsIGNvbnRleHQpXG4gICAgICAgICAgICBpc0Vycm9yID0gdHJ1ZVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBlcnJcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCEocmVzIGluc3RhbmNlb2YgUHJvbWlzZSkpIHtcbiAgICAgICAgaWYgKHJlcyAhPT0gdW5kZWZpbmVkICYmICdyZXNwb25zZScgaW4gcmVzKSB7XG4gICAgICAgICAgcmVzID0gcmVzWydyZXNwb25zZSddXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlcyAmJiAoY29udGV4dC5maW5hbGl6ZWQgPT09IGZhbHNlIHx8IGlzRXJyb3IpKSB7XG4gICAgICAgICAgY29udGV4dC5yZXMgPSByZXNcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29udGV4dFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHJlc1xuICAgICAgICAgIC50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgIGlmIChyZXMgIT09IHVuZGVmaW5lZCAmJiAncmVzcG9uc2UnIGluIHJlcykge1xuICAgICAgICAgICAgICByZXMgPSByZXNbJ3Jlc3BvbnNlJ11cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZXMgJiYgY29udGV4dC5maW5hbGl6ZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgIGNvbnRleHQucmVzID0gcmVzXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dFxuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKGFzeW5jIChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBFcnJvciAmJiBjb250ZXh0IGluc3RhbmNlb2YgQ29udGV4dCAmJiBvbkVycm9yKSB7XG4gICAgICAgICAgICAgIGNvbnRleHQuZXJyb3IgPSBlcnJcbiAgICAgICAgICAgICAgY29udGV4dC5yZXMgPSBhd2FpdCBvbkVycm9yKGVyciwgY29udGV4dClcbiAgICAgICAgICAgICAgcmV0dXJuIGNvbnRleHRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IGVyclxuICAgICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxPQUFPLFFBQVEsZUFBYztBQVN0QywrREFBK0Q7QUFDL0QsT0FBTyxNQUFNLFVBQVUsQ0FDckIsWUFDQSxTQUNBLGFBQ0c7SUFDSCxPQUFPLENBQUMsU0FBWSxPQUFvQjtRQUN0QyxJQUFJLFFBQVEsQ0FBQztRQUNiLE9BQU8sU0FBUztRQUVoQixTQUFTLFNBQVMsQ0FBUyxFQUFrQjtZQUMzQyxJQUFJLEtBQUssT0FBTztnQkFDZCxNQUFNLElBQUksTUFBTSxnQ0FBK0I7WUFDakQsQ0FBQztZQUNELFFBQVE7WUFFUixJQUFJO1lBQ0osSUFBSSxVQUFVLEtBQUs7WUFDbkIsSUFBSTtZQUVKLElBQUksVUFBVSxDQUFDLEVBQUUsRUFBRTtnQkFDakIsVUFBVSxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUU7Z0JBQzFCLElBQUksbUJBQW1CLFNBQVM7b0JBQzlCLFFBQVEsR0FBRyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUU7Z0JBQ3hDLENBQUM7WUFDSCxPQUFPO2dCQUNMLFVBQVUsQUFBQyxNQUFNLFdBQVcsTUFBTSxJQUFJLFFBQVM7WUFDakQsQ0FBQztZQUVELElBQUksQ0FBQyxTQUFTO2dCQUNaLElBQUksbUJBQW1CLFdBQVcsUUFBUSxTQUFTLEtBQUssS0FBSyxJQUFJLFlBQVk7b0JBQzNFLE1BQU0sV0FBVztnQkFDbkIsQ0FBQztZQUNILE9BQU87Z0JBQ0wsSUFBSTtvQkFDRixNQUFNLFFBQVEsU0FBUyxJQUFNO3dCQUMzQixNQUFNLGNBQWMsU0FBUyxJQUFJO3dCQUNqQyxPQUFPLHVCQUF1QixVQUFVLGNBQWMsUUFBUSxPQUFPLENBQUMsWUFBWTtvQkFDcEY7Z0JBQ0YsRUFBRSxPQUFPLEtBQUs7b0JBQ1osSUFBSSxlQUFlLFNBQVMsbUJBQW1CLFdBQVcsU0FBUzt3QkFDakUsUUFBUSxLQUFLLEdBQUc7d0JBQ2hCLE1BQU0sUUFBUSxLQUFLO3dCQUNuQixVQUFVLElBQUk7b0JBQ2hCLE9BQU87d0JBQ0wsTUFBTSxJQUFHO29CQUNYLENBQUM7Z0JBQ0g7WUFDRixDQUFDO1lBRUQsSUFBSSxDQUFDLENBQUMsZUFBZSxPQUFPLEdBQUc7Z0JBQzdCLElBQUksUUFBUSxhQUFhLGNBQWMsS0FBSztvQkFDMUMsTUFBTSxHQUFHLENBQUMsV0FBVztnQkFDdkIsQ0FBQztnQkFDRCxJQUFJLE9BQU8sQ0FBQyxRQUFRLFNBQVMsS0FBSyxLQUFLLElBQUksT0FBTyxHQUFHO29CQUNuRCxRQUFRLEdBQUcsR0FBRztnQkFDaEIsQ0FBQztnQkFDRCxPQUFPO1lBQ1QsT0FBTztnQkFDTCxPQUFPLElBQ0osSUFBSSxDQUFDLENBQUMsTUFBUTtvQkFDYixJQUFJLFFBQVEsYUFBYSxjQUFjLEtBQUs7d0JBQzFDLE1BQU0sR0FBRyxDQUFDLFdBQVc7b0JBQ3ZCLENBQUM7b0JBQ0QsSUFBSSxPQUFPLFFBQVEsU0FBUyxLQUFLLEtBQUssRUFBRTt3QkFDdEMsUUFBUSxHQUFHLEdBQUc7b0JBQ2hCLENBQUM7b0JBQ0QsT0FBTztnQkFDVCxHQUNDLEtBQUssQ0FBQyxPQUFPLE1BQVE7b0JBQ3BCLElBQUksZUFBZSxTQUFTLG1CQUFtQixXQUFXLFNBQVM7d0JBQ2pFLFFBQVEsS0FBSyxHQUFHO3dCQUNoQixRQUFRLEdBQUcsR0FBRyxNQUFNLFFBQVEsS0FBSzt3QkFDakMsT0FBTztvQkFDVCxDQUFDO29CQUNELE1BQU0sSUFBRztnQkFDWDtZQUNKLENBQUM7UUFDSDtJQUNGO0FBQ0YsRUFBQyJ9