const isArrayField = (value)=>{
    return Array.isArray(value);
};
export const parseBody = async (request, options = {
    all: false
})=>{
    let body = {};
    const contentType = request.headers.get('Content-Type');
    if (contentType && (contentType.startsWith('multipart/form-data') || contentType.startsWith('application/x-www-form-urlencoded'))) {
        const formData = await request.formData();
        if (formData) {
            const form = {};
            formData.forEach((value, key)=>{
                const shouldParseAllValues = options.all || key.slice(-2) === '[]';
                if (!shouldParseAllValues) {
                    form[key] = value // override if same key
                    ;
                    return;
                }
                if (form[key] && isArrayField(form[key])) {
                    form[key].push(value) // append if same key
                    ;
                    return;
                }
                if (form[key]) {
                    form[key] = [
                        form[key],
                        value
                    ] // convert to array if multiple values
                    ;
                    return;
                }
                form[key] = value;
            });
            body = form;
        }
    }
    return body;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvdXRpbHMvYm9keS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEhvbm9SZXF1ZXN0IH0gZnJvbSAnLi4vcmVxdWVzdC50cydcblxuZXhwb3J0IHR5cGUgQm9keURhdGEgPSBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCBGaWxlIHwgKHN0cmluZyB8IEZpbGUpW10+XG5leHBvcnQgdHlwZSBQYXJzZUJvZHlPcHRpb25zID0ge1xuICAvKipcbiAgICogUGFyc2UgYWxsIGZpZWxkcyB3aXRoIG11bHRpcGxlIHZhbHVlcyBzaG91bGQgYmUgcGFyc2VkIGFzIGFuIGFycmF5LlxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKiBAZXhhbXBsZVxuICAgKiBgYGB0c1xuICAgKiBjb25zdCBkYXRhID0gbmV3IEZvcm1EYXRhKClcbiAgICogZGF0YS5hcHBlbmQoJ2ZpbGUnLCAnYWFhJylcbiAgICogZGF0YS5hcHBlbmQoJ2ZpbGUnLCAnYmJiJylcbiAgICogZGF0YS5hcHBlbmQoJ21lc3NhZ2UnLCAnaGVsbG8nKVxuICAgKiBgYGBcbiAgICpcbiAgICogSWYgYGFsbGAgaXMgYGZhbHNlYDpcbiAgICogcGFyc2VCb2R5IHNob3VsZCByZXR1cm4gYHsgZmlsZTogJ2JiYicsIG1lc3NhZ2U6ICdoZWxsbycgfWBcbiAgICpcbiAgICogSWYgYGFsbGAgaXMgYHRydWVgOlxuICAgKiBwYXJzZUJvZHkgc2hvdWxkIHJldHVybiBgeyBmaWxlOiBbJ2FhYScsICdiYmInXSwgbWVzc2FnZTogJ2hlbGxvJyB9YFxuICAgKi9cbiAgYWxsPzogYm9vbGVhblxufVxuXG5jb25zdCBpc0FycmF5RmllbGQgPSAodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyAoc3RyaW5nIHwgRmlsZSlbXSA9PiB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KHZhbHVlKVxufVxuXG5leHBvcnQgY29uc3QgcGFyc2VCb2R5ID0gYXN5bmMgPFQgZXh0ZW5kcyBCb2R5RGF0YSA9IEJvZHlEYXRhPihcbiAgcmVxdWVzdDogSG9ub1JlcXVlc3QgfCBSZXF1ZXN0LFxuICBvcHRpb25zOiBQYXJzZUJvZHlPcHRpb25zID0ge1xuICAgIGFsbDogZmFsc2UsXG4gIH1cbik6IFByb21pc2U8VD4gPT4ge1xuICBsZXQgYm9keTogQm9keURhdGEgPSB7fVxuICBjb25zdCBjb250ZW50VHlwZSA9IHJlcXVlc3QuaGVhZGVycy5nZXQoJ0NvbnRlbnQtVHlwZScpXG5cbiAgaWYgKFxuICAgIGNvbnRlbnRUeXBlICYmXG4gICAgKGNvbnRlbnRUeXBlLnN0YXJ0c1dpdGgoJ211bHRpcGFydC9mb3JtLWRhdGEnKSB8fFxuICAgICAgY29udGVudFR5cGUuc3RhcnRzV2l0aCgnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJykpXG4gICkge1xuICAgIGNvbnN0IGZvcm1EYXRhID0gYXdhaXQgcmVxdWVzdC5mb3JtRGF0YSgpXG4gICAgaWYgKGZvcm1EYXRhKSB7XG4gICAgICBjb25zdCBmb3JtOiBCb2R5RGF0YSA9IHt9XG4gICAgICBmb3JtRGF0YS5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgIGNvbnN0IHNob3VsZFBhcnNlQWxsVmFsdWVzID0gb3B0aW9ucy5hbGwgfHwga2V5LnNsaWNlKC0yKSA9PT0gJ1tdJ1xuXG4gICAgICAgIGlmICghc2hvdWxkUGFyc2VBbGxWYWx1ZXMpIHtcbiAgICAgICAgICBmb3JtW2tleV0gPSB2YWx1ZSAvLyBvdmVycmlkZSBpZiBzYW1lIGtleVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZvcm1ba2V5XSAmJiBpc0FycmF5RmllbGQoZm9ybVtrZXldKSkge1xuICAgICAgICAgIDsoZm9ybVtrZXldIGFzIChzdHJpbmcgfCBGaWxlKVtdKS5wdXNoKHZhbHVlKSAvLyBhcHBlbmQgaWYgc2FtZSBrZXlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmb3JtW2tleV0pIHtcbiAgICAgICAgICBmb3JtW2tleV0gPSBbZm9ybVtrZXldIGFzIHN0cmluZyB8IEZpbGUsIHZhbHVlXSAvLyBjb252ZXJ0IHRvIGFycmF5IGlmIG11bHRpcGxlIHZhbHVlc1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgZm9ybVtrZXldID0gdmFsdWVcbiAgICAgIH0pXG4gICAgICBib2R5ID0gZm9ybVxuICAgIH1cbiAgfVxuICByZXR1cm4gYm9keSBhcyBUXG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBd0JBLE1BQU0sZUFBZSxDQUFDLFFBQStDO0lBQ25FLE9BQU8sTUFBTSxPQUFPLENBQUM7QUFDdkI7QUFFQSxPQUFPLE1BQU0sWUFBWSxPQUN2QixTQUNBLFVBQTRCO0lBQzFCLEtBQUssS0FBSztBQUNaLENBQUMsR0FDYztJQUNmLElBQUksT0FBaUIsQ0FBQztJQUN0QixNQUFNLGNBQWMsUUFBUSxPQUFPLENBQUMsR0FBRyxDQUFDO0lBRXhDLElBQ0UsZUFDQSxDQUFDLFlBQVksVUFBVSxDQUFDLDBCQUN0QixZQUFZLFVBQVUsQ0FBQyxvQ0FBb0MsR0FDN0Q7UUFDQSxNQUFNLFdBQVcsTUFBTSxRQUFRLFFBQVE7UUFDdkMsSUFBSSxVQUFVO1lBQ1osTUFBTSxPQUFpQixDQUFDO1lBQ3hCLFNBQVMsT0FBTyxDQUFDLENBQUMsT0FBTyxNQUFRO2dCQUMvQixNQUFNLHVCQUF1QixRQUFRLEdBQUcsSUFBSSxJQUFJLEtBQUssQ0FBQyxDQUFDLE9BQU87Z0JBRTlELElBQUksQ0FBQyxzQkFBc0I7b0JBQ3pCLElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSx1QkFBdUI7O29CQUN6QztnQkFDRixDQUFDO2dCQUVELElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxhQUFhLElBQUksQ0FBQyxJQUFJLEdBQUc7b0JBQ3RDLElBQUksQ0FBQyxJQUFJLENBQXVCLElBQUksQ0FBQyxPQUFPLHFCQUFxQjs7b0JBQ25FO2dCQUNGLENBQUM7Z0JBRUQsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO29CQUNiLElBQUksQ0FBQyxJQUFJLEdBQUc7d0JBQUMsSUFBSSxDQUFDLElBQUk7d0JBQW1CO3FCQUFNLENBQUMsc0NBQXNDOztvQkFDdEY7Z0JBQ0YsQ0FBQztnQkFFRCxJQUFJLENBQUMsSUFBSSxHQUFHO1lBQ2Q7WUFDQSxPQUFPO1FBQ1QsQ0FBQztJQUNILENBQUM7SUFDRCxPQUFPO0FBQ1QsRUFBQyJ9