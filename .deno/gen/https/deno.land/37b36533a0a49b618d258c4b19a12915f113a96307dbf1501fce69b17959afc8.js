// The `escapeToBuffer` implementation is based on code from the MIT licensed `react-dom` package.
// https://github.com/facebook/react/blob/main/packages/react-dom-bindings/src/server/escapeTextForBrowser.js
const escapeRe = /[&<>'"]/;
export const escapeToBuffer = (str, buffer)=>{
    const match = str.search(escapeRe);
    if (match === -1) {
        buffer[0] += str;
        return;
    }
    let escape;
    let index;
    let lastIndex = 0;
    for(index = match; index < str.length; index++){
        switch(str.charCodeAt(index)){
            case 34:
                escape = '&quot;';
                break;
            case 39:
                escape = '&#39;';
                break;
            case 38:
                escape = '&amp;';
                break;
            case 60:
                escape = '&lt;';
                break;
            case 62:
                escape = '&gt;';
                break;
            default:
                continue;
        }
        buffer[0] += str.substring(lastIndex, index) + escape;
        lastIndex = index + 1;
    }
    buffer[0] += str.substring(lastIndex, index);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvdXRpbHMvaHRtbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgdHlwZSBIdG1sRXNjYXBlZCA9IHsgaXNFc2NhcGVkOiB0cnVlIH1cbmV4cG9ydCB0eXBlIEh0bWxFc2NhcGVkU3RyaW5nID0gc3RyaW5nICYgSHRtbEVzY2FwZWRcbmV4cG9ydCB0eXBlIFN0cmluZ0J1ZmZlciA9IFtzdHJpbmddXG5cbi8vIFRoZSBgZXNjYXBlVG9CdWZmZXJgIGltcGxlbWVudGF0aW9uIGlzIGJhc2VkIG9uIGNvZGUgZnJvbSB0aGUgTUlUIGxpY2Vuc2VkIGByZWFjdC1kb21gIHBhY2thZ2UuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svcmVhY3QvYmxvYi9tYWluL3BhY2thZ2VzL3JlYWN0LWRvbS1iaW5kaW5ncy9zcmMvc2VydmVyL2VzY2FwZVRleHRGb3JCcm93c2VyLmpzXG5cbmNvbnN0IGVzY2FwZVJlID0gL1smPD4nXCJdL1xuXG5leHBvcnQgY29uc3QgZXNjYXBlVG9CdWZmZXIgPSAoc3RyOiBzdHJpbmcsIGJ1ZmZlcjogU3RyaW5nQnVmZmVyKTogdm9pZCA9PiB7XG4gIGNvbnN0IG1hdGNoID0gc3RyLnNlYXJjaChlc2NhcGVSZSlcbiAgaWYgKG1hdGNoID09PSAtMSkge1xuICAgIGJ1ZmZlclswXSArPSBzdHJcbiAgICByZXR1cm5cbiAgfVxuXG4gIGxldCBlc2NhcGVcbiAgbGV0IGluZGV4XG4gIGxldCBsYXN0SW5kZXggPSAwXG5cbiAgZm9yIChpbmRleCA9IG1hdGNoOyBpbmRleCA8IHN0ci5sZW5ndGg7IGluZGV4KyspIHtcbiAgICBzd2l0Y2ggKHN0ci5jaGFyQ29kZUF0KGluZGV4KSkge1xuICAgICAgY2FzZSAzNDogLy8gXCJcbiAgICAgICAgZXNjYXBlID0gJyZxdW90OydcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgMzk6IC8vICdcbiAgICAgICAgZXNjYXBlID0gJyYjMzk7J1xuICAgICAgICBicmVha1xuICAgICAgY2FzZSAzODogLy8gJlxuICAgICAgICBlc2NhcGUgPSAnJmFtcDsnXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIDYwOiAvLyA8XG4gICAgICAgIGVzY2FwZSA9ICcmbHQ7J1xuICAgICAgICBicmVha1xuICAgICAgY2FzZSA2MjogLy8gPlxuICAgICAgICBlc2NhcGUgPSAnJmd0OydcbiAgICAgICAgYnJlYWtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNvbnRpbnVlXG4gICAgfVxuXG4gICAgYnVmZmVyWzBdICs9IHN0ci5zdWJzdHJpbmcobGFzdEluZGV4LCBpbmRleCkgKyBlc2NhcGVcbiAgICBsYXN0SW5kZXggPSBpbmRleCArIDFcbiAgfVxuXG4gIGJ1ZmZlclswXSArPSBzdHIuc3Vic3RyaW5nKGxhc3RJbmRleCwgaW5kZXgpXG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUEsa0dBQWtHO0FBQ2xHLDZHQUE2RztBQUU3RyxNQUFNLFdBQVc7QUFFakIsT0FBTyxNQUFNLGlCQUFpQixDQUFDLEtBQWEsU0FBK0I7SUFDekUsTUFBTSxRQUFRLElBQUksTUFBTSxDQUFDO0lBQ3pCLElBQUksVUFBVSxDQUFDLEdBQUc7UUFDaEIsTUFBTSxDQUFDLEVBQUUsSUFBSTtRQUNiO0lBQ0YsQ0FBQztJQUVELElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSSxZQUFZO0lBRWhCLElBQUssUUFBUSxPQUFPLFFBQVEsSUFBSSxNQUFNLEVBQUUsUUFBUztRQUMvQyxPQUFRLElBQUksVUFBVSxDQUFDO1lBQ3JCLEtBQUs7Z0JBQ0gsU0FBUztnQkFDVCxLQUFLO1lBQ1AsS0FBSztnQkFDSCxTQUFTO2dCQUNULEtBQUs7WUFDUCxLQUFLO2dCQUNILFNBQVM7Z0JBQ1QsS0FBSztZQUNQLEtBQUs7Z0JBQ0gsU0FBUztnQkFDVCxLQUFLO1lBQ1AsS0FBSztnQkFDSCxTQUFTO2dCQUNULEtBQUs7WUFDUDtnQkFDRSxRQUFRO1FBQ1o7UUFFQSxNQUFNLENBQUMsRUFBRSxJQUFJLElBQUksU0FBUyxDQUFDLFdBQVcsU0FBUztRQUMvQyxZQUFZLFFBQVE7SUFDdEI7SUFFQSxNQUFNLENBQUMsRUFBRSxJQUFJLElBQUksU0FBUyxDQUFDLFdBQVc7QUFDeEMsRUFBQyJ9