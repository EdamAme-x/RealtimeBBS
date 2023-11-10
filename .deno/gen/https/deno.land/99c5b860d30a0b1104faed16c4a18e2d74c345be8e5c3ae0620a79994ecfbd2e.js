export const cors = (options)=>{
    const defaults = {
        origin: '*',
        allowMethods: [
            'GET',
            'HEAD',
            'PUT',
            'POST',
            'DELETE',
            'PATCH'
        ],
        allowHeaders: [],
        exposeHeaders: []
    };
    const opts = {
        ...defaults,
        ...options
    };
    const findAllowOrigin = ((optsOrigin)=>{
        if (typeof optsOrigin === 'string') {
            return ()=>optsOrigin;
        } else if (typeof optsOrigin === 'function') {
            return optsOrigin;
        } else {
            return (origin)=>optsOrigin.includes(origin) ? origin : optsOrigin[0];
        }
    })(opts.origin);
    return async (c, next)=>{
        function set(key, value) {
            c.res.headers.set(key, value);
        }
        const allowOrigin = findAllowOrigin(c.req.header('origin') || '');
        if (allowOrigin) {
            set('Access-Control-Allow-Origin', allowOrigin);
        }
        // Suppose the server sends a response with an Access-Control-Allow-Origin value with an explicit origin (rather than the "*" wildcard).
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
        if (opts.origin !== '*') {
            set('Vary', 'Origin');
        }
        if (opts.credentials) {
            set('Access-Control-Allow-Credentials', 'true');
        }
        if (opts.exposeHeaders?.length) {
            set('Access-Control-Expose-Headers', opts.exposeHeaders.join(','));
        }
        if (c.req.method !== 'OPTIONS') {
            await next();
        } else {
            // Preflight
            if (opts.maxAge != null) {
                set('Access-Control-Max-Age', opts.maxAge.toString());
            }
            if (opts.allowMethods?.length) {
                set('Access-Control-Allow-Methods', opts.allowMethods.join(','));
            }
            let headers = opts.allowHeaders;
            if (!headers?.length) {
                const requestHeaders = c.req.header('Access-Control-Request-Headers');
                if (requestHeaders) {
                    headers = requestHeaders.split(/\s*,\s*/);
                }
            }
            if (headers?.length) {
                set('Access-Control-Allow-Headers', headers.join(','));
                c.res.headers.append('Vary', 'Access-Control-Request-Headers');
            }
            c.res.headers.delete('Content-Length');
            c.res.headers.delete('Content-Type');
            return new Response(null, {
                headers: c.res.headers,
                status: 204,
                statusText: c.res.statusText
            });
        }
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvbWlkZGxld2FyZS9jb3JzL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgTWlkZGxld2FyZUhhbmRsZXIgfSBmcm9tICcuLi8uLi90eXBlcy50cydcblxudHlwZSBDT1JTT3B0aW9ucyA9IHtcbiAgb3JpZ2luOiBzdHJpbmcgfCBzdHJpbmdbXSB8ICgob3JpZ2luOiBzdHJpbmcpID0+IHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGwpXG4gIGFsbG93TWV0aG9kcz86IHN0cmluZ1tdXG4gIGFsbG93SGVhZGVycz86IHN0cmluZ1tdXG4gIG1heEFnZT86IG51bWJlclxuICBjcmVkZW50aWFscz86IGJvb2xlYW5cbiAgZXhwb3NlSGVhZGVycz86IHN0cmluZ1tdXG59XG5cbmV4cG9ydCBjb25zdCBjb3JzID0gKG9wdGlvbnM/OiBDT1JTT3B0aW9ucyk6IE1pZGRsZXdhcmVIYW5kbGVyID0+IHtcbiAgY29uc3QgZGVmYXVsdHM6IENPUlNPcHRpb25zID0ge1xuICAgIG9yaWdpbjogJyonLFxuICAgIGFsbG93TWV0aG9kczogWydHRVQnLCAnSEVBRCcsICdQVVQnLCAnUE9TVCcsICdERUxFVEUnLCAnUEFUQ0gnXSxcbiAgICBhbGxvd0hlYWRlcnM6IFtdLFxuICAgIGV4cG9zZUhlYWRlcnM6IFtdLFxuICB9XG4gIGNvbnN0IG9wdHMgPSB7XG4gICAgLi4uZGVmYXVsdHMsXG4gICAgLi4ub3B0aW9ucyxcbiAgfVxuXG4gIGNvbnN0IGZpbmRBbGxvd09yaWdpbiA9ICgob3B0c09yaWdpbikgPT4ge1xuICAgIGlmICh0eXBlb2Ygb3B0c09yaWdpbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiAoKSA9PiBvcHRzT3JpZ2luXG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygb3B0c09yaWdpbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIG9wdHNPcmlnaW5cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIChvcmlnaW46IHN0cmluZykgPT4gKG9wdHNPcmlnaW4uaW5jbHVkZXMob3JpZ2luKSA/IG9yaWdpbiA6IG9wdHNPcmlnaW5bMF0pXG4gICAgfVxuICB9KShvcHRzLm9yaWdpbilcblxuICByZXR1cm4gYXN5bmMgKGMsIG5leHQpID0+IHtcbiAgICBmdW5jdGlvbiBzZXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICAgIGMucmVzLmhlYWRlcnMuc2V0KGtleSwgdmFsdWUpXG4gICAgfVxuXG4gICAgY29uc3QgYWxsb3dPcmlnaW4gPSBmaW5kQWxsb3dPcmlnaW4oYy5yZXEuaGVhZGVyKCdvcmlnaW4nKSB8fCAnJylcbiAgICBpZiAoYWxsb3dPcmlnaW4pIHtcbiAgICAgIHNldCgnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgYWxsb3dPcmlnaW4pXG4gICAgfVxuXG4gICAgLy8gU3VwcG9zZSB0aGUgc2VydmVyIHNlbmRzIGEgcmVzcG9uc2Ugd2l0aCBhbiBBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4gdmFsdWUgd2l0aCBhbiBleHBsaWNpdCBvcmlnaW4gKHJhdGhlciB0aGFuIHRoZSBcIipcIiB3aWxkY2FyZCkuXG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSFRUUC9IZWFkZXJzL0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblxuICAgIGlmIChvcHRzLm9yaWdpbiAhPT0gJyonKSB7XG4gICAgICBzZXQoJ1ZhcnknLCAnT3JpZ2luJylcbiAgICB9XG5cbiAgICBpZiAob3B0cy5jcmVkZW50aWFscykge1xuICAgICAgc2V0KCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscycsICd0cnVlJylcbiAgICB9XG5cbiAgICBpZiAob3B0cy5leHBvc2VIZWFkZXJzPy5sZW5ndGgpIHtcbiAgICAgIHNldCgnQWNjZXNzLUNvbnRyb2wtRXhwb3NlLUhlYWRlcnMnLCBvcHRzLmV4cG9zZUhlYWRlcnMuam9pbignLCcpKVxuICAgIH1cblxuICAgIGlmIChjLnJlcS5tZXRob2QgIT09ICdPUFRJT05TJykge1xuICAgICAgYXdhaXQgbmV4dCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFByZWZsaWdodFxuXG4gICAgICBpZiAob3B0cy5tYXhBZ2UgIT0gbnVsbCkge1xuICAgICAgICBzZXQoJ0FjY2Vzcy1Db250cm9sLU1heC1BZ2UnLCBvcHRzLm1heEFnZS50b1N0cmluZygpKVxuICAgICAgfVxuXG4gICAgICBpZiAob3B0cy5hbGxvd01ldGhvZHM/Lmxlbmd0aCkge1xuICAgICAgICBzZXQoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCBvcHRzLmFsbG93TWV0aG9kcy5qb2luKCcsJykpXG4gICAgICB9XG5cbiAgICAgIGxldCBoZWFkZXJzID0gb3B0cy5hbGxvd0hlYWRlcnNcbiAgICAgIGlmICghaGVhZGVycz8ubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IHJlcXVlc3RIZWFkZXJzID0gYy5yZXEuaGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1SZXF1ZXN0LUhlYWRlcnMnKVxuICAgICAgICBpZiAocmVxdWVzdEhlYWRlcnMpIHtcbiAgICAgICAgICBoZWFkZXJzID0gcmVxdWVzdEhlYWRlcnMuc3BsaXQoL1xccyosXFxzKi8pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChoZWFkZXJzPy5sZW5ndGgpIHtcbiAgICAgICAgc2V0KCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgaGVhZGVycy5qb2luKCcsJykpXG4gICAgICAgIGMucmVzLmhlYWRlcnMuYXBwZW5kKCdWYXJ5JywgJ0FjY2Vzcy1Db250cm9sLVJlcXVlc3QtSGVhZGVycycpXG4gICAgICB9XG5cbiAgICAgIGMucmVzLmhlYWRlcnMuZGVsZXRlKCdDb250ZW50LUxlbmd0aCcpXG4gICAgICBjLnJlcy5oZWFkZXJzLmRlbGV0ZSgnQ29udGVudC1UeXBlJylcblxuICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShudWxsLCB7XG4gICAgICAgIGhlYWRlcnM6IGMucmVzLmhlYWRlcnMsXG4gICAgICAgIHN0YXR1czogMjA0LFxuICAgICAgICBzdGF0dXNUZXh0OiBjLnJlcy5zdGF0dXNUZXh0LFxuICAgICAgfSlcbiAgICB9XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFXQSxPQUFPLE1BQU0sT0FBTyxDQUFDLFVBQTZDO0lBQ2hFLE1BQU0sV0FBd0I7UUFDNUIsUUFBUTtRQUNSLGNBQWM7WUFBQztZQUFPO1lBQVE7WUFBTztZQUFRO1lBQVU7U0FBUTtRQUMvRCxjQUFjLEVBQUU7UUFDaEIsZUFBZSxFQUFFO0lBQ25CO0lBQ0EsTUFBTSxPQUFPO1FBQ1gsR0FBRyxRQUFRO1FBQ1gsR0FBRyxPQUFPO0lBQ1o7SUFFQSxNQUFNLGtCQUFrQixBQUFDLENBQUEsQ0FBQyxhQUFlO1FBQ3ZDLElBQUksT0FBTyxlQUFlLFVBQVU7WUFDbEMsT0FBTyxJQUFNO1FBQ2YsT0FBTyxJQUFJLE9BQU8sZUFBZSxZQUFZO1lBQzNDLE9BQU87UUFDVCxPQUFPO1lBQ0wsT0FBTyxDQUFDLFNBQW9CLFdBQVcsUUFBUSxDQUFDLFVBQVUsU0FBUyxVQUFVLENBQUMsRUFBRTtRQUNsRixDQUFDO0lBQ0gsQ0FBQSxFQUFHLEtBQUssTUFBTTtJQUVkLE9BQU8sT0FBTyxHQUFHLE9BQVM7UUFDeEIsU0FBUyxJQUFJLEdBQVcsRUFBRSxLQUFhLEVBQUU7WUFDdkMsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLO1FBQ3pCO1FBRUEsTUFBTSxjQUFjLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsYUFBYTtRQUM5RCxJQUFJLGFBQWE7WUFDZixJQUFJLCtCQUErQjtRQUNyQyxDQUFDO1FBRUQsd0lBQXdJO1FBQ3hJLHdGQUF3RjtRQUN4RixJQUFJLEtBQUssTUFBTSxLQUFLLEtBQUs7WUFDdkIsSUFBSSxRQUFRO1FBQ2QsQ0FBQztRQUVELElBQUksS0FBSyxXQUFXLEVBQUU7WUFDcEIsSUFBSSxvQ0FBb0M7UUFDMUMsQ0FBQztRQUVELElBQUksS0FBSyxhQUFhLEVBQUUsUUFBUTtZQUM5QixJQUFJLGlDQUFpQyxLQUFLLGFBQWEsQ0FBQyxJQUFJLENBQUM7UUFDL0QsQ0FBQztRQUVELElBQUksRUFBRSxHQUFHLENBQUMsTUFBTSxLQUFLLFdBQVc7WUFDOUIsTUFBTTtRQUNSLE9BQU87WUFDTCxZQUFZO1lBRVosSUFBSSxLQUFLLE1BQU0sSUFBSSxJQUFJLEVBQUU7Z0JBQ3ZCLElBQUksMEJBQTBCLEtBQUssTUFBTSxDQUFDLFFBQVE7WUFDcEQsQ0FBQztZQUVELElBQUksS0FBSyxZQUFZLEVBQUUsUUFBUTtnQkFDN0IsSUFBSSxnQ0FBZ0MsS0FBSyxZQUFZLENBQUMsSUFBSSxDQUFDO1lBQzdELENBQUM7WUFFRCxJQUFJLFVBQVUsS0FBSyxZQUFZO1lBQy9CLElBQUksQ0FBQyxTQUFTLFFBQVE7Z0JBQ3BCLE1BQU0saUJBQWlCLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQztnQkFDcEMsSUFBSSxnQkFBZ0I7b0JBQ2xCLFVBQVUsZUFBZSxLQUFLLENBQUM7Z0JBQ2pDLENBQUM7WUFDSCxDQUFDO1lBQ0QsSUFBSSxTQUFTLFFBQVE7Z0JBQ25CLElBQUksZ0NBQWdDLFFBQVEsSUFBSSxDQUFDO2dCQUNqRCxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVE7WUFDL0IsQ0FBQztZQUVELEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFDckIsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztZQUVyQixPQUFPLElBQUksU0FBUyxJQUFJLEVBQUU7Z0JBQ3hCLFNBQVMsRUFBRSxHQUFHLENBQUMsT0FBTztnQkFDdEIsUUFBUTtnQkFDUixZQUFZLEVBQUUsR0FBRyxDQUFDLFVBQVU7WUFDOUI7UUFDRixDQUFDO0lBQ0g7QUFDRixFQUFDIn0=