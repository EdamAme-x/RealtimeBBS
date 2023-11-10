import React from 'https://esm.sh/react';
import { Header } from "./components/header.tsx"
import { Footer } from "./components/footer.tsx"

// ------------------ //
//    By @amex2189    //
// ------------------ //

export function Layout(props) {

  const title = props.title ?? "RealtimeBBS";
  const description = props.description ?? "リアルタイムで更新されるブラウザリロード不要の2ch風BBS / RealtimeBBS";
  const icon = props.icon ?? "/static/favicon.png";
  const url = "https://realtime-bbs.deno.dev";
  
  return <>
    <head lang="ja" prefix="og: http://ogp.me/ns# website: http://ogp.me/ns/website#">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <meta charset="utf-8" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <base href="/" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" type="image/x-icon" href={icon} />
      <meta name="runtime" content="RealtimeBBS / Hono / Deno" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={title} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={url + icon} />
      <meta property="og:image:width" content="1280" />
      <meta property="og:image:height" content="720" />
      <meta property="og:locale" content="ja_JP" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={url + icon} />
      <meta name="twitter:creator" content="@amex2189" />
      <link rel="stylesheet" href="/static/styles.css" />
      <script src="/static/functions.js" async></script>
      <script type="module" src="https://cdn.skypack.dev/twind/shim" async></script>
      </head>
    <body className="bg-gray-300" style={{
      backgroundImage: "url(/static/BBS-BG.png)",
      backgroundSize: "cover"
    }}>
      <Header />
      <div className="contents">{props.children}</div>
      <Footer />
      <script id="__RTBBS_DATA__" type="application/json">{JSON.stringify(props.data ?? {})}</script>
    </body>
  </>
}