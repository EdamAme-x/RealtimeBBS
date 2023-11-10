export type Post = {
  name: string, // 名前
  content: string, // 投稿内容
  date: number, // Date.now()
  ip: string // IP
}

export type Thread = {
  title: string, // スレッドのタイトル
  posts: Post[] // 投稿群
}

export type BBS = {
  threads: Thread[] // スレッド群
}
