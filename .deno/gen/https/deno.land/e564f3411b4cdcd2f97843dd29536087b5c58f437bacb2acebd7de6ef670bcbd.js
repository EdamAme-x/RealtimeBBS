const HEADERS_MAP = {
    crossOriginEmbedderPolicy: [
        'Cross-Origin-Embedder-Policy',
        'require-corp'
    ],
    crossOriginResourcePolicy: [
        'Cross-Origin-Resource-Policy',
        'same-origin'
    ],
    crossOriginOpenerPolicy: [
        'Cross-Origin-Opener-Policy',
        'same-origin'
    ],
    originAgentCluster: [
        'Origin-Agent-Cluster',
        '?1'
    ],
    referrerPolicy: [
        'Referrer-Policy',
        'no-referrer'
    ],
    strictTransportSecurity: [
        'Strict-Transport-Security',
        'max-age=15552000; includeSubDomains'
    ],
    xContentTypeOptions: [
        'X-Content-Type-Options',
        'nosniff'
    ],
    xDnsPrefetchControl: [
        'X-DNS-Prefetch-Control',
        'off'
    ],
    xDownloadOptions: [
        'X-Download-Options',
        'noopen'
    ],
    xFrameOptions: [
        'X-Frame-Options',
        'SAMEORIGIN'
    ],
    xPermittedCrossDomainPolicies: [
        'X-Permitted-Cross-Domain-Policies',
        'none'
    ],
    xXssProtection: [
        'X-XSS-Protection',
        '0'
    ]
};
const DEFAULT_OPTIONS = {
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: true,
    crossOriginOpenerPolicy: true,
    originAgentCluster: true,
    referrerPolicy: true,
    strictTransportSecurity: true,
    xContentTypeOptions: true,
    xDnsPrefetchControl: true,
    xDownloadOptions: true,
    xFrameOptions: true,
    xPermittedCrossDomainPolicies: true,
    xXssProtection: true
};
export const secureHeaders = (customOptions)=>{
    const options = {
        ...DEFAULT_OPTIONS,
        ...customOptions
    };
    const headersToSet = Object.entries(HEADERS_MAP).filter(([key])=>options[key]).map(([key, defaultValue])=>{
        const overrideValue = options[key];
        if (typeof overrideValue === 'string') return [
            defaultValue[0],
            overrideValue
        ];
        return defaultValue;
    });
    if (options.contentSecurityPolicy) {
        const cspDirectives = Object.entries(options.contentSecurityPolicy).map(([directive, value])=>{
            // convert camelCase to kebab-case directives (e.g. `defaultSrc` -> `default-src`)
            directive = directive.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (match, offset)=>(offset ? '-' : '') + match.toLowerCase());
            return `${directive} ${Array.isArray(value) ? value.join(' ') : value}`;
        }).join('; ');
        headersToSet.push([
            'Content-Security-Policy',
            cspDirectives
        ]);
    }
    if (options.reportingEndpoints) {
        const reportingEndpoints = options.reportingEndpoints.map((endpoint)=>`${endpoint.name}="${endpoint.url}"`).join(', ');
        headersToSet.push([
            'Reporting-Endpoints',
            reportingEndpoints
        ]);
    }
    if (options.reportTo) {
        const reportToOptions = options.reportTo.map((option)=>JSON.stringify(option)).join(', ');
        headersToSet.push([
            'Report-To',
            reportToOptions
        ]);
    }
    return async (ctx, next)=>{
        await next();
        headersToSet.forEach(([header, value])=>{
            ctx.res.headers.set(header, value);
        });
        ctx.res.headers.delete('X-Powered-By');
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvbWlkZGxld2FyZS9zZWN1cmUtaGVhZGVycy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IE1pZGRsZXdhcmVIYW5kbGVyIH0gZnJvbSAnLi4vLi4vdHlwZXMudHMnXG5cbmludGVyZmFjZSBDb250ZW50U2VjdXJpdHlQb2xpY3lPcHRpb25zIHtcbiAgZGVmYXVsdFNyYz86IHN0cmluZ1tdXG4gIGJhc2VVcmk/OiBzdHJpbmdbXVxuICBjaGlsZFNyYz86IHN0cmluZ1tdXG4gIGNvbm5lY3RTcmM/OiBzdHJpbmdbXVxuICBmb250U3JjPzogc3RyaW5nW11cbiAgZm9ybUFjdGlvbj86IHN0cmluZ1tdXG4gIGZyYW1lQW5jZXN0b3JzPzogc3RyaW5nW11cbiAgZnJhbWVTcmM/OiBzdHJpbmdbXVxuICBpbWdTcmM/OiBzdHJpbmdbXVxuICBtYW5pZmVzdFNyYz86IHN0cmluZ1tdXG4gIG1lZGlhU3JjPzogc3RyaW5nW11cbiAgb2JqZWN0U3JjPzogc3RyaW5nW11cbiAgcmVwb3J0VG8/OiBzdHJpbmdcbiAgc2FuZGJveD86IHN0cmluZ1tdXG4gIHNjcmlwdFNyYz86IHN0cmluZ1tdXG4gIHNjcmlwdFNyY0F0dHI/OiBzdHJpbmdbXVxuICBzY3JpcHRTcmNFbGVtPzogc3RyaW5nW11cbiAgc3R5bGVTcmM/OiBzdHJpbmdbXVxuICBzdHlsZVNyY0F0dHI/OiBzdHJpbmdbXVxuICBzdHlsZVNyY0VsZW0/OiBzdHJpbmdbXVxuICB1cGdyYWRlSW5zZWN1cmVSZXF1ZXN0cz86IHN0cmluZ1tdXG4gIHdvcmtlclNyYz86IHN0cmluZ1tdXG59XG5cbmludGVyZmFjZSBSZXBvcnRUb09wdGlvbnMge1xuICBncm91cDogc3RyaW5nXG4gIG1heF9hZ2U6IG51bWJlclxuICBlbmRwb2ludHM6IFJlcG9ydFRvRW5kcG9pbnRbXVxufVxuXG5pbnRlcmZhY2UgUmVwb3J0VG9FbmRwb2ludCB7XG4gIHVybDogc3RyaW5nXG59XG5cbmludGVyZmFjZSBSZXBvcnRpbmdFbmRwb2ludE9wdGlvbnMge1xuICBuYW1lOiBzdHJpbmdcbiAgdXJsOiBzdHJpbmdcbn1cblxudHlwZSBvdmVycmlkYWJsZUhlYWRlciA9IGJvb2xlYW4gfCBzdHJpbmdcblxuaW50ZXJmYWNlIFNlY3VyZUhlYWRlcnNPcHRpb25zIHtcbiAgY29udGVudFNlY3VyaXR5UG9saWN5PzogQ29udGVudFNlY3VyaXR5UG9saWN5T3B0aW9uc1xuICBjcm9zc09yaWdpbkVtYmVkZGVyUG9saWN5Pzogb3ZlcnJpZGFibGVIZWFkZXJcbiAgY3Jvc3NPcmlnaW5SZXNvdXJjZVBvbGljeT86IG92ZXJyaWRhYmxlSGVhZGVyXG4gIGNyb3NzT3JpZ2luT3BlbmVyUG9saWN5Pzogb3ZlcnJpZGFibGVIZWFkZXJcbiAgb3JpZ2luQWdlbnRDbHVzdGVyOiBvdmVycmlkYWJsZUhlYWRlclxuICByZWZlcnJlclBvbGljeT86IG92ZXJyaWRhYmxlSGVhZGVyXG4gIHJlcG9ydGluZ0VuZHBvaW50cz86IFJlcG9ydGluZ0VuZHBvaW50T3B0aW9uc1tdXG4gIHJlcG9ydFRvPzogUmVwb3J0VG9PcHRpb25zW11cbiAgc3RyaWN0VHJhbnNwb3J0U2VjdXJpdHk/OiBvdmVycmlkYWJsZUhlYWRlclxuICB4Q29udGVudFR5cGVPcHRpb25zPzogb3ZlcnJpZGFibGVIZWFkZXJcbiAgeERuc1ByZWZldGNoQ29udHJvbD86IG92ZXJyaWRhYmxlSGVhZGVyXG4gIHhEb3dubG9hZE9wdGlvbnM/OiBvdmVycmlkYWJsZUhlYWRlclxuICB4RnJhbWVPcHRpb25zPzogb3ZlcnJpZGFibGVIZWFkZXJcbiAgeFBlcm1pdHRlZENyb3NzRG9tYWluUG9saWNpZXM/OiBvdmVycmlkYWJsZUhlYWRlclxuICB4WHNzUHJvdGVjdGlvbj86IG92ZXJyaWRhYmxlSGVhZGVyXG59XG5cbnR5cGUgSGVhZGVyc01hcCA9IHtcbiAgW2tleSBpbiBrZXlvZiBTZWN1cmVIZWFkZXJzT3B0aW9uc106IFtzdHJpbmcsIHN0cmluZ11cbn1cblxuY29uc3QgSEVBREVSU19NQVA6IEhlYWRlcnNNYXAgPSB7XG4gIGNyb3NzT3JpZ2luRW1iZWRkZXJQb2xpY3k6IFsnQ3Jvc3MtT3JpZ2luLUVtYmVkZGVyLVBvbGljeScsICdyZXF1aXJlLWNvcnAnXSxcbiAgY3Jvc3NPcmlnaW5SZXNvdXJjZVBvbGljeTogWydDcm9zcy1PcmlnaW4tUmVzb3VyY2UtUG9saWN5JywgJ3NhbWUtb3JpZ2luJ10sXG4gIGNyb3NzT3JpZ2luT3BlbmVyUG9saWN5OiBbJ0Nyb3NzLU9yaWdpbi1PcGVuZXItUG9saWN5JywgJ3NhbWUtb3JpZ2luJ10sXG4gIG9yaWdpbkFnZW50Q2x1c3RlcjogWydPcmlnaW4tQWdlbnQtQ2x1c3RlcicsICc/MSddLFxuICByZWZlcnJlclBvbGljeTogWydSZWZlcnJlci1Qb2xpY3knLCAnbm8tcmVmZXJyZXInXSxcbiAgc3RyaWN0VHJhbnNwb3J0U2VjdXJpdHk6IFsnU3RyaWN0LVRyYW5zcG9ydC1TZWN1cml0eScsICdtYXgtYWdlPTE1NTUyMDAwOyBpbmNsdWRlU3ViRG9tYWlucyddLFxuICB4Q29udGVudFR5cGVPcHRpb25zOiBbJ1gtQ29udGVudC1UeXBlLU9wdGlvbnMnLCAnbm9zbmlmZiddLFxuICB4RG5zUHJlZmV0Y2hDb250cm9sOiBbJ1gtRE5TLVByZWZldGNoLUNvbnRyb2wnLCAnb2ZmJ10sXG4gIHhEb3dubG9hZE9wdGlvbnM6IFsnWC1Eb3dubG9hZC1PcHRpb25zJywgJ25vb3BlbiddLFxuICB4RnJhbWVPcHRpb25zOiBbJ1gtRnJhbWUtT3B0aW9ucycsICdTQU1FT1JJR0lOJ10sXG4gIHhQZXJtaXR0ZWRDcm9zc0RvbWFpblBvbGljaWVzOiBbJ1gtUGVybWl0dGVkLUNyb3NzLURvbWFpbi1Qb2xpY2llcycsICdub25lJ10sXG4gIHhYc3NQcm90ZWN0aW9uOiBbJ1gtWFNTLVByb3RlY3Rpb24nLCAnMCddLFxufVxuXG5jb25zdCBERUZBVUxUX09QVElPTlM6IFNlY3VyZUhlYWRlcnNPcHRpb25zID0ge1xuICBjcm9zc09yaWdpbkVtYmVkZGVyUG9saWN5OiBmYWxzZSxcbiAgY3Jvc3NPcmlnaW5SZXNvdXJjZVBvbGljeTogdHJ1ZSxcbiAgY3Jvc3NPcmlnaW5PcGVuZXJQb2xpY3k6IHRydWUsXG4gIG9yaWdpbkFnZW50Q2x1c3RlcjogdHJ1ZSxcbiAgcmVmZXJyZXJQb2xpY3k6IHRydWUsXG4gIHN0cmljdFRyYW5zcG9ydFNlY3VyaXR5OiB0cnVlLFxuICB4Q29udGVudFR5cGVPcHRpb25zOiB0cnVlLFxuICB4RG5zUHJlZmV0Y2hDb250cm9sOiB0cnVlLFxuICB4RG93bmxvYWRPcHRpb25zOiB0cnVlLFxuICB4RnJhbWVPcHRpb25zOiB0cnVlLFxuICB4UGVybWl0dGVkQ3Jvc3NEb21haW5Qb2xpY2llczogdHJ1ZSxcbiAgeFhzc1Byb3RlY3Rpb246IHRydWUsXG59XG5cbmV4cG9ydCBjb25zdCBzZWN1cmVIZWFkZXJzID0gKGN1c3RvbU9wdGlvbnM/OiBQYXJ0aWFsPFNlY3VyZUhlYWRlcnNPcHRpb25zPik6IE1pZGRsZXdhcmVIYW5kbGVyID0+IHtcbiAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uREVGQVVMVF9PUFRJT05TLCAuLi5jdXN0b21PcHRpb25zIH1cbiAgY29uc3QgaGVhZGVyc1RvU2V0ID0gT2JqZWN0LmVudHJpZXMoSEVBREVSU19NQVApXG4gICAgLmZpbHRlcigoW2tleV0pID0+IG9wdGlvbnNba2V5IGFzIGtleW9mIFNlY3VyZUhlYWRlcnNPcHRpb25zXSlcbiAgICAubWFwKChba2V5LCBkZWZhdWx0VmFsdWVdKSA9PiB7XG4gICAgICBjb25zdCBvdmVycmlkZVZhbHVlID0gb3B0aW9uc1trZXkgYXMga2V5b2YgU2VjdXJlSGVhZGVyc09wdGlvbnNdXG4gICAgICBpZiAodHlwZW9mIG92ZXJyaWRlVmFsdWUgPT09ICdzdHJpbmcnKSByZXR1cm4gW2RlZmF1bHRWYWx1ZVswXSwgb3ZlcnJpZGVWYWx1ZV1cbiAgICAgIHJldHVybiBkZWZhdWx0VmFsdWVcbiAgICB9KVxuXG4gIGlmIChvcHRpb25zLmNvbnRlbnRTZWN1cml0eVBvbGljeSkge1xuICAgIGNvbnN0IGNzcERpcmVjdGl2ZXMgPSBPYmplY3QuZW50cmllcyhvcHRpb25zLmNvbnRlbnRTZWN1cml0eVBvbGljeSlcbiAgICAgIC5tYXAoKFtkaXJlY3RpdmUsIHZhbHVlXSkgPT4ge1xuICAgICAgICAvLyBjb252ZXJ0IGNhbWVsQ2FzZSB0byBrZWJhYi1jYXNlIGRpcmVjdGl2ZXMgKGUuZy4gYGRlZmF1bHRTcmNgIC0+IGBkZWZhdWx0LXNyY2ApXG4gICAgICAgIGRpcmVjdGl2ZSA9IGRpcmVjdGl2ZS5yZXBsYWNlKFxuICAgICAgICAgIC9bQS1aXSsoPyFbYS16XSl8W0EtWl0vZyxcbiAgICAgICAgICAobWF0Y2gsIG9mZnNldCkgPT4gKG9mZnNldCA/ICctJyA6ICcnKSArIG1hdGNoLnRvTG93ZXJDYXNlKClcbiAgICAgICAgKVxuICAgICAgICByZXR1cm4gYCR7ZGlyZWN0aXZlfSAke0FycmF5LmlzQXJyYXkodmFsdWUpID8gdmFsdWUuam9pbignICcpIDogdmFsdWV9YFxuICAgICAgfSlcbiAgICAgIC5qb2luKCc7ICcpXG4gICAgaGVhZGVyc1RvU2V0LnB1c2goWydDb250ZW50LVNlY3VyaXR5LVBvbGljeScsIGNzcERpcmVjdGl2ZXNdKVxuICB9XG5cbiAgaWYgKG9wdGlvbnMucmVwb3J0aW5nRW5kcG9pbnRzKSB7XG4gICAgY29uc3QgcmVwb3J0aW5nRW5kcG9pbnRzID0gb3B0aW9ucy5yZXBvcnRpbmdFbmRwb2ludHNcbiAgICAgIC5tYXAoKGVuZHBvaW50KSA9PiBgJHtlbmRwb2ludC5uYW1lfT1cIiR7ZW5kcG9pbnQudXJsfVwiYClcbiAgICAgIC5qb2luKCcsICcpXG4gICAgaGVhZGVyc1RvU2V0LnB1c2goWydSZXBvcnRpbmctRW5kcG9pbnRzJywgcmVwb3J0aW5nRW5kcG9pbnRzXSlcbiAgfVxuXG4gIGlmIChvcHRpb25zLnJlcG9ydFRvKSB7XG4gICAgY29uc3QgcmVwb3J0VG9PcHRpb25zID0gb3B0aW9ucy5yZXBvcnRUby5tYXAoKG9wdGlvbikgPT4gSlNPTi5zdHJpbmdpZnkob3B0aW9uKSkuam9pbignLCAnKVxuICAgIGhlYWRlcnNUb1NldC5wdXNoKFsnUmVwb3J0LVRvJywgcmVwb3J0VG9PcHRpb25zXSlcbiAgfVxuXG4gIHJldHVybiBhc3luYyAoY3R4LCBuZXh0KSA9PiB7XG4gICAgYXdhaXQgbmV4dCgpXG4gICAgaGVhZGVyc1RvU2V0LmZvckVhY2goKFtoZWFkZXIsIHZhbHVlXSkgPT4ge1xuICAgICAgY3R4LnJlcy5oZWFkZXJzLnNldChoZWFkZXIsIHZhbHVlKVxuICAgIH0pXG5cbiAgICBjdHgucmVzLmhlYWRlcnMuZGVsZXRlKCdYLVBvd2VyZWQtQnknKVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBa0VBLE1BQU0sY0FBMEI7SUFDOUIsMkJBQTJCO1FBQUM7UUFBZ0M7S0FBZTtJQUMzRSwyQkFBMkI7UUFBQztRQUFnQztLQUFjO0lBQzFFLHlCQUF5QjtRQUFDO1FBQThCO0tBQWM7SUFDdEUsb0JBQW9CO1FBQUM7UUFBd0I7S0FBSztJQUNsRCxnQkFBZ0I7UUFBQztRQUFtQjtLQUFjO0lBQ2xELHlCQUF5QjtRQUFDO1FBQTZCO0tBQXNDO0lBQzdGLHFCQUFxQjtRQUFDO1FBQTBCO0tBQVU7SUFDMUQscUJBQXFCO1FBQUM7UUFBMEI7S0FBTTtJQUN0RCxrQkFBa0I7UUFBQztRQUFzQjtLQUFTO0lBQ2xELGVBQWU7UUFBQztRQUFtQjtLQUFhO0lBQ2hELCtCQUErQjtRQUFDO1FBQXFDO0tBQU87SUFDNUUsZ0JBQWdCO1FBQUM7UUFBb0I7S0FBSTtBQUMzQztBQUVBLE1BQU0sa0JBQXdDO0lBQzVDLDJCQUEyQixLQUFLO0lBQ2hDLDJCQUEyQixJQUFJO0lBQy9CLHlCQUF5QixJQUFJO0lBQzdCLG9CQUFvQixJQUFJO0lBQ3hCLGdCQUFnQixJQUFJO0lBQ3BCLHlCQUF5QixJQUFJO0lBQzdCLHFCQUFxQixJQUFJO0lBQ3pCLHFCQUFxQixJQUFJO0lBQ3pCLGtCQUFrQixJQUFJO0lBQ3RCLGVBQWUsSUFBSTtJQUNuQiwrQkFBK0IsSUFBSTtJQUNuQyxnQkFBZ0IsSUFBSTtBQUN0QjtBQUVBLE9BQU8sTUFBTSxnQkFBZ0IsQ0FBQyxnQkFBcUU7SUFDakcsTUFBTSxVQUFVO1FBQUUsR0FBRyxlQUFlO1FBQUUsR0FBRyxhQUFhO0lBQUM7SUFDdkQsTUFBTSxlQUFlLE9BQU8sT0FBTyxDQUFDLGFBQ2pDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFLLE9BQU8sQ0FBQyxJQUFrQyxFQUM1RCxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssYUFBYSxHQUFLO1FBQzVCLE1BQU0sZ0JBQWdCLE9BQU8sQ0FBQyxJQUFrQztRQUNoRSxJQUFJLE9BQU8sa0JBQWtCLFVBQVUsT0FBTztZQUFDLFlBQVksQ0FBQyxFQUFFO1lBQUU7U0FBYztRQUM5RSxPQUFPO0lBQ1Q7SUFFRixJQUFJLFFBQVEscUJBQXFCLEVBQUU7UUFDakMsTUFBTSxnQkFBZ0IsT0FBTyxPQUFPLENBQUMsUUFBUSxxQkFBcUIsRUFDL0QsR0FBRyxDQUFDLENBQUMsQ0FBQyxXQUFXLE1BQU0sR0FBSztZQUMzQixrRkFBa0Y7WUFDbEYsWUFBWSxVQUFVLE9BQU8sQ0FDM0IsMEJBQ0EsQ0FBQyxPQUFPLFNBQVcsQ0FBQyxTQUFTLE1BQU0sRUFBRSxJQUFJLE1BQU0sV0FBVztZQUU1RCxPQUFPLENBQUMsRUFBRSxVQUFVLENBQUMsRUFBRSxNQUFNLE9BQU8sQ0FBQyxTQUFTLE1BQU0sSUFBSSxDQUFDLE9BQU8sS0FBSyxDQUFDLENBQUM7UUFDekUsR0FDQyxJQUFJLENBQUM7UUFDUixhQUFhLElBQUksQ0FBQztZQUFDO1lBQTJCO1NBQWM7SUFDOUQsQ0FBQztJQUVELElBQUksUUFBUSxrQkFBa0IsRUFBRTtRQUM5QixNQUFNLHFCQUFxQixRQUFRLGtCQUFrQixDQUNsRCxHQUFHLENBQUMsQ0FBQyxXQUFhLENBQUMsRUFBRSxTQUFTLElBQUksQ0FBQyxFQUFFLEVBQUUsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQ3RELElBQUksQ0FBQztRQUNSLGFBQWEsSUFBSSxDQUFDO1lBQUM7WUFBdUI7U0FBbUI7SUFDL0QsQ0FBQztJQUVELElBQUksUUFBUSxRQUFRLEVBQUU7UUFDcEIsTUFBTSxrQkFBa0IsUUFBUSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsU0FBVyxLQUFLLFNBQVMsQ0FBQyxTQUFTLElBQUksQ0FBQztRQUN0RixhQUFhLElBQUksQ0FBQztZQUFDO1lBQWE7U0FBZ0I7SUFDbEQsQ0FBQztJQUVELE9BQU8sT0FBTyxLQUFLLE9BQVM7UUFDMUIsTUFBTTtRQUNOLGFBQWEsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLE1BQU0sR0FBSztZQUN4QyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVE7UUFDOUI7UUFFQSxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO0lBQ3pCO0FBQ0YsRUFBQyJ9