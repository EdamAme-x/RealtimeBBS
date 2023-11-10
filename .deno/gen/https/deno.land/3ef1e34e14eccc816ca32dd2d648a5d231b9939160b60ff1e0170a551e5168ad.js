import { getFilePath } from '../../utils/filepath.ts';
import { getMimeType } from '../../utils/mime.ts';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const { open  } = Deno;
const DEFAULT_DOCUMENT = 'index.html';
export const serveStatic = (options = {
    root: ''
})=>{
    return async (c, next)=>{
        // Do nothing if Response is already set
        if (c.finalized) {
            await next();
            return;
        }
        const url = new URL(c.req.url);
        const filename = options.path ?? decodeURI(url.pathname);
        let path = getFilePath({
            filename: options.rewriteRequestPath ? options.rewriteRequestPath(filename) : filename,
            root: options.root,
            defaultDocument: DEFAULT_DOCUMENT
        });
        if (!path) return await next();
        path = `./${path}`;
        let file;
        try {
            file = await open(path);
        } catch (e) {
            console.warn(`${e}`);
        }
        if (file) {
            const mimeType = getMimeType(path);
            if (mimeType) {
                c.header('Content-Type', mimeType);
            }
            // Return Response object with stream
            return c.body(file.readable);
        } else {
            console.warn(`Static file: ${path} is not found`);
            await next();
        }
        return;
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvYWRhcHRlci9kZW5vL3NlcnZlLXN0YXRpYy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IENvbnRleHQgfSBmcm9tICcuLi8uLi9jb250ZXh0LnRzJ1xuaW1wb3J0IHR5cGUgeyBOZXh0IH0gZnJvbSAnLi4vLi4vdHlwZXMudHMnXG5pbXBvcnQgeyBnZXRGaWxlUGF0aCB9IGZyb20gJy4uLy4uL3V0aWxzL2ZpbGVwYXRoLnRzJ1xuaW1wb3J0IHsgZ2V0TWltZVR5cGUgfSBmcm9tICcuLi8uLi91dGlscy9taW1lLnRzJ1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4vLyBAdHMtaWdub3JlXG5jb25zdCB7IG9wZW4gfSA9IERlbm9cblxuZXhwb3J0IHR5cGUgU2VydmVTdGF0aWNPcHRpb25zID0ge1xuICByb290Pzogc3RyaW5nXG4gIHBhdGg/OiBzdHJpbmdcbiAgcmV3cml0ZVJlcXVlc3RQYXRoPzogKHBhdGg6IHN0cmluZykgPT4gc3RyaW5nXG59XG5cbmNvbnN0IERFRkFVTFRfRE9DVU1FTlQgPSAnaW5kZXguaHRtbCdcblxuZXhwb3J0IGNvbnN0IHNlcnZlU3RhdGljID0gKG9wdGlvbnM6IFNlcnZlU3RhdGljT3B0aW9ucyA9IHsgcm9vdDogJycgfSkgPT4ge1xuICByZXR1cm4gYXN5bmMgKGM6IENvbnRleHQsIG5leHQ6IE5leHQpID0+IHtcbiAgICAvLyBEbyBub3RoaW5nIGlmIFJlc3BvbnNlIGlzIGFscmVhZHkgc2V0XG4gICAgaWYgKGMuZmluYWxpemVkKSB7XG4gICAgICBhd2FpdCBuZXh0KClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IHVybCA9IG5ldyBVUkwoYy5yZXEudXJsKVxuICAgIGNvbnN0IGZpbGVuYW1lID0gb3B0aW9ucy5wYXRoID8/IGRlY29kZVVSSSh1cmwucGF0aG5hbWUpXG4gICAgbGV0IHBhdGggPSBnZXRGaWxlUGF0aCh7XG4gICAgICBmaWxlbmFtZTogb3B0aW9ucy5yZXdyaXRlUmVxdWVzdFBhdGggPyBvcHRpb25zLnJld3JpdGVSZXF1ZXN0UGF0aChmaWxlbmFtZSkgOiBmaWxlbmFtZSxcbiAgICAgIHJvb3Q6IG9wdGlvbnMucm9vdCxcbiAgICAgIGRlZmF1bHREb2N1bWVudDogREVGQVVMVF9ET0NVTUVOVCxcbiAgICB9KVxuXG4gICAgaWYgKCFwYXRoKSByZXR1cm4gYXdhaXQgbmV4dCgpXG5cbiAgICBwYXRoID0gYC4vJHtwYXRofWBcblxuICAgIGxldCBmaWxlXG5cbiAgICB0cnkge1xuICAgICAgZmlsZSA9IGF3YWl0IG9wZW4ocGF0aClcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLndhcm4oYCR7ZX1gKVxuICAgIH1cblxuICAgIGlmIChmaWxlKSB7XG4gICAgICBjb25zdCBtaW1lVHlwZSA9IGdldE1pbWVUeXBlKHBhdGgpXG4gICAgICBpZiAobWltZVR5cGUpIHtcbiAgICAgICAgYy5oZWFkZXIoJ0NvbnRlbnQtVHlwZScsIG1pbWVUeXBlKVxuICAgICAgfVxuICAgICAgLy8gUmV0dXJuIFJlc3BvbnNlIG9iamVjdCB3aXRoIHN0cmVhbVxuICAgICAgcmV0dXJuIGMuYm9keShmaWxlLnJlYWRhYmxlKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oYFN0YXRpYyBmaWxlOiAke3BhdGh9IGlzIG5vdCBmb3VuZGApXG4gICAgICBhd2FpdCBuZXh0KClcbiAgICB9XG4gICAgcmV0dXJuXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxTQUFTLFdBQVcsUUFBUSwwQkFBeUI7QUFDckQsU0FBUyxXQUFXLFFBQVEsc0JBQXFCO0FBRWpELDZEQUE2RDtBQUM3RCxhQUFhO0FBQ2IsTUFBTSxFQUFFLEtBQUksRUFBRSxHQUFHO0FBUWpCLE1BQU0sbUJBQW1CO0FBRXpCLE9BQU8sTUFBTSxjQUFjLENBQUMsVUFBOEI7SUFBRSxNQUFNO0FBQUcsQ0FBQyxHQUFLO0lBQ3pFLE9BQU8sT0FBTyxHQUFZLE9BQWU7UUFDdkMsd0NBQXdDO1FBQ3hDLElBQUksRUFBRSxTQUFTLEVBQUU7WUFDZixNQUFNO1lBQ047UUFDRixDQUFDO1FBRUQsTUFBTSxNQUFNLElBQUksSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHO1FBQzdCLE1BQU0sV0FBVyxRQUFRLElBQUksSUFBSSxVQUFVLElBQUksUUFBUTtRQUN2RCxJQUFJLE9BQU8sWUFBWTtZQUNyQixVQUFVLFFBQVEsa0JBQWtCLEdBQUcsUUFBUSxrQkFBa0IsQ0FBQyxZQUFZLFFBQVE7WUFDdEYsTUFBTSxRQUFRLElBQUk7WUFDbEIsaUJBQWlCO1FBQ25CO1FBRUEsSUFBSSxDQUFDLE1BQU0sT0FBTyxNQUFNO1FBRXhCLE9BQU8sQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDO1FBRWxCLElBQUk7UUFFSixJQUFJO1lBQ0YsT0FBTyxNQUFNLEtBQUs7UUFDcEIsRUFBRSxPQUFPLEdBQUc7WUFDVixRQUFRLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ3JCO1FBRUEsSUFBSSxNQUFNO1lBQ1IsTUFBTSxXQUFXLFlBQVk7WUFDN0IsSUFBSSxVQUFVO2dCQUNaLEVBQUUsTUFBTSxDQUFDLGdCQUFnQjtZQUMzQixDQUFDO1lBQ0QscUNBQXFDO1lBQ3JDLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxRQUFRO1FBQzdCLE9BQU87WUFDTCxRQUFRLElBQUksQ0FBQyxDQUFDLGFBQWEsRUFBRSxLQUFLLGFBQWEsQ0FBQztZQUNoRCxNQUFNO1FBQ1IsQ0FBQztRQUNEO0lBQ0Y7QUFDRixFQUFDIn0=