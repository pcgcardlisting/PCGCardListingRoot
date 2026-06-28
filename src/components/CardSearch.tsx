"use client";
import { useState, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect } from "react";

interface TCGCard {
  productId: number;
  name: string;
  imageUrl: string;
  setName?: string;
  number?: string;
}

interface Props {
  onSelectCard: (card: TCGCard) => void;
  onAddToWatchlist: (card: TCGCard) => void;
  selectedCardId?: number;
  isInWatchlist: (id: number) => boolean;
}

export default function CardSearch({ onSelectCard, onAddToWatchlist, selectedCardId, isInWatchlist }: Props) {
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<TCGCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debouncedQuery = useDebounce(query, 500);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setCards([]); setSearched(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/cards/search?q=${encodeURIComponent(q)}&limit=15`);
      const data = await res.json();
      setCards(data.cards || []);
      setSearched(true);
    } catch {
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { search(debouncedQuery); }, [debouncedQuery, search]);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Pokémon cards..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </div>

      <div className="overflow-y-auto max-h-[60vh]">
        {!searched && !loading && (
          <div className="p-6 text-center">
            <div className="text-3xl mb-2">🔍</div>
            <p className="text-gray-500 text-sm">Type to search for Pokémon cards</p>
            <p className="text-gray-600 text-xs mt-1">e.g. "Charizard", "Pikachu VMAX"</p>
          </div>
        )}

        {searched && cards.length === 0 && !loading && (
          <div className="p-6 text-center text-gray-500 text-sm">
            No cards found for &quot;{query}&quot;
          </div>
        )}

        {cards.map((card) => (
          <div
            key={card.productId}
            onClick={() => onSelectCard(card)}
            className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-800 transition-colors border-b border-gray-800/50 last:border-0 ${
              selectedCardId === card.productId ? "bg-gray-800 border-l-2 border-l-blue-500" : ""
            }`}
          >
            {/* Card thumbnail */}
            <div className="w-10 h-14 rounded-md overflow-hidden flex-shrink-0 bg-gray-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.imageUrl || "https://placehold.co/40x56/1f2937/6b7280?text=?"}
                alt={card.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/40x56/1f2937/6b7280?text=?"; }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{card.name}</div>
              {card.setName && (
                <div className="text-xs text-gray-500 truncate">{card.setName} {card.number ? `· #${card.number}` : ""}</div>
              )}
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); onAddToWatchlist(card); }}
              className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                isInWatchlist(card.productId)
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-gray-700 text-gray-400 hover:bg-yellow-500/20 hover:text-yellow-400"
              }`}
              title={isInWatchlist(card.productId) ? "In watchlist" : "Add to watchlist"}
            >
              ★
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
