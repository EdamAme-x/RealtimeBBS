import { serve } from "https://deno.land/std/http/server.ts";
import { Hono } from "https://deno.land/x/hono/mod.ts";
import { serveStatic } from "https://deno.land/x/hono/middleware.ts";
// @ts-ignore
import { renderToString } from "https://esm.sh/react-dom/server";
import { Index } from "./runtime/index.tsx";
const app = new Hono();
app.get("/", (c)=>{
    const html = `<html>${renderToString(Index())}</html>`;
    return c.html(html);
});
app.get("/static/*", serveStatic({
    root: "./"
}));
app.notFound((c)=>{
    return c.html("404");
});
serve(app.fetch);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvUmVhbHRpbWVCQlMtRGVuby9zZXJ2ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgc2VydmUgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkL2h0dHAvc2VydmVyLnRzXCI7XG5pbXBvcnQgeyBIb25vIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3gvaG9uby9tb2QudHNcIjtcbmltcG9ydCB7IHNlcnZlU3RhdGljIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3gvaG9uby9taWRkbGV3YXJlLnRzXCI7XG4vLyBAdHMtaWdub3JlXG5pbXBvcnQgeyByZW5kZXJUb1N0cmluZyB9IGZyb20gXCJodHRwczovL2VzbS5zaC9yZWFjdC1kb20vc2VydmVyXCI7XG5pbXBvcnQgeyBJbmRleCB9IGZyb20gXCIuL3J1bnRpbWUvaW5kZXgudHN4XCI7XG5cbmNvbnN0IGFwcCA9IG5ldyBIb25vKCk7XG5cbmFwcC5nZXQoXCIvXCIsIChjKSA9PiB7XG4gIGNvbnN0IGh0bWwgPSBgPGh0bWw+JHtyZW5kZXJUb1N0cmluZyhJbmRleCgpIGFzIGFueSl9PC9odG1sPmA7XG4gIHJldHVybiBjLmh0bWwoaHRtbCk7XG59KTtcblxuYXBwLmdldChcbiAgXCIvc3RhdGljLypcIixcbiAgc2VydmVTdGF0aWMoXG4gICAge1xuICAgICAgcm9vdDogXCIuL1wiLFxuICAgIH0sXG4gICksXG4pO1xuXG5hcHAubm90Rm91bmQoKGMpID0+IHtcbiAgcmV0dXJuIGMuaHRtbChcIjQwNFwiKTtcbn0pO1xuXG5zZXJ2ZShhcHAuZmV0Y2gpO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsS0FBSyxRQUFRLHVDQUF1QztBQUM3RCxTQUFTLElBQUksUUFBUSxrQ0FBa0M7QUFDdkQsU0FBUyxXQUFXLFFBQVEseUNBQXlDO0FBQ3JFLGFBQWE7QUFDYixTQUFTLGNBQWMsUUFBUSxrQ0FBa0M7QUFDakUsU0FBUyxLQUFLLFFBQVEsc0JBQXNCO0FBRTVDLE1BQU0sTUFBTSxJQUFJO0FBRWhCLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFNO0lBQ2xCLE1BQU0sT0FBTyxDQUFDLE1BQU0sRUFBRSxlQUFlLFNBQWdCLE9BQU8sQ0FBQztJQUM3RCxPQUFPLEVBQUUsSUFBSSxDQUFDO0FBQ2hCO0FBRUEsSUFBSSxHQUFHLENBQ0wsYUFDQSxZQUNFO0lBQ0UsTUFBTTtBQUNSO0FBSUosSUFBSSxRQUFRLENBQUMsQ0FBQyxJQUFNO0lBQ2xCLE9BQU8sRUFBRSxJQUFJLENBQUM7QUFDaEI7QUFFQSxNQUFNLElBQUksS0FBSyJ9