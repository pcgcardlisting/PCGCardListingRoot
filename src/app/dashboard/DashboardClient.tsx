"use client";
import { useState, useEffect, useCallback } from "react";
import { signOut } from "next-auth/react";
import CardSearch from "@/components/CardSearch";
import CardPricePanel from "@/components/CardPricePanel";
import Watchlist from "@/components/Watchlist";

interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface WatchlistItem {
  id: string;
  cardId: string;
  cardName: string;
  setName?: string | null;
  cardNumber?: string | null;
  imageUrl?: string | null;
  source: string;
}

interface SelectedCard {
  productId: number;
  name: string;
  imageUrl: string;
  setName?: string;
  number?: string;
}

export default function DashboardClient({ user }: { user: User }) {
  const [selectedCard, setSelectedCard] = useState<SelectedCard | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [activeTab, setActiveTab] = useState<"search" | "watchlist">("search");
  const [loadingWatchlist, setLoadingWatchlist] = useState(true);

  const fetchWatchlist = useCallback(async () => {
    setLoadingWatchlist(true);
    try {
      const res = await fetch("/api/watchlist");
      const data = await res.json();
      setWatchlist(data.items || []);
    } catch {
      /* ignore */
    } finally {
      setLoadingWatchlist(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  async function addToWatchlist(card: SelectedCard) {
    await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardId: String(card.productId),
        cardName: card.name,
        setName: card.setName,
        cardNumber: card.number,
        imageUrl: card.imageUrl,
        source: "tcgplayer",
      }),
    });
    fetchWatchlist();
  }

  async function removeFromWatchlist(cardId: string, source: string) {
    await fetch("/api/watchlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId, source }),
    });
    fetchWatchlist();
  }

  const isInWatchlist = (cardId: number) =>
    watchlist.some((w) => w.cardId === String(cardId));

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top Nav */}
      <nav className="bg-gray-900 border-b border-gray-800 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-white">PCG Card Listing</span>
          <span className="hidden sm:inline text-xs bg-blue-900/40 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-full">
            Price Tracker
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {user.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
            )}
            <span className="text-sm text-gray-300 hidden sm:block">
              {user.name || user.email}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Watchlist Cards", value: watchlist.length.toString() },
            { label: "TCGPlayer Cards", value: "20M+" },
            { label: "eBay Listings", value: "Live" },
            { label: "Price Updates", value: "Real-time" },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: search + watchlist */}
          <div className="lg:col-span-1">
            {/* Tabs */}
            <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1 mb-4">
              <button
                onClick={() => setActiveTab("search")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "search"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Search Cards
              </button>
              <button
                onClick={() => setActiveTab("watchlist")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "watchlist"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Watchlist ({watchlist.length})
              </button>
            </div>

            {activeTab === "search" ? (
              <CardSearch
                onSelectCard={(card) => setSelectedCard(card)}
                onAddToWatchlist={addToWatchlist}
                selectedCardId={selectedCard?.productId}
                isInWatchlist={isInWatchlist}
              />
            ) : (
              <Watchlist
                items={watchlist}
                loading={loadingWatchlist}
                onSelect={(item) =>
                  setSelectedCard({
                    productId: parseInt(item.cardId),
                    name: item.cardName,
                    imageUrl: item.imageUrl || "",
                    setName: item.setName || undefined,
                    number: item.cardNumber || undefined,
                  })
                }
                onRemove={removeFromWatchlist}
                selectedCardId={selectedCard?.productId}
              />
            )}
          </div>

          {/* Right: price panel */}
          <div className="lg:col-span-2">
            {selectedCard ? (
              <CardPricePanel
                card={selectedCard}
                inWatchlist={isInWatchlist(selectedCard.productId)}
                onAddToWatchlist={() => addToWatchlist(selectedCard)}
                onRemoveFromWatchlist={() =>
                  removeFromWatchlist(String(selectedCard.productId), "tcgplayer")
                }
              />
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl h-96 flex flex-col items-center justify-center text-center p-8">
                <div className="text-5xl mb-4">🃏</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Select a Card to View Prices
                </h3>
                <p className="text-gray-500 text-sm">
                  Search for any Pokémon card on the left to see live prices from TCGPlayer and
                  eBay, along with a 30-day price history chart.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
