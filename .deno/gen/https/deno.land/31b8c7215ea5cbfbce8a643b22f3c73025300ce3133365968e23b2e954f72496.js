export const prettyJSON = (options = {
    space: 2
})=>{
    return async (c, next)=>{
        const pretty = c.req.query('pretty') || c.req.query('pretty') === '' ? true : false;
        await next();
        if (pretty && c.res.headers.get('Content-Type')?.startsWith('application/json')) {
            const obj = await c.res.json();
            c.res = new Response(JSON.stringify(obj, null, options.space), c.res);
        }
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvbWlkZGxld2FyZS9wcmV0dHktanNvbi9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IE1pZGRsZXdhcmVIYW5kbGVyIH0gZnJvbSAnLi4vLi4vdHlwZXMudHMnXG5cbnR5cGUgcHJldHR5T3B0aW9ucyA9IHtcbiAgc3BhY2U6IG51bWJlclxufVxuXG5leHBvcnQgY29uc3QgcHJldHR5SlNPTiA9IChvcHRpb25zOiBwcmV0dHlPcHRpb25zID0geyBzcGFjZTogMiB9KTogTWlkZGxld2FyZUhhbmRsZXIgPT4ge1xuICByZXR1cm4gYXN5bmMgKGMsIG5leHQpID0+IHtcbiAgICBjb25zdCBwcmV0dHkgPSBjLnJlcS5xdWVyeSgncHJldHR5JykgfHwgYy5yZXEucXVlcnkoJ3ByZXR0eScpID09PSAnJyA/IHRydWUgOiBmYWxzZVxuICAgIGF3YWl0IG5leHQoKVxuICAgIGlmIChwcmV0dHkgJiYgYy5yZXMuaGVhZGVycy5nZXQoJ0NvbnRlbnQtVHlwZScpPy5zdGFydHNXaXRoKCdhcHBsaWNhdGlvbi9qc29uJykpIHtcbiAgICAgIGNvbnN0IG9iaiA9IGF3YWl0IGMucmVzLmpzb24oKVxuICAgICAgYy5yZXMgPSBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkob2JqLCBudWxsLCBvcHRpb25zLnNwYWNlKSwgYy5yZXMpXG4gICAgfVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBTUEsT0FBTyxNQUFNLGFBQWEsQ0FBQyxVQUF5QjtJQUFFLE9BQU87QUFBRSxDQUFDLEdBQXdCO0lBQ3RGLE9BQU8sT0FBTyxHQUFHLE9BQVM7UUFDeEIsTUFBTSxTQUFTLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxjQUFjLEtBQUssSUFBSSxHQUFHLEtBQUs7UUFDbkYsTUFBTTtRQUNOLElBQUksVUFBVSxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixXQUFXLHFCQUFxQjtZQUMvRSxNQUFNLE1BQU0sTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJO1lBQzVCLEVBQUUsR0FBRyxHQUFHLElBQUksU0FBUyxLQUFLLFNBQVMsQ0FBQyxLQUFLLElBQUksRUFBRSxRQUFRLEtBQUssR0FBRyxFQUFFLEdBQUc7UUFDdEUsQ0FBQztJQUNIO0FBQ0YsRUFBQyJ9