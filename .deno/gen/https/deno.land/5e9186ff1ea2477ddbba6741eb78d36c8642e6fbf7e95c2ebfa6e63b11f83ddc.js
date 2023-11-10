import '../../context.ts';
const getTime = ()=>{
    try {
        return performance.now();
    } catch  {}
    return Date.now();
};
export const timing = (config)=>{
    const options = {
        ...{
            total: true,
            enabled: true,
            totalDescription: 'Total Response Time',
            autoEnd: true,
            crossOrigin: false
        },
        ...config
    };
    return async (c, next)=>{
        const headers = [];
        const timers = new Map();
        c.set('metric', {
            headers,
            timers
        });
        if (options.total) {
            startTime(c, 'total', options.totalDescription);
        }
        await next();
        if (options.total) {
            endTime(c, 'total');
        }
        if (options.autoEnd) {
            timers.forEach((_, key)=>endTime(c, key));
        }
        const enabled = typeof options.enabled === 'function' ? options.enabled(c) : options.enabled;
        if (enabled) {
            c.res.headers.append('Server-Timing', headers.join(','));
            if (options.crossOrigin) {
                c.res.headers.append('Timing-Allow-Origin', typeof options.crossOrigin === 'string' ? options.crossOrigin : '*');
            }
        }
    };
};
export const setMetric = (c, name, valueDescription, description, precision)=>{
    const metrics = c.get('metric');
    if (!metrics) {
        console.warn('Metrics not initialized! Please add the `timing()` middleware to this route!');
        return;
    }
    if (typeof valueDescription === 'number') {
        const dur = valueDescription.toFixed(precision || 1);
        const metric = description ? `${name};dur=${dur};desc="${description}"` : `${name};dur=${dur}`;
        metrics.headers.push(metric);
    } else {
        // Value-less metric
        const metric = valueDescription ? `${name};desc="${valueDescription}"` : `${name}`;
        metrics.headers.push(metric);
    }
};
export const startTime = (c, name, description)=>{
    const metrics = c.get('metric');
    if (!metrics) {
        console.warn('Metrics not initialized! Please add the `timing()` middleware to this route!');
        return;
    }
    metrics.timers.set(name, {
        description,
        start: getTime()
    });
};
export const endTime = (c, name, precision)=>{
    const metrics = c.get('metric');
    if (!metrics) {
        console.warn('Metrics not initialized! Please add the `timing()` middleware to this route!');
        return;
    }
    const timer = metrics.timers.get(name);
    if (!timer) {
        console.warn(`Timer "${name}" does not exist!`);
        return;
    }
    const { description , start  } = timer;
    const duration = getTime() - start;
    setMetric(c, name, duration, description, precision);
    metrics.timers.delete(name);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvbWlkZGxld2FyZS90aW1pbmcvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBDb250ZXh0IH0gZnJvbSAnLi4vLi4vY29udGV4dC50cydcbmltcG9ydCB0eXBlIHsgTWlkZGxld2FyZUhhbmRsZXIgfSBmcm9tICcuLi8uLi90eXBlcy50cydcbmltcG9ydCAnLi4vLi4vY29udGV4dC50cydcblxuZGVjbGFyZSBtb2R1bGUgJy4uLy4uL2NvbnRleHQudHMnIHtcbiAgaW50ZXJmYWNlIENvbnRleHRWYXJpYWJsZU1hcCB7XG4gICAgbWV0cmljPzoge1xuICAgICAgaGVhZGVyczogc3RyaW5nW11cbiAgICAgIHRpbWVyczogTWFwPHN0cmluZywgVGltZXI+XG4gICAgfVxuICB9XG59XG5cbmludGVyZmFjZSBUaW1lciB7XG4gIGRlc2NyaXB0aW9uPzogc3RyaW5nXG4gIHN0YXJ0OiBudW1iZXJcbn1cblxuaW50ZXJmYWNlIFRpbWluZ09wdGlvbnMge1xuICB0b3RhbDogYm9vbGVhblxuICBlbmFibGVkOiBib29sZWFuIHwgKChjOiBDb250ZXh0KSA9PiBib29sZWFuKVxuICB0b3RhbERlc2NyaXB0aW9uOiBzdHJpbmdcbiAgYXV0b0VuZDogYm9vbGVhblxuICBjcm9zc09yaWdpbjogYm9vbGVhbiB8IHN0cmluZ1xufVxuXG5jb25zdCBnZXRUaW1lID0gKCkgPT4ge1xuICB0cnkge1xuICAgIHJldHVybiBwZXJmb3JtYW5jZS5ub3coKVxuICB9IGNhdGNoIHt9XG4gIHJldHVybiBEYXRlLm5vdygpXG59XG5cbmV4cG9ydCBjb25zdCB0aW1pbmcgPSAoY29uZmlnPzogUGFydGlhbDxUaW1pbmdPcHRpb25zPik6IE1pZGRsZXdhcmVIYW5kbGVyID0+IHtcbiAgY29uc3Qgb3B0aW9uczogVGltaW5nT3B0aW9ucyA9IHtcbiAgICAuLi57XG4gICAgICB0b3RhbDogdHJ1ZSxcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICB0b3RhbERlc2NyaXB0aW9uOiAnVG90YWwgUmVzcG9uc2UgVGltZScsXG4gICAgICBhdXRvRW5kOiB0cnVlLFxuICAgICAgY3Jvc3NPcmlnaW46IGZhbHNlLFxuICAgIH0sXG4gICAgLi4uY29uZmlnLFxuICB9XG4gIHJldHVybiBhc3luYyAoYywgbmV4dCkgPT4ge1xuICAgIGNvbnN0IGhlYWRlcnM6IHN0cmluZ1tdID0gW11cbiAgICBjb25zdCB0aW1lcnMgPSBuZXcgTWFwPHN0cmluZywgVGltZXI+KClcbiAgICBjLnNldCgnbWV0cmljJywgeyBoZWFkZXJzLCB0aW1lcnMgfSlcblxuICAgIGlmIChvcHRpb25zLnRvdGFsKSB7XG4gICAgICBzdGFydFRpbWUoYywgJ3RvdGFsJywgb3B0aW9ucy50b3RhbERlc2NyaXB0aW9uKVxuICAgIH1cbiAgICBhd2FpdCBuZXh0KClcblxuICAgIGlmIChvcHRpb25zLnRvdGFsKSB7XG4gICAgICBlbmRUaW1lKGMsICd0b3RhbCcpXG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMuYXV0b0VuZCkge1xuICAgICAgdGltZXJzLmZvckVhY2goKF8sIGtleSkgPT4gZW5kVGltZShjLCBrZXkpKVxuICAgIH1cblxuICAgIGNvbnN0IGVuYWJsZWQgPSB0eXBlb2Ygb3B0aW9ucy5lbmFibGVkID09PSAnZnVuY3Rpb24nID8gb3B0aW9ucy5lbmFibGVkKGMpIDogb3B0aW9ucy5lbmFibGVkXG5cbiAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgYy5yZXMuaGVhZGVycy5hcHBlbmQoJ1NlcnZlci1UaW1pbmcnLCBoZWFkZXJzLmpvaW4oJywnKSlcbiAgICAgIGlmIChvcHRpb25zLmNyb3NzT3JpZ2luKSB7XG4gICAgICAgIGMucmVzLmhlYWRlcnMuYXBwZW5kKFxuICAgICAgICAgICdUaW1pbmctQWxsb3ctT3JpZ2luJyxcbiAgICAgICAgICB0eXBlb2Ygb3B0aW9ucy5jcm9zc09yaWdpbiA9PT0gJ3N0cmluZycgPyBvcHRpb25zLmNyb3NzT3JpZ2luIDogJyonXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuaW50ZXJmYWNlIFNldE1ldHJpYyB7XG4gIChjOiBDb250ZXh0LCBuYW1lOiBzdHJpbmcsIHZhbHVlOiBudW1iZXIsIGRlc2NyaXB0aW9uPzogc3RyaW5nLCBwcmVjaXNpb24/OiBudW1iZXIpOiB2b2lkXG5cbiAgKGM6IENvbnRleHQsIG5hbWU6IHN0cmluZywgZGVzY3JpcHRpb24/OiBzdHJpbmcpOiB2b2lkXG59XG5cbmV4cG9ydCBjb25zdCBzZXRNZXRyaWM6IFNldE1ldHJpYyA9IChcbiAgYzogQ29udGV4dCxcbiAgbmFtZTogc3RyaW5nLFxuICB2YWx1ZURlc2NyaXB0aW9uOiBudW1iZXIgfCBzdHJpbmcgfCB1bmRlZmluZWQsXG4gIGRlc2NyaXB0aW9uPzogc3RyaW5nLFxuICBwcmVjaXNpb24/OiBudW1iZXJcbikgPT4ge1xuICBjb25zdCBtZXRyaWNzID0gYy5nZXQoJ21ldHJpYycpXG4gIGlmICghbWV0cmljcykge1xuICAgIGNvbnNvbGUud2FybignTWV0cmljcyBub3QgaW5pdGlhbGl6ZWQhIFBsZWFzZSBhZGQgdGhlIGB0aW1pbmcoKWAgbWlkZGxld2FyZSB0byB0aGlzIHJvdXRlIScpXG4gICAgcmV0dXJuXG4gIH1cbiAgaWYgKHR5cGVvZiB2YWx1ZURlc2NyaXB0aW9uID09PSAnbnVtYmVyJykge1xuICAgIGNvbnN0IGR1ciA9IHZhbHVlRGVzY3JpcHRpb24udG9GaXhlZChwcmVjaXNpb24gfHwgMSlcblxuICAgIGNvbnN0IG1ldHJpYyA9IGRlc2NyaXB0aW9uID8gYCR7bmFtZX07ZHVyPSR7ZHVyfTtkZXNjPVwiJHtkZXNjcmlwdGlvbn1cImAgOiBgJHtuYW1lfTtkdXI9JHtkdXJ9YFxuXG4gICAgbWV0cmljcy5oZWFkZXJzLnB1c2gobWV0cmljKVxuICB9IGVsc2Uge1xuICAgIC8vIFZhbHVlLWxlc3MgbWV0cmljXG4gICAgY29uc3QgbWV0cmljID0gdmFsdWVEZXNjcmlwdGlvbiA/IGAke25hbWV9O2Rlc2M9XCIke3ZhbHVlRGVzY3JpcHRpb259XCJgIDogYCR7bmFtZX1gXG5cbiAgICBtZXRyaWNzLmhlYWRlcnMucHVzaChtZXRyaWMpXG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IHN0YXJ0VGltZSA9IChjOiBDb250ZXh0LCBuYW1lOiBzdHJpbmcsIGRlc2NyaXB0aW9uPzogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IG1ldHJpY3MgPSBjLmdldCgnbWV0cmljJylcbiAgaWYgKCFtZXRyaWNzKSB7XG4gICAgY29uc29sZS53YXJuKCdNZXRyaWNzIG5vdCBpbml0aWFsaXplZCEgUGxlYXNlIGFkZCB0aGUgYHRpbWluZygpYCBtaWRkbGV3YXJlIHRvIHRoaXMgcm91dGUhJylcbiAgICByZXR1cm5cbiAgfVxuICBtZXRyaWNzLnRpbWVycy5zZXQobmFtZSwgeyBkZXNjcmlwdGlvbiwgc3RhcnQ6IGdldFRpbWUoKSB9KVxufVxuXG5leHBvcnQgY29uc3QgZW5kVGltZSA9IChjOiBDb250ZXh0LCBuYW1lOiBzdHJpbmcsIHByZWNpc2lvbj86IG51bWJlcikgPT4ge1xuICBjb25zdCBtZXRyaWNzID0gYy5nZXQoJ21ldHJpYycpXG4gIGlmICghbWV0cmljcykge1xuICAgIGNvbnNvbGUud2FybignTWV0cmljcyBub3QgaW5pdGlhbGl6ZWQhIFBsZWFzZSBhZGQgdGhlIGB0aW1pbmcoKWAgbWlkZGxld2FyZSB0byB0aGlzIHJvdXRlIScpXG4gICAgcmV0dXJuXG4gIH1cbiAgY29uc3QgdGltZXIgPSBtZXRyaWNzLnRpbWVycy5nZXQobmFtZSlcbiAgaWYgKCF0aW1lcikge1xuICAgIGNvbnNvbGUud2FybihgVGltZXIgXCIke25hbWV9XCIgZG9lcyBub3QgZXhpc3QhYClcbiAgICByZXR1cm5cbiAgfVxuICBjb25zdCB7IGRlc2NyaXB0aW9uLCBzdGFydCB9ID0gdGltZXJcblxuICBjb25zdCBkdXJhdGlvbiA9IGdldFRpbWUoKSAtIHN0YXJ0XG5cbiAgc2V0TWV0cmljKGMsIG5hbWUsIGR1cmF0aW9uLCBkZXNjcmlwdGlvbiwgcHJlY2lzaW9uKVxuICBtZXRyaWNzLnRpbWVycy5kZWxldGUobmFtZSlcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLG1CQUFrQjtBQXdCekIsTUFBTSxVQUFVLElBQU07SUFDcEIsSUFBSTtRQUNGLE9BQU8sWUFBWSxHQUFHO0lBQ3hCLEVBQUUsT0FBTSxDQUFDO0lBQ1QsT0FBTyxLQUFLLEdBQUc7QUFDakI7QUFFQSxPQUFPLE1BQU0sU0FBUyxDQUFDLFNBQXVEO0lBQzVFLE1BQU0sVUFBeUI7UUFDN0IsR0FBRztZQUNELE9BQU8sSUFBSTtZQUNYLFNBQVMsSUFBSTtZQUNiLGtCQUFrQjtZQUNsQixTQUFTLElBQUk7WUFDYixhQUFhLEtBQUs7UUFDcEIsQ0FBQztRQUNELEdBQUcsTUFBTTtJQUNYO0lBQ0EsT0FBTyxPQUFPLEdBQUcsT0FBUztRQUN4QixNQUFNLFVBQW9CLEVBQUU7UUFDNUIsTUFBTSxTQUFTLElBQUk7UUFDbkIsRUFBRSxHQUFHLENBQUMsVUFBVTtZQUFFO1lBQVM7UUFBTztRQUVsQyxJQUFJLFFBQVEsS0FBSyxFQUFFO1lBQ2pCLFVBQVUsR0FBRyxTQUFTLFFBQVEsZ0JBQWdCO1FBQ2hELENBQUM7UUFDRCxNQUFNO1FBRU4sSUFBSSxRQUFRLEtBQUssRUFBRTtZQUNqQixRQUFRLEdBQUc7UUFDYixDQUFDO1FBRUQsSUFBSSxRQUFRLE9BQU8sRUFBRTtZQUNuQixPQUFPLE9BQU8sQ0FBQyxDQUFDLEdBQUcsTUFBUSxRQUFRLEdBQUc7UUFDeEMsQ0FBQztRQUVELE1BQU0sVUFBVSxPQUFPLFFBQVEsT0FBTyxLQUFLLGFBQWEsUUFBUSxPQUFPLENBQUMsS0FBSyxRQUFRLE9BQU87UUFFNUYsSUFBSSxTQUFTO1lBQ1gsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsUUFBUSxJQUFJLENBQUM7WUFDbkQsSUFBSSxRQUFRLFdBQVcsRUFBRTtnQkFDdkIsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FDbEIsdUJBQ0EsT0FBTyxRQUFRLFdBQVcsS0FBSyxXQUFXLFFBQVEsV0FBVyxHQUFHLEdBQUc7WUFFdkUsQ0FBQztRQUNILENBQUM7SUFDSDtBQUNGLEVBQUM7QUFRRCxPQUFPLE1BQU0sWUFBdUIsQ0FDbEMsR0FDQSxNQUNBLGtCQUNBLGFBQ0EsWUFDRztJQUNILE1BQU0sVUFBVSxFQUFFLEdBQUcsQ0FBQztJQUN0QixJQUFJLENBQUMsU0FBUztRQUNaLFFBQVEsSUFBSSxDQUFDO1FBQ2I7SUFDRixDQUFDO0lBQ0QsSUFBSSxPQUFPLHFCQUFxQixVQUFVO1FBQ3hDLE1BQU0sTUFBTSxpQkFBaUIsT0FBTyxDQUFDLGFBQWE7UUFFbEQsTUFBTSxTQUFTLGNBQWMsQ0FBQyxFQUFFLEtBQUssS0FBSyxFQUFFLElBQUksT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssS0FBSyxFQUFFLElBQUksQ0FBQztRQUU5RixRQUFRLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFDdkIsT0FBTztRQUNMLG9CQUFvQjtRQUNwQixNQUFNLFNBQVMsbUJBQW1CLENBQUMsRUFBRSxLQUFLLE9BQU8sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQztRQUVsRixRQUFRLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFDdkIsQ0FBQztBQUNILEVBQUM7QUFFRCxPQUFPLE1BQU0sWUFBWSxDQUFDLEdBQVksTUFBYyxjQUF5QjtJQUMzRSxNQUFNLFVBQVUsRUFBRSxHQUFHLENBQUM7SUFDdEIsSUFBSSxDQUFDLFNBQVM7UUFDWixRQUFRLElBQUksQ0FBQztRQUNiO0lBQ0YsQ0FBQztJQUNELFFBQVEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNO1FBQUU7UUFBYSxPQUFPO0lBQVU7QUFDM0QsRUFBQztBQUVELE9BQU8sTUFBTSxVQUFVLENBQUMsR0FBWSxNQUFjLFlBQXVCO0lBQ3ZFLE1BQU0sVUFBVSxFQUFFLEdBQUcsQ0FBQztJQUN0QixJQUFJLENBQUMsU0FBUztRQUNaLFFBQVEsSUFBSSxDQUFDO1FBQ2I7SUFDRixDQUFDO0lBQ0QsTUFBTSxRQUFRLFFBQVEsTUFBTSxDQUFDLEdBQUcsQ0FBQztJQUNqQyxJQUFJLENBQUMsT0FBTztRQUNWLFFBQVEsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLEtBQUssaUJBQWlCLENBQUM7UUFDOUM7SUFDRixDQUFDO0lBQ0QsTUFBTSxFQUFFLFlBQVcsRUFBRSxNQUFLLEVBQUUsR0FBRztJQUUvQixNQUFNLFdBQVcsWUFBWTtJQUU3QixVQUFVLEdBQUcsTUFBTSxVQUFVLGFBQWE7SUFDMUMsUUFBUSxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ3hCLEVBQUMifQ==