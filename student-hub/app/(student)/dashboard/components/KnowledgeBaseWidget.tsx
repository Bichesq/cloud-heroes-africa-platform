"use client";
import { useState, useMemo } from "react";
import type { KBArticle } from "../data/mock";

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  "Getting Started": { bg: "bg-blue-50",   text: "text-blue-700"  },
  "Programme":       { bg: "bg-purple-50", text: "text-purple-700"},
  "Account":         { bg: "bg-amber-50",  text: "text-amber-700" },
  "Assessments":     { bg: "bg-green-50",  text: "text-green-700" },
  "Support":         { bg: "bg-rose-50",   text: "text-rose-700"  },
};

const ALL = "All";

type Props = {
  articles: KBArticle[];
};

export default function KnowledgeBaseWidget({ articles }: Props) {
  const [query, setQuery]           = useState("");
  const [activeCategory, setActive] = useState(ALL);

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(articles.map((a) => a.category)))],
    [articles]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return articles.filter((a) => {
      const matchesCategory =
        activeCategory === ALL || a.category === activeCategory;
      const matchesQuery =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [articles, query, activeCategory]);

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
            Knowledge Base
          </p>
          <p className="text-sm text-gray-500">
            {/* TODO: update when real KB source is confirmed */}
            Browse guides and FAQs
          </p>
        </div>
        <a
          href="#"
          className="text-xs text-blue-600 hover:underline shrink-0"
          // TODO: replace # with real KB URL
        >
          Browse all →
        </a>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
          🔍
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles..."
          className="input pl-8"
          // TODO: replace local filter with real KB search API call
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              activeCategory === cat
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((article) => {
            const color = CATEGORY_COLORS[article.category] ?? {
              bg: "bg-gray-50",
              text: "text-gray-600",
            };
            return (
              <a
                key={article.id}
                href={article.url}
                // TODO: decide — open inside hub or new tab?
                // target="_blank" rel="noopener noreferrer"
                className="flex flex-col gap-2 p-4 border border-gray-100 rounded-xl
                           hover:border-blue-200 hover:shadow-sm transition-all group"
              >
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium w-fit
                              ${color.bg} ${color.text}`}
                >
                  {article.category}
                </span>
                <p className="text-sm font-medium group-hover:text-blue-600 transition-colors leading-snug">
                  {article.title}
                </p>
                <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                  {article.excerpt}
                </p>
              </a>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-gray-400">
            No articles found for &ldquo;{query}&rdquo;
          </p>
          <button
            onClick={() => { setQuery(""); setActive(ALL); }}
            className="mt-2 text-xs text-blue-600 hover:underline"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}