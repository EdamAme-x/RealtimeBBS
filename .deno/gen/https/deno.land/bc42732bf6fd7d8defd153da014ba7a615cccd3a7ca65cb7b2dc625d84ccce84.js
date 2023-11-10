import { escapeToBuffer } from '../../utils/html.ts';
export const raw = (value)=>{
    const escapedString = new String(value);
    escapedString.isEscaped = true;
    return escapedString;
};
export const html = (strings, ...values)=>{
    const buffer = [
        ''
    ];
    for(let i = 0, len = strings.length - 1; i < len; i++){
        buffer[0] += strings[i];
        const children = values[i] instanceof Array ? values[i].flat(Infinity) : [
            values[i]
        ];
        for(let i = 0, len = children.length; i < len; i++){
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const child = children[i];
            if (typeof child === 'string') {
                escapeToBuffer(child, buffer);
            } else if (typeof child === 'boolean' || child === null || child === undefined) {
                continue;
            } else if (typeof child === 'object' && child.isEscaped || typeof child === 'number') {
                buffer[0] += child;
            } else {
                escapeToBuffer(child.toString(), buffer);
            }
        }
    }
    buffer[0] += strings[strings.length - 1];
    return raw(buffer[0]);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvaGVscGVyL2h0bWwvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZXNjYXBlVG9CdWZmZXIgfSBmcm9tICcuLi8uLi91dGlscy9odG1sLnRzJ1xuaW1wb3J0IHR5cGUgeyBTdHJpbmdCdWZmZXIsIEh0bWxFc2NhcGVkLCBIdG1sRXNjYXBlZFN0cmluZyB9IGZyb20gJy4uLy4uL3V0aWxzL2h0bWwudHMnXG5cbmV4cG9ydCBjb25zdCByYXcgPSAodmFsdWU6IHVua25vd24pOiBIdG1sRXNjYXBlZFN0cmluZyA9PiB7XG4gIGNvbnN0IGVzY2FwZWRTdHJpbmcgPSBuZXcgU3RyaW5nKHZhbHVlKSBhcyBIdG1sRXNjYXBlZFN0cmluZ1xuICBlc2NhcGVkU3RyaW5nLmlzRXNjYXBlZCA9IHRydWVcblxuICByZXR1cm4gZXNjYXBlZFN0cmluZ1xufVxuXG5leHBvcnQgY29uc3QgaHRtbCA9IChzdHJpbmdzOiBUZW1wbGF0ZVN0cmluZ3NBcnJheSwgLi4udmFsdWVzOiB1bmtub3duW10pOiBIdG1sRXNjYXBlZFN0cmluZyA9PiB7XG4gIGNvbnN0IGJ1ZmZlcjogU3RyaW5nQnVmZmVyID0gWycnXVxuXG4gIGZvciAobGV0IGkgPSAwLCBsZW4gPSBzdHJpbmdzLmxlbmd0aCAtIDE7IGkgPCBsZW47IGkrKykge1xuICAgIGJ1ZmZlclswXSArPSBzdHJpbmdzW2ldXG5cbiAgICBjb25zdCBjaGlsZHJlbiA9XG4gICAgICB2YWx1ZXNbaV0gaW5zdGFuY2VvZiBBcnJheSA/ICh2YWx1ZXNbaV0gYXMgQXJyYXk8dW5rbm93bj4pLmZsYXQoSW5maW5pdHkpIDogW3ZhbHVlc1tpXV1cbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuW2ldIGFzIGFueVxuICAgICAgaWYgKHR5cGVvZiBjaGlsZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgZXNjYXBlVG9CdWZmZXIoY2hpbGQsIGJ1ZmZlcilcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGNoaWxkID09PSAnYm9vbGVhbicgfHwgY2hpbGQgPT09IG51bGwgfHwgY2hpbGQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgKHR5cGVvZiBjaGlsZCA9PT0gJ29iamVjdCcgJiYgKGNoaWxkIGFzIEh0bWxFc2NhcGVkKS5pc0VzY2FwZWQpIHx8XG4gICAgICAgIHR5cGVvZiBjaGlsZCA9PT0gJ251bWJlcidcbiAgICAgICkge1xuICAgICAgICBidWZmZXJbMF0gKz0gY2hpbGRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVzY2FwZVRvQnVmZmVyKGNoaWxkLnRvU3RyaW5nKCksIGJ1ZmZlcilcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgYnVmZmVyWzBdICs9IHN0cmluZ3Nbc3RyaW5ncy5sZW5ndGggLSAxXVxuXG4gIHJldHVybiByYXcoYnVmZmVyWzBdKVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsY0FBYyxRQUFRLHNCQUFxQjtBQUdwRCxPQUFPLE1BQU0sTUFBTSxDQUFDLFFBQXNDO0lBQ3hELE1BQU0sZ0JBQWdCLElBQUksT0FBTztJQUNqQyxjQUFjLFNBQVMsR0FBRyxJQUFJO0lBRTlCLE9BQU87QUFDVCxFQUFDO0FBRUQsT0FBTyxNQUFNLE9BQU8sQ0FBQyxTQUErQixHQUFHLFNBQXlDO0lBQzlGLE1BQU0sU0FBdUI7UUFBQztLQUFHO0lBRWpDLElBQUssSUFBSSxJQUFJLEdBQUcsTUFBTSxRQUFRLE1BQU0sR0FBRyxHQUFHLElBQUksS0FBSyxJQUFLO1FBQ3RELE1BQU0sQ0FBQyxFQUFFLElBQUksT0FBTyxDQUFDLEVBQUU7UUFFdkIsTUFBTSxXQUNKLE1BQU0sQ0FBQyxFQUFFLFlBQVksUUFBUSxBQUFDLE1BQU0sQ0FBQyxFQUFFLENBQW9CLElBQUksQ0FBQyxZQUFZO1lBQUMsTUFBTSxDQUFDLEVBQUU7U0FBQztRQUN6RixJQUFLLElBQUksSUFBSSxHQUFHLE1BQU0sU0FBUyxNQUFNLEVBQUUsSUFBSSxLQUFLLElBQUs7WUFDbkQsOERBQThEO1lBQzlELE1BQU0sUUFBUSxRQUFRLENBQUMsRUFBRTtZQUN6QixJQUFJLE9BQU8sVUFBVSxVQUFVO2dCQUM3QixlQUFlLE9BQU87WUFDeEIsT0FBTyxJQUFJLE9BQU8sVUFBVSxhQUFhLFVBQVUsSUFBSSxJQUFJLFVBQVUsV0FBVztnQkFDOUUsUUFBUTtZQUNWLE9BQU8sSUFDTCxBQUFDLE9BQU8sVUFBVSxZQUFZLEFBQUMsTUFBc0IsU0FBUyxJQUM5RCxPQUFPLFVBQVUsVUFDakI7Z0JBQ0EsTUFBTSxDQUFDLEVBQUUsSUFBSTtZQUNmLE9BQU87Z0JBQ0wsZUFBZSxNQUFNLFFBQVEsSUFBSTtZQUNuQyxDQUFDO1FBQ0g7SUFDRjtJQUNBLE1BQU0sQ0FBQyxFQUFFLElBQUksT0FBTyxDQUFDLFFBQVEsTUFBTSxHQUFHLEVBQUU7SUFFeEMsT0FBTyxJQUFJLE1BQU0sQ0FBQyxFQUFFO0FBQ3RCLEVBQUMifQ==