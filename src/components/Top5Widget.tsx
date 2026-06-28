"use client";
import { useState, useEffect, useCallback } from "react";
import { formatCurrency } from "@/lib/utils";

interface PinnedCard {
  id: string;
  cardId: string;
  cardName: string;
  setName?: string | null;
  cardNumber?: string | null;
  imageUrl?: string | null;
  tcgioId?: string | null;
  rarity?: string | null;
  position: number;
}

interface CardPrice {
  marketPrice: number | null;
  subTypeName: string;
}

interface Props {
  onSelectCard: (card: PinnedCard) => void;
  selectedCardId?: number;
  refreshTrigger?: number;
}

export default function Top5Widget({ onSelectCard, selectedCardId, refreshTrigger }: Props) {
  const [pins, setPins] = useState<PinnedCard[]>([]);
  const [prices, setPrices] = useState<Record<string, CardPrice | null>>({});
  const [loading, setLoading] = useState(true);
  const [priceLoading, setPriceLoading] = useState(false);

  const fetchPins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pinned");
      const data = await res.json();
      setPins(data.pins || []);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPrices = useCallback(async (cards: PinnedCard[]) => {
    if (cards.length === 0) return;
    setPriceLoading(true);
    const results: Record<string, CardPrice | null> = {};
    await Promise.all(
      cards.map(async (card) => {
        try {
          const params = new URLSearchParams({ name: card.cardName });
          if (card.tcgioId) params.set("tcgioId", card.tcgioId);
          const res = await fetch(`/api/cards/${card.cardId}/prices?${params}`);
          const data = await res.json();
          const firstPrice = data.tcgPrices?.[0];
          results[card.cardId] = firstPrice
            ? { marketPrice: firstPrice.marketPrice, subTypeName: firstPrice.subTypeName }
            : null;
        } catch {
          results[card.cardId] = null;
        }
      })
    );
    setPrices(results);
    setPriceLoading(false);
  }, []);

  useEffect(() => { fetchPins(); }, [fetchPins, refreshTrigger]);
  useEffect(() => { if (pins.length > 0) fetchPrices(pins); }, [pins, fetchPrices]);

  async function unpin(cardId: string, e: React.MouseEvent) {
    e.stopPropagation();
    await fetch("/api/pinned", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId }),
    });
    fetchPins();
  }

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-gray-400 mb-4">📌 My Top 5 Cards</h2>
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          📌 My Top 5 Cards
          {priceLoading && (
            <span className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin inline-block" />
          )}
        </h2>
        <span className="text-xs text-gray-600">{pins.length}/5 pinned</span>
      </div>

      {pins.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">No cards pinned yet.</p>
          <p className="text-gray-600 text-xs mt-1">Search a card and click 📌 to pin it here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pins.map((card, i) => {
            const price = prices[card.cardId];
            const isSelected = selectedCardId === parseInt(card.cardId);
            return (
              <div
                key={card.id}
                onClick={() => onSelectCard(card)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-blue-900/30 border border-blue-700/50"
                    : "bg-gray-800/60 hover:bg-gray-800 border border-transparent"
                }`}
              >
                {/* Rank badge */}
                <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 flex-shrink-0">
                  {i + 1}
                </div>

                {/* Card image */}
                <div className="w-9 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.imageUrl || "https://placehold.co/36x48/1f2937/6b7280?text=?"}
                    alt={card.cardName}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/36x48/1f2937/6b7280?text=?"; }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{card.cardName}</div>
                  <div className="text-xs text-gray-500 truncate">{card.setName || "—"}</div>
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0">
                  {price?.marketPrice ? (
                    <div className="text-sm font-bold text-blue-400">{formatCurrency(price.marketPrice)}</div>
                  ) : (
                    <div className="text-xs text-gray-600">—</div>
                  )}
                </div>

                {/* Unpin */}
                <button
                  onClick={(e) => unpin(card.cardId, e)}
                  className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-900/20 transition-colors text-xs"
                  title="Unpin"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      {pins.length < 5 && pins.length > 0 && (
        <p className="text-xs text-gray-600 mt-3 text-center">
          Pin {5 - pins.length} more card{5 - pins.length !== 1 ? "s" : ""} from search
        </p>
      )}
    </div>
  );
}
