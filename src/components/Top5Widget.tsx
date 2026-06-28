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

interface MyListing {
  cardId: string;
  listingType: string;
  price?: number | null;
  wantedCard?: string | null;
}

interface Props {
  onSelectCard: (card: PinnedCard) => void;
  selectedCardId?: number;
  refreshTrigger?: number;
}

export default function Top5Widget({ onSelectCard, selectedCardId, refreshTrigger }: Props) {
  const [pins, setPins] = useState<PinnedCard[]>([]);
  const [prices, setPrices] = useState<Record<string, CardPrice | null>>({});
  const [myListings, setMyListings] = useState<Record<string, MyListing>>({});
  const [loading, setLoading] = useState(true);
  const [listingCard, setListingCard] = useState<PinnedCard | null>(null);
  const [listingType, setListingType] = useState<"sell" | "trade">("sell");
  const [listingPrice, setListingPrice] = useState("");
  const [wantedCard, setWantedCard] = useState("");
  const [listingDesc, setListingDesc] = useState("");
  const [savingListing, setSavingListing] = useState(false);

  const fetchPins = useCallback(async () => {
    setLoading(true);
    try {
      const [pinsRes, listingsRes] = await Promise.all([
        fetch("/api/pinned"),
        fetch("/api/listings/mine"),
      ]);
      const pinsData = await pinsRes.json();
      const listingsData = await listingsRes.json();
      setPins(pinsData.pins || []);
      const lMap: Record<string, MyListing> = {};
      for (const l of listingsData.listings || []) lMap[l.cardId] = l;
      setMyListings(lMap);
    } finally { setLoading(false); }
  }, []);

  const fetchPrices = useCallback(async (cards: PinnedCard[]) => {
    if (cards.length === 0) return;
    const results: Record<string, CardPrice | null> = {};
    await Promise.all(
      cards.map(async (card) => {
        try {
          const params = new URLSearchParams({ name: card.cardName });
          if (card.tcgioId) params.set("tcgioId", card.tcgioId);
          const res = await fetch(`/api/cards/${card.cardId}/prices?${params}`);
          const data = await res.json();
          const firstPrice = data.tcgPrices?.[0];
          results[card.cardId] = firstPrice ? { marketPrice: firstPrice.marketPrice, subTypeName: firstPrice.subTypeName } : null;
        } catch { results[card.cardId] = null; }
      })
    );
    setPrices(results);
  }, []);

  useEffect(() => { fetchPins(); }, [fetchPins, refreshTrigger]);
  useEffect(() => { if (pins.length > 0) fetchPrices(pins); }, [pins, fetchPrices]);

  async function unpin(cardId: string, e: React.MouseEvent) {
    e.stopPropagation();
    await fetch("/api/pinned", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cardId }) });
    fetchPins();
  }

  async function saveListing() {
    if (!listingCard) return;
    setSavingListing(true);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: listingCard.cardId,
          cardName: listingCard.cardName,
          setName: listingCard.setName,
          cardNumber: listingCard.cardNumber,
          imageUrl: listingCard.imageUrl,
          tcgioId: listingCard.tcgioId,
          rarity: listingCard.rarity,
          listingType,
          price: listingType === "sell" ? parseFloat(listingPrice) || null : null,
          wantedCard: listingType === "trade" ? wantedCard : null,
          description: listingDesc || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error); return; }
      setListingCard(null);
      fetchPins();
    } finally { setSavingListing(false); }
  }

  async function removeListing(cardId: string, e: React.MouseEvent) {
    e.stopPropagation();
    await fetch("/api/listings", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cardId }) });
    fetchPins();
  }

  function openListingModal(card: PinnedCard) {
    setListingCard(card);
    const existing = myListings[card.cardId];
    setListingType((existing?.listingType as "sell" | "trade") || "sell");
    setListingPrice(existing?.price?.toString() || "");
    setWantedCard(existing?.wantedCard || "");
    setListingDesc("");
  }

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-gray-400 mb-4">📌 My Top 5 Cards</h2>
        <div className="flex justify-center py-4"><div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">📌 My Top 5 Cards</h2>
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
              const listed = myListings[card.cardId];
              const isSelected = selectedCardId === parseInt(card.cardId);
              return (
                <div key={card.id} className={`rounded-xl border transition-colors ${isSelected ? "border-blue-700/50 bg-blue-900/20" : "border-transparent bg-gray-800/60"}`}>
                  {/* Card row */}
                  <div
                    onClick={() => onSelectCard(card)}
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-800/80 rounded-t-xl transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 flex-shrink-0">{i + 1}</div>
                    <div className="w-9 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-700">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={card.imageUrl || "https://placehold.co/36x48/1f2937/6b7280?text=?"} alt={card.cardName} className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/36x48/1f2937/6b7280?text=?"; }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{card.cardName}</div>
                      <div className="text-xs text-gray-500 truncate">{card.setName || "—"}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {price?.marketPrice ? <div className="text-sm font-bold text-blue-400">{formatCurrency(price.marketPrice)}</div> : <div className="text-xs text-gray-600">—</div>}
                    </div>
                    <button onClick={(e) => unpin(card.cardId, e)} className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-gray-600 hover:text-red-400 transition-colors text-xs" title="Unpin">✕</button>
                  </div>

                  {/* Marketplace row */}
                  <div className="px-3 pb-3 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`list-${card.cardId}`}
                      checked={!!listed}
                      onChange={(e) => { if (e.target.checked) openListingModal(card); else removeListing(card.cardId, e as unknown as React.MouseEvent); }}
                      className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
                    />
                    <label htmlFor={`list-${card.cardId}`} className="text-xs text-gray-400 cursor-pointer flex-1">
                      {listed ? (
                        <span className="text-green-400 font-medium">
                          ✓ Listed {listed.listingType === "sell" ? `for ${formatCurrency(listed.price!)}` : `for trade (wants: ${listed.wantedCard})`}
                        </span>
                      ) : "List on Marketplace"}
                    </label>
                    {listed && (
                      <button onClick={() => openListingModal(card)} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Edit</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Listing modal */}
      {listingCard && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-16 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={listingCard.imageUrl || ""} alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-white">{listingCard.cardName}</h3>
                <p className="text-xs text-gray-400">{listingCard.setName}</p>
              </div>
              <button onClick={() => setListingCard(null)} className="ml-auto text-gray-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800">✕</button>
            </div>

            {/* Type selector */}
            <div className="flex bg-gray-800 rounded-xl p-1 mb-4">
              <button onClick={() => setListingType("sell")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${listingType === "sell" ? "bg-green-600 text-white" : "text-gray-400 hover:text-white"}`}>🏷️ For Sale</button>
              <button onClick={() => setListingType("trade")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${listingType === "trade" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}>🔄 Trade</button>
            </div>

            {listingType === "sell" && (
              <div className="mb-4">
                <label className="text-xs text-gray-400 mb-1.5 block">Selling Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input type="number" min="0.01" step="0.01" value={listingPrice} onChange={(e) => setListingPrice(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-7 pr-4 py-2.5 text-white focus:outline-none focus:border-green-500 text-sm"
                    placeholder="0.00" />
                </div>
              </div>
            )}

            {listingType === "trade" && (
              <div className="mb-4">
                <label className="text-xs text-gray-400 mb-1.5 block">Card you want in return</label>
                <input type="text" value={wantedCard} onChange={(e) => setWantedCard(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
                  placeholder="e.g. Charizard Base Set" />
              </div>
            )}

            <div className="mb-5">
              <label className="text-xs text-gray-400 mb-1.5 block">Description (optional)</label>
              <textarea value={listingDesc} onChange={(e) => setListingDesc(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm resize-none"
                placeholder="Card condition, grading info, etc." rows={2} />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setListingCard(null)} className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors">Cancel</button>
              <button onClick={saveListing} disabled={savingListing} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white rounded-xl text-sm font-semibold transition-colors">
                {savingListing ? "Saving..." : "Publish Listing"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
