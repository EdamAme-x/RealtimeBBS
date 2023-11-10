import { sha1 } from '../../utils/crypto.ts';
/**
 * Default headers to pass through on 304 responses. From the spec:
 * > The response must not contain a body and must include the headers that
 * > would have been sent in an equivalent 200 OK response: Cache-Control,
 * > Content-Location, Date, ETag, Expires, and Vary.
 */ const RETAINED_304_HEADERS = [
    'cache-control',
    'content-location',
    'date',
    'etag',
    'expires',
    'vary'
];
function etagMatches(etag, ifNoneMatch) {
    return ifNoneMatch != null && ifNoneMatch.split(/,\s*/).indexOf(etag) > -1;
}
export const etag = (options)=>{
    const retainedHeaders = options?.retainedHeaders ?? RETAINED_304_HEADERS;
    const weak = options?.weak ?? false;
    return async (c, next)=>{
        const ifNoneMatch = c.req.header('If-None-Match') ?? null;
        await next();
        const res = c.res;
        let etag = res.headers.get('ETag');
        if (!etag) {
            const hash = await sha1(res.clone().body || '');
            etag = weak ? `W/"${hash}"` : `"${hash}"`;
        }
        if (etagMatches(etag, ifNoneMatch)) {
            await c.res.blob() // Force using body
            ;
            c.res = new Response(null, {
                status: 304,
                statusText: 'Not Modified',
                headers: {
                    ETag: etag
                }
            });
            c.res.headers.forEach((_, key)=>{
                if (retainedHeaders.indexOf(key.toLowerCase()) === -1) {
                    c.res.headers.delete(key);
                }
            });
        } else {
            c.res.headers.set('ETag', etag);
        }
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvbWlkZGxld2FyZS9ldGFnL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgTWlkZGxld2FyZUhhbmRsZXIgfSBmcm9tICcuLi8uLi90eXBlcy50cydcbmltcG9ydCB7IHNoYTEgfSBmcm9tICcuLi8uLi91dGlscy9jcnlwdG8udHMnXG5cbnR5cGUgRVRhZ09wdGlvbnMgPSB7XG4gIHJldGFpbmVkSGVhZGVycz86IHN0cmluZ1tdXG4gIHdlYWs/OiBib29sZWFuXG59XG5cbi8qKlxuICogRGVmYXVsdCBoZWFkZXJzIHRvIHBhc3MgdGhyb3VnaCBvbiAzMDQgcmVzcG9uc2VzLiBGcm9tIHRoZSBzcGVjOlxuICogPiBUaGUgcmVzcG9uc2UgbXVzdCBub3QgY29udGFpbiBhIGJvZHkgYW5kIG11c3QgaW5jbHVkZSB0aGUgaGVhZGVycyB0aGF0XG4gKiA+IHdvdWxkIGhhdmUgYmVlbiBzZW50IGluIGFuIGVxdWl2YWxlbnQgMjAwIE9LIHJlc3BvbnNlOiBDYWNoZS1Db250cm9sLFxuICogPiBDb250ZW50LUxvY2F0aW9uLCBEYXRlLCBFVGFnLCBFeHBpcmVzLCBhbmQgVmFyeS5cbiAqL1xuY29uc3QgUkVUQUlORURfMzA0X0hFQURFUlMgPSBbXG4gICdjYWNoZS1jb250cm9sJyxcbiAgJ2NvbnRlbnQtbG9jYXRpb24nLFxuICAnZGF0ZScsXG4gICdldGFnJyxcbiAgJ2V4cGlyZXMnLFxuICAndmFyeScsXG5dXG5cbmZ1bmN0aW9uIGV0YWdNYXRjaGVzKGV0YWc6IHN0cmluZywgaWZOb25lTWF0Y2g6IHN0cmluZyB8IG51bGwpIHtcbiAgcmV0dXJuIGlmTm9uZU1hdGNoICE9IG51bGwgJiYgaWZOb25lTWF0Y2guc3BsaXQoLyxcXHMqLykuaW5kZXhPZihldGFnKSA+IC0xXG59XG5cbmV4cG9ydCBjb25zdCBldGFnID0gKG9wdGlvbnM/OiBFVGFnT3B0aW9ucyk6IE1pZGRsZXdhcmVIYW5kbGVyID0+IHtcbiAgY29uc3QgcmV0YWluZWRIZWFkZXJzID0gb3B0aW9ucz8ucmV0YWluZWRIZWFkZXJzID8/IFJFVEFJTkVEXzMwNF9IRUFERVJTXG4gIGNvbnN0IHdlYWsgPSBvcHRpb25zPy53ZWFrID8/IGZhbHNlXG5cbiAgcmV0dXJuIGFzeW5jIChjLCBuZXh0KSA9PiB7XG4gICAgY29uc3QgaWZOb25lTWF0Y2ggPSBjLnJlcS5oZWFkZXIoJ0lmLU5vbmUtTWF0Y2gnKSA/PyBudWxsXG5cbiAgICBhd2FpdCBuZXh0KClcblxuICAgIGNvbnN0IHJlcyA9IGMucmVzIGFzIFJlc3BvbnNlXG4gICAgbGV0IGV0YWcgPSByZXMuaGVhZGVycy5nZXQoJ0VUYWcnKVxuXG4gICAgaWYgKCFldGFnKSB7XG4gICAgICBjb25zdCBoYXNoID0gYXdhaXQgc2hhMShyZXMuY2xvbmUoKS5ib2R5IHx8ICcnKVxuICAgICAgZXRhZyA9IHdlYWsgPyBgVy9cIiR7aGFzaH1cImAgOiBgXCIke2hhc2h9XCJgXG4gICAgfVxuXG4gICAgaWYgKGV0YWdNYXRjaGVzKGV0YWcsIGlmTm9uZU1hdGNoKSkge1xuICAgICAgYXdhaXQgYy5yZXMuYmxvYigpIC8vIEZvcmNlIHVzaW5nIGJvZHlcbiAgICAgIGMucmVzID0gbmV3IFJlc3BvbnNlKG51bGwsIHtcbiAgICAgICAgc3RhdHVzOiAzMDQsXG4gICAgICAgIHN0YXR1c1RleHQ6ICdOb3QgTW9kaWZpZWQnLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgRVRhZzogZXRhZyxcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgICBjLnJlcy5oZWFkZXJzLmZvckVhY2goKF8sIGtleSkgPT4ge1xuICAgICAgICBpZiAocmV0YWluZWRIZWFkZXJzLmluZGV4T2Yoa2V5LnRvTG93ZXJDYXNlKCkpID09PSAtMSkge1xuICAgICAgICAgIGMucmVzLmhlYWRlcnMuZGVsZXRlKGtleSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgYy5yZXMuaGVhZGVycy5zZXQoJ0VUYWcnLCBldGFnKVxuICAgIH1cbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLFNBQVMsSUFBSSxRQUFRLHdCQUF1QjtBQU81Qzs7Ozs7Q0FLQyxHQUNELE1BQU0sdUJBQXVCO0lBQzNCO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtDQUNEO0FBRUQsU0FBUyxZQUFZLElBQVksRUFBRSxXQUEwQixFQUFFO0lBQzdELE9BQU8sZUFBZSxJQUFJLElBQUksWUFBWSxLQUFLLENBQUMsUUFBUSxPQUFPLENBQUMsUUFBUSxDQUFDO0FBQzNFO0FBRUEsT0FBTyxNQUFNLE9BQU8sQ0FBQyxVQUE2QztJQUNoRSxNQUFNLGtCQUFrQixTQUFTLG1CQUFtQjtJQUNwRCxNQUFNLE9BQU8sU0FBUyxRQUFRLEtBQUs7SUFFbkMsT0FBTyxPQUFPLEdBQUcsT0FBUztRQUN4QixNQUFNLGNBQWMsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLG9CQUFvQixJQUFJO1FBRXpELE1BQU07UUFFTixNQUFNLE1BQU0sRUFBRSxHQUFHO1FBQ2pCLElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUM7UUFFM0IsSUFBSSxDQUFDLE1BQU07WUFDVCxNQUFNLE9BQU8sTUFBTSxLQUFLLElBQUksS0FBSyxHQUFHLElBQUksSUFBSTtZQUM1QyxPQUFPLE9BQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMzQyxDQUFDO1FBRUQsSUFBSSxZQUFZLE1BQU0sY0FBYztZQUNsQyxNQUFNLEVBQUUsR0FBRyxDQUFDLElBQUksR0FBRyxtQkFBbUI7O1lBQ3RDLEVBQUUsR0FBRyxHQUFHLElBQUksU0FBUyxJQUFJLEVBQUU7Z0JBQ3pCLFFBQVE7Z0JBQ1IsWUFBWTtnQkFDWixTQUFTO29CQUNQLE1BQU07Z0JBQ1I7WUFDRjtZQUNBLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLE1BQVE7Z0JBQ2hDLElBQUksZ0JBQWdCLE9BQU8sQ0FBQyxJQUFJLFdBQVcsUUFBUSxDQUFDLEdBQUc7b0JBQ3JELEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7Z0JBQ3ZCLENBQUM7WUFDSDtRQUNGLE9BQU87WUFDTCxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVE7UUFDNUIsQ0FBQztJQUNIO0FBQ0YsRUFBQyJ9