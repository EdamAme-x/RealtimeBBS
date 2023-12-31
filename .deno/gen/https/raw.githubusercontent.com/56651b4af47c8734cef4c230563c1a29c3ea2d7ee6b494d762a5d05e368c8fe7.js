import { path } from "../../deps.ts";
export function static_(dir, ext = "html") {
    return async (req, res, next)=>{
        try {
            await res.file(path.join(dir, req.url.slice(1) || "index." + ext));
        } catch (e) {
            // console.error(e)
            await next();
        }
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9OTWF0aGFyL2Rlbm8tZXhwcmVzcy9tYXN0ZXIvc3JjL2Z1bmN0aW9ucy9zdGF0aWMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtNaWRkbGV3YXJlLCBOZXh0fSBmcm9tIFwiLi4vLi4vdHlwZXMvaW5kZXgudHNcIlxuaW1wb3J0IHtwYXRofSBmcm9tIFwiLi4vLi4vZGVwcy50c1wiXG5pbXBvcnQge1JlcXVlc3R9IGZyb20gXCIuLi9SZXF1ZXN0LnRzXCJcbmltcG9ydCB7UmVzcG9uc2V9IGZyb20gXCIuLi9SZXNwb25zZS50c1wiXG5cbmV4cG9ydCBmdW5jdGlvbiBzdGF0aWNfKGRpcjogc3RyaW5nLCBleHQgPSBcImh0bWxcIik6IE1pZGRsZXdhcmUge1xuICAgIHJldHVybiBhc3luYyAocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlLCBuZXh0OiBOZXh0KSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCByZXMuZmlsZShwYXRoLmpvaW4oZGlyLCByZXEudXJsLnNsaWNlKDEpIHx8IFwiaW5kZXguXCIgKyBleHQpKVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmVycm9yKGUpXG4gICAgICAgICAgICBhd2FpdCBuZXh0KClcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxTQUFRLElBQUksUUFBTyxnQkFBZTtBQUlsQyxPQUFPLFNBQVMsUUFBUSxHQUFXLEVBQUUsTUFBTSxNQUFNLEVBQWM7SUFDM0QsT0FBTyxPQUFPLEtBQWMsS0FBZSxPQUFlO1FBQ3RELElBQUk7WUFDQSxNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sV0FBVztRQUNqRSxFQUFFLE9BQU8sR0FBRztZQUNSLG1CQUFtQjtZQUNuQixNQUFNO1FBQ1Y7SUFDSjtBQUNKLENBQUMifQ==