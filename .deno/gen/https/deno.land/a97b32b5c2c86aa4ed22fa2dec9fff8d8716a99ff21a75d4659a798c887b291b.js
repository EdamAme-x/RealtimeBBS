const ENCODING_TYPES = [
    'gzip',
    'deflate'
];
export const compress = (options)=>{
    return async (ctx, next)=>{
        await next();
        const accepted = ctx.req.headers.get('Accept-Encoding');
        const encoding = options?.encoding ?? ENCODING_TYPES.find((encoding)=>accepted?.includes(encoding));
        if (!encoding || !ctx.res.body) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const stream = new CompressionStream(encoding);
        ctx.res = new Response(ctx.res.body.pipeThrough(stream), ctx.res);
        ctx.res.headers.delete('Content-Length');
        ctx.res.headers.set('Content-Encoding', encoding);
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvbWlkZGxld2FyZS9jb21wcmVzcy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IE1pZGRsZXdhcmVIYW5kbGVyIH0gZnJvbSAnLi4vLi4vdHlwZXMudHMnXG5cbmNvbnN0IEVOQ09ESU5HX1RZUEVTID0gWydnemlwJywgJ2RlZmxhdGUnXSBhcyBjb25zdFxuXG5pbnRlcmZhY2UgQ29tcHJlc3Npb25PcHRpb25zIHtcbiAgZW5jb2Rpbmc/OiB0eXBlb2YgRU5DT0RJTkdfVFlQRVNbbnVtYmVyXVxufVxuXG5leHBvcnQgY29uc3QgY29tcHJlc3MgPSAob3B0aW9ucz86IENvbXByZXNzaW9uT3B0aW9ucyk6IE1pZGRsZXdhcmVIYW5kbGVyID0+IHtcbiAgcmV0dXJuIGFzeW5jIChjdHgsIG5leHQpID0+IHtcbiAgICBhd2FpdCBuZXh0KClcbiAgICBjb25zdCBhY2NlcHRlZCA9IGN0eC5yZXEuaGVhZGVycy5nZXQoJ0FjY2VwdC1FbmNvZGluZycpXG4gICAgY29uc3QgZW5jb2RpbmcgPVxuICAgICAgb3B0aW9ucz8uZW5jb2RpbmcgPz8gRU5DT0RJTkdfVFlQRVMuZmluZCgoZW5jb2RpbmcpID0+IGFjY2VwdGVkPy5pbmNsdWRlcyhlbmNvZGluZykpXG4gICAgaWYgKCFlbmNvZGluZyB8fCAhY3R4LnJlcy5ib2R5KSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBjb25zdCBzdHJlYW0gPSBuZXcgQ29tcHJlc3Npb25TdHJlYW0oZW5jb2RpbmcpXG4gICAgY3R4LnJlcyA9IG5ldyBSZXNwb25zZShjdHgucmVzLmJvZHkucGlwZVRocm91Z2goc3RyZWFtKSwgY3R4LnJlcylcbiAgICBjdHgucmVzLmhlYWRlcnMuZGVsZXRlKCdDb250ZW50LUxlbmd0aCcpXG4gICAgY3R4LnJlcy5oZWFkZXJzLnNldCgnQ29udGVudC1FbmNvZGluZycsIGVuY29kaW5nKVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsTUFBTSxpQkFBaUI7SUFBQztJQUFRO0NBQVU7QUFNMUMsT0FBTyxNQUFNLFdBQVcsQ0FBQyxVQUFvRDtJQUMzRSxPQUFPLE9BQU8sS0FBSyxPQUFTO1FBQzFCLE1BQU07UUFDTixNQUFNLFdBQVcsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztRQUNyQyxNQUFNLFdBQ0osU0FBUyxZQUFZLGVBQWUsSUFBSSxDQUFDLENBQUMsV0FBYSxVQUFVLFNBQVM7UUFDNUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUU7WUFDOUI7UUFDRixDQUFDO1FBQ0QsNkRBQTZEO1FBQzdELGFBQWE7UUFDYixNQUFNLFNBQVMsSUFBSSxrQkFBa0I7UUFDckMsSUFBSSxHQUFHLEdBQUcsSUFBSSxTQUFTLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxJQUFJLEdBQUc7UUFDaEUsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUN2QixJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQjtJQUMxQztBQUNGLEVBQUMifQ==