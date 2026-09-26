"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Article = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  url: string;
};

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/content?type=articles", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json() as { items?: Article[]; error?: string };
        if (!response.ok) throw new Error(result.error || "Unable to load news");
        setArticles(result.items || []);
      })
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load news"))
      .finally(() => setLoading(false));
  }, []);

  return <main className="min-h-screen bg-[#f6f4ee] text-[#202421]">
    <header className="bg-[#202421] px-5 py-5 text-white md:px-10 md:py-7">
      <div className="mx-auto flex max-w-[1380px] items-center justify-between">
        <Link href="/" className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center border border-[#c99a43] text-lg font-bold">CR</span><span className="sans text-[11px] font-bold uppercase tracking-[.18em]">Church<br />on the Rock</span></Link>
        <Link href="/" className="sans text-sm font-bold text-[#c99a43]">Back to home ↗</Link>
      </div>
    </header>

    <section className="border-b border-[#202421]/15 px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[1380px]">
        <p className="sans text-xs font-bold uppercase tracking-[.2em] text-[#a44d32]">News & teachings</p>
        <h1 className="mt-5 max-w-3xl text-5xl leading-none md:text-7xl">Words for the<br /><em>journey.</em></h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-[#77756e]">Read updates, encouragement, and teachings from the Church on the Rock family.</p>
      </div>
    </section>

    <section className="px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-[1000px]">
        {loading && <p className="sans text-sm text-[#77756e]">Loading news and teachings...</p>}
        {error && <p className="border-l-4 border-[#a44d32] bg-white p-4 sans text-sm">{error}</p>}
        {!loading && !error && articles.length === 0 && <div className="border border-[#202421]/15 bg-white p-8 md:p-12"><p className="sans text-xs font-bold uppercase tracking-[.2em] text-[#a44d32]">Nothing published yet</p><h2 className="mt-4 text-3xl">New teachings are on the way.</h2><p className="mt-4 max-w-xl leading-7 text-[#77756e]">Check back soon for news and written teachings from our church family.</p></div>}
        {!loading && !error && articles.length > 0 && <div className="grid gap-5">{articles.map((article) => <article key={article.id} className="border-b border-[#202421]/15 bg-white p-7 md:p-10"><div className="flex flex-wrap items-center gap-x-4 gap-y-2 sans text-xs font-bold uppercase tracking-[.16em] text-[#a44d32]"><span>{article.location || "Church on the Rock"}</span>{article.date && <><span className="text-[#202421]/30">/</span><time>{article.date}</time></>}</div><h2 className="mt-5 text-3xl md:text-4xl">{article.title}</h2><p className="mt-5 max-w-3xl whitespace-pre-line text-lg leading-8 text-[#555750]">{article.description}</p>{article.url && <a href={article.url} target="_blank" rel="noreferrer" className="mt-7 inline-block border-b border-[#a44d32] pb-1 sans text-sm font-bold text-[#a44d32]">Read reference ↗</a>}</article>)}</div>}
      </div>
    </section>

    <footer className="bg-[#202421] px-5 py-10 text-white md:px-10"><div className="mx-auto flex max-w-[1380px] flex-col justify-between gap-4 sans text-xs text-white/50 md:flex-row"><span>Church on the Rock · Nango, Kenya</span><Link href="/" className="text-[#c99a43]">Return to church site ↗</Link></div></footer>
  </main>;
}
