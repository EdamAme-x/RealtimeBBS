import React from 'https://esm.sh/react';
import { Header } from "./components/header.tsx";
import { Footer } from "./components/footer.tsx";
// ------------------ //
//    By @amex2189    //
// ------------------ //
export function Layout(props) {
    const title = props.title ?? "RealtimeBBS";
    const description = props.description ?? "リアルタイムで更新されるブラウザリロード不要の2ch風BBS / RealtimeBBS";
    const icon = props.icon ?? "/static/favicon.png";
    const url = "https://realtime-bbs.deno.dev";
    return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement("head", {
        lang: "ja",
        prefix: "og: http://ogp.me/ns# website: http://ogp.me/ns/website#"
    }, /*#__PURE__*/ React.createElement("link", {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossorigin: true
    }), /*#__PURE__*/ React.createElement("meta", {
        charset: "utf-8"
    }), /*#__PURE__*/ React.createElement("title", null, title), /*#__PURE__*/ React.createElement("meta", {
        name: "description",
        content: description
    }), /*#__PURE__*/ React.createElement("base", {
        href: "/"
    }), /*#__PURE__*/ React.createElement("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
    }), /*#__PURE__*/ React.createElement("link", {
        rel: "icon",
        type: "image/x-icon",
        href: icon
    }), /*#__PURE__*/ React.createElement("meta", {
        name: "runtime",
        content: "RealtimeBBS / Hono / Deno"
    }), /*#__PURE__*/ React.createElement("meta", {
        property: "og:type",
        content: "website"
    }), /*#__PURE__*/ React.createElement("meta", {
        property: "og:title",
        content: title
    }), /*#__PURE__*/ React.createElement("meta", {
        property: "og:description",
        content: description
    }), /*#__PURE__*/ React.createElement("meta", {
        property: "og:site_name",
        content: title
    }), /*#__PURE__*/ React.createElement("meta", {
        property: "og:url",
        content: url
    }), /*#__PURE__*/ React.createElement("meta", {
        property: "og:image",
        content: url + icon
    }), /*#__PURE__*/ React.createElement("meta", {
        property: "og:image:width",
        content: "1280"
    }), /*#__PURE__*/ React.createElement("meta", {
        property: "og:image:height",
        content: "720"
    }), /*#__PURE__*/ React.createElement("meta", {
        property: "og:locale",
        content: "ja_JP"
    }), /*#__PURE__*/ React.createElement("meta", {
        name: "twitter:card",
        content: "summary"
    }), /*#__PURE__*/ React.createElement("meta", {
        name: "twitter:title",
        content: title
    }), /*#__PURE__*/ React.createElement("meta", {
        name: "twitter:description",
        content: description
    }), /*#__PURE__*/ React.createElement("meta", {
        name: "twitter:image",
        content: url + icon
    }), /*#__PURE__*/ React.createElement("meta", {
        name: "twitter:creator",
        content: "@amex2189"
    }), /*#__PURE__*/ React.createElement("link", {
        rel: "stylesheet",
        href: "/static/styles.css"
    }), /*#__PURE__*/ React.createElement("script", {
        src: "/static/functions.js",
        async: true
    }), /*#__PURE__*/ React.createElement("script", {
        type: "module",
        src: "https://cdn.skypack.dev/twind/shim",
        async: true
    })), /*#__PURE__*/ React.createElement("body", {
        className: "bg-gray-300",
        style: {
            backgroundImage: "url(/static/BBS-BG.png)",
            backgroundSize: "cover"
        }
    }, /*#__PURE__*/ React.createElement(Header, null), /*#__PURE__*/ React.createElement("div", {
        className: "contents"
    }, props.children), /*#__PURE__*/ React.createElement(Footer, null), /*#__PURE__*/ React.createElement("script", {
        id: "__RTBBS_DATA__",
        type: "application/json"
    }, JSON.stringify(props.data ?? {}))));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvUmVhbHRpbWVCQlMtRGVuby9ydW50aW1lL2xheW91dC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ2h0dHBzOi8vZXNtLnNoL3JlYWN0JztcbmltcG9ydCB7IEhlYWRlciB9IGZyb20gXCIuL2NvbXBvbmVudHMvaGVhZGVyLnRzeFwiXG5pbXBvcnQgeyBGb290ZXIgfSBmcm9tIFwiLi9jb21wb25lbnRzL2Zvb3Rlci50c3hcIlxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0gLy9cbi8vICAgIEJ5IEBhbWV4MjE4OSAgICAvL1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbmV4cG9ydCBmdW5jdGlvbiBMYXlvdXQocHJvcHMpIHtcblxuICBjb25zdCB0aXRsZSA9IHByb3BzLnRpdGxlID8/IFwiUmVhbHRpbWVCQlNcIjtcbiAgY29uc3QgZGVzY3JpcHRpb24gPSBwcm9wcy5kZXNjcmlwdGlvbiA/PyBcIuODquOCouODq+OCv+OCpOODoOOBp+abtOaWsOOBleOCjOOCi+ODluODqeOCpuOCtuODquODreODvOODieS4jeimgeOBrjJjaOmiqEJCUyAvIFJlYWx0aW1lQkJTXCI7XG4gIGNvbnN0IGljb24gPSBwcm9wcy5pY29uID8/IFwiL3N0YXRpYy9mYXZpY29uLnBuZ1wiO1xuICBjb25zdCB1cmwgPSBcImh0dHBzOi8vcmVhbHRpbWUtYmJzLmRlbm8uZGV2XCI7XG4gIFxuICByZXR1cm4gPD5cbiAgICA8aGVhZCBsYW5nPVwiamFcIiBwcmVmaXg9XCJvZzogaHR0cDovL29ncC5tZS9ucyMgd2Vic2l0ZTogaHR0cDovL29ncC5tZS9ucy93ZWJzaXRlI1wiPlxuICAgICAgPGxpbmsgcmVsPVwicHJlY29ubmVjdFwiIGhyZWY9XCJodHRwczovL2ZvbnRzLmdzdGF0aWMuY29tXCIgY3Jvc3NvcmlnaW4gLz5cbiAgICAgIDxtZXRhIGNoYXJzZXQ9XCJ1dGYtOFwiIC8+XG4gICAgICA8dGl0bGU+e3RpdGxlfTwvdGl0bGU+XG4gICAgICA8bWV0YSBuYW1lPVwiZGVzY3JpcHRpb25cIiBjb250ZW50PXtkZXNjcmlwdGlvbn0gLz5cbiAgICAgIDxiYXNlIGhyZWY9XCIvXCIgLz5cbiAgICAgIDxtZXRhIG5hbWU9XCJ2aWV3cG9ydFwiIGNvbnRlbnQ9XCJ3aWR0aD1kZXZpY2Utd2lkdGgsIGluaXRpYWwtc2NhbGU9MVwiIC8+XG4gICAgICA8bGluayByZWw9XCJpY29uXCIgdHlwZT1cImltYWdlL3gtaWNvblwiIGhyZWY9e2ljb259IC8+XG4gICAgICA8bWV0YSBuYW1lPVwicnVudGltZVwiIGNvbnRlbnQ9XCJSZWFsdGltZUJCUyAvIEhvbm8gLyBEZW5vXCIgLz5cbiAgICAgIDxtZXRhIHByb3BlcnR5PVwib2c6dHlwZVwiIGNvbnRlbnQ9XCJ3ZWJzaXRlXCIgLz5cbiAgICAgIDxtZXRhIHByb3BlcnR5PVwib2c6dGl0bGVcIiBjb250ZW50PXt0aXRsZX0gLz5cbiAgICAgIDxtZXRhIHByb3BlcnR5PVwib2c6ZGVzY3JpcHRpb25cIiBjb250ZW50PXtkZXNjcmlwdGlvbn0gLz5cbiAgICAgIDxtZXRhIHByb3BlcnR5PVwib2c6c2l0ZV9uYW1lXCIgY29udGVudD17dGl0bGV9IC8+XG4gICAgICA8bWV0YSBwcm9wZXJ0eT1cIm9nOnVybFwiIGNvbnRlbnQ9e3VybH0gLz5cbiAgICAgIDxtZXRhIHByb3BlcnR5PVwib2c6aW1hZ2VcIiBjb250ZW50PXt1cmwgKyBpY29ufSAvPlxuICAgICAgPG1ldGEgcHJvcGVydHk9XCJvZzppbWFnZTp3aWR0aFwiIGNvbnRlbnQ9XCIxMjgwXCIgLz5cbiAgICAgIDxtZXRhIHByb3BlcnR5PVwib2c6aW1hZ2U6aGVpZ2h0XCIgY29udGVudD1cIjcyMFwiIC8+XG4gICAgICA8bWV0YSBwcm9wZXJ0eT1cIm9nOmxvY2FsZVwiIGNvbnRlbnQ9XCJqYV9KUFwiIC8+XG4gICAgICA8bWV0YSBuYW1lPVwidHdpdHRlcjpjYXJkXCIgY29udGVudD1cInN1bW1hcnlcIiAvPlxuICAgICAgPG1ldGEgbmFtZT1cInR3aXR0ZXI6dGl0bGVcIiBjb250ZW50PXt0aXRsZX0gLz5cbiAgICAgIDxtZXRhIG5hbWU9XCJ0d2l0dGVyOmRlc2NyaXB0aW9uXCIgY29udGVudD17ZGVzY3JpcHRpb259IC8+XG4gICAgICA8bWV0YSBuYW1lPVwidHdpdHRlcjppbWFnZVwiIGNvbnRlbnQ9e3VybCArIGljb259IC8+XG4gICAgICA8bWV0YSBuYW1lPVwidHdpdHRlcjpjcmVhdG9yXCIgY29udGVudD1cIkBhbWV4MjE4OVwiIC8+XG4gICAgICA8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgaHJlZj1cIi9zdGF0aWMvc3R5bGVzLmNzc1wiIC8+XG4gICAgICA8c2NyaXB0IHNyYz1cIi9zdGF0aWMvZnVuY3Rpb25zLmpzXCIgYXN5bmM+PC9zY3JpcHQ+XG4gICAgICA8c2NyaXB0IHR5cGU9XCJtb2R1bGVcIiBzcmM9XCJodHRwczovL2Nkbi5za3lwYWNrLmRldi90d2luZC9zaGltXCIgYXN5bmM+PC9zY3JpcHQ+XG4gICAgICA8L2hlYWQ+XG4gICAgPGJvZHkgY2xhc3NOYW1lPVwiYmctZ3JheS0zMDBcIiBzdHlsZT17e1xuICAgICAgYmFja2dyb3VuZEltYWdlOiBcInVybCgvc3RhdGljL0JCUy1CRy5wbmcpXCIsXG4gICAgICBiYWNrZ3JvdW5kU2l6ZTogXCJjb3ZlclwiXG4gICAgfX0+XG4gICAgICA8SGVhZGVyIC8+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbnRlbnRzXCI+e3Byb3BzLmNoaWxkcmVufTwvZGl2PlxuICAgICAgPEZvb3RlciAvPlxuICAgICAgPHNjcmlwdCBpZD1cIl9fUlRCQlNfREFUQV9fXCIgdHlwZT1cImFwcGxpY2F0aW9uL2pzb25cIj57SlNPTi5zdHJpbmdpZnkocHJvcHMuZGF0YSA/PyB7fSl9PC9zY3JpcHQ+XG4gICAgPC9ib2R5PlxuICA8Lz5cbn0iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxXQUFXLHVCQUF1QjtBQUN6QyxTQUFTLE1BQU0sUUFBUSwwQkFBeUI7QUFDaEQsU0FBUyxNQUFNLFFBQVEsMEJBQXlCO0FBRWhELHdCQUF3QjtBQUN4Qix3QkFBd0I7QUFDeEIsd0JBQXdCO0FBRXhCLE9BQU8sU0FBUyxPQUFPLEtBQUssRUFBRTtJQUU1QixNQUFNLFFBQVEsTUFBTSxLQUFLLElBQUk7SUFDN0IsTUFBTSxjQUFjLE1BQU0sV0FBVyxJQUFJO0lBQ3pDLE1BQU0sT0FBTyxNQUFNLElBQUksSUFBSTtJQUMzQixNQUFNLE1BQU07SUFFWixxQkFBTyx3REFDTCxvQkFBQztRQUFLLE1BQUs7UUFBSyxRQUFPO3FCQUNyQixvQkFBQztRQUFLLEtBQUk7UUFBYSxNQUFLO1FBQTRCLGFBQUEsSUFBVztzQkFDbkUsb0JBQUM7UUFBSyxTQUFRO3NCQUNkLG9CQUFDLGVBQU8sc0JBQ1Isb0JBQUM7UUFBSyxNQUFLO1FBQWMsU0FBUztzQkFDbEMsb0JBQUM7UUFBSyxNQUFLO3NCQUNYLG9CQUFDO1FBQUssTUFBSztRQUFXLFNBQVE7c0JBQzlCLG9CQUFDO1FBQUssS0FBSTtRQUFPLE1BQUs7UUFBZSxNQUFNO3NCQUMzQyxvQkFBQztRQUFLLE1BQUs7UUFBVSxTQUFRO3NCQUM3QixvQkFBQztRQUFLLFVBQVM7UUFBVSxTQUFRO3NCQUNqQyxvQkFBQztRQUFLLFVBQVM7UUFBVyxTQUFTO3NCQUNuQyxvQkFBQztRQUFLLFVBQVM7UUFBaUIsU0FBUztzQkFDekMsb0JBQUM7UUFBSyxVQUFTO1FBQWUsU0FBUztzQkFDdkMsb0JBQUM7UUFBSyxVQUFTO1FBQVMsU0FBUztzQkFDakMsb0JBQUM7UUFBSyxVQUFTO1FBQVcsU0FBUyxNQUFNO3NCQUN6QyxvQkFBQztRQUFLLFVBQVM7UUFBaUIsU0FBUTtzQkFDeEMsb0JBQUM7UUFBSyxVQUFTO1FBQWtCLFNBQVE7c0JBQ3pDLG9CQUFDO1FBQUssVUFBUztRQUFZLFNBQVE7c0JBQ25DLG9CQUFDO1FBQUssTUFBSztRQUFlLFNBQVE7c0JBQ2xDLG9CQUFDO1FBQUssTUFBSztRQUFnQixTQUFTO3NCQUNwQyxvQkFBQztRQUFLLE1BQUs7UUFBc0IsU0FBUztzQkFDMUMsb0JBQUM7UUFBSyxNQUFLO1FBQWdCLFNBQVMsTUFBTTtzQkFDMUMsb0JBQUM7UUFBSyxNQUFLO1FBQWtCLFNBQVE7c0JBQ3JDLG9CQUFDO1FBQUssS0FBSTtRQUFhLE1BQUs7c0JBQzVCLG9CQUFDO1FBQU8sS0FBSTtRQUF1QixPQUFBLElBQUs7c0JBQ3hDLG9CQUFDO1FBQU8sTUFBSztRQUFTLEtBQUk7UUFBcUMsT0FBQSxJQUFLO3VCQUV0RSxvQkFBQztRQUFLLFdBQVU7UUFBYyxPQUFPO1lBQ25DLGlCQUFpQjtZQUNqQixnQkFBZ0I7UUFDbEI7cUJBQ0Usb0JBQUMsNkJBQ0Qsb0JBQUM7UUFBSSxXQUFVO09BQVksTUFBTSxRQUFRLGlCQUN6QyxvQkFBQyw2QkFDRCxvQkFBQztRQUFPLElBQUc7UUFBaUIsTUFBSztPQUFvQixLQUFLLFNBQVMsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDO0FBR3pGLENBQUMifQ==