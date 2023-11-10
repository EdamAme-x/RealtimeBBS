import { BBS, Thread } from "../../bbs.d.ts";

export function getThreads(): BBS {
  // NOTE: from JSON
  const Threads = {} as unknown as Thread[];

  return {
    threads: Threads,
  };
}
