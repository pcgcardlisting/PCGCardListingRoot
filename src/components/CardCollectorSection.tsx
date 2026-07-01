"use client";
import { useState } from "react";
import Marketplace from "@/components/Marketplace";
import Link from "next/link";

interface Props {
  currentUserId?: string;
}

export default function CardCollectorSection({ currentUserId }: Props) {
  const [activeFilter, setActiveFilter] = useState<"all" | "pokemon" | "onepiece">("all");

  return (
    <div className="flex-1 bg-gray-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-950 via-indigo-950 to-gray-950 py-14 px-4 text-center border-b border-gray-800">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-900/40 border border-indigo-700/40 rounded-full px-4 py-1.5 text-sm text-indigo-300 mb-5">
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
            Pokémon &amp; One Piece TCG Collector Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Card Collector
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 text-3xl mt-1">
              Marketplace
            </span>
          </h1>
          <p className="text-gray-400 text-base max-w-xl mx-auto mb-8">
            Track prices, build your watchlist, and buy or trade Pokémon &amp; One Piece TCG cards
            directly with other collectors.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {currentUserId ? (
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-colors"
              >
                My Dashboard &amp; Watchlist →
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-colors"
                >
                  Join Free — Track Prices
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors border border-gray-700"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features strip */}
      <div className="border-b border-gray-800 bg-gray-900/60">
        <div className="max-w-5xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "🔍", label: "Search any card", sub: "Pokémon & One Piece" },
            { icon: "📈", label: "Live TCG prices", sub: "TCGPlayer + eBay" },
            { icon: "📌", label: "Pin Top 5 cards", sub: "Your personal picks" },
            { icon: "🤝", label: "Trade & sell", sub: "Chat with collectors" },
          ].map((f) => (
            <div key={f.label} className="text-center">
              <div className="text-2xl mb-1">{f.icon}</div>
              <div className="text-sm font-semibold text-white">{f.label}</div>
              <div className="text-xs text-gray-500">{f.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Collection type filter */}
      <div className="border-b border-gray-800 bg-gray-950 px-4 py-3 flex justify-center">
        <div className="inline-flex bg-gray-900 border border-gray-800 rounded-xl p-1 gap-1">
          {([
            { key: "all", label: "🃏 All Cards" },
            { key: "pokemon", label: "⚡ Pokémon" },
            { key: "onepiece", label: "⚓ One Piece" },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === key
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Marketplace listings */}
      <Marketplace currentUserId={currentUserId} collectionFilter={activeFilter} />
    </div>
  );
}
