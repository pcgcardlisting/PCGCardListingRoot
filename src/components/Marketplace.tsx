"use client";
import { useState, useEffect, useCallback } from "react";
import { formatCurrency } from "@/lib/utils";
import ChatWindow from "@/components/ChatWindow";

interface Listing {
  id: string;
  cardId: string;
  cardName: string;
  setName?: string | null;
  cardNumber?: string | null;
  imageUrl?: string | null;
  listingType: string;
  price?: number | null;
  wantedCard?: string | null;
  description?: string | null;
  createdAt: string;
  user: { id: string; name: string | null; image: string | null };
}

interface Props {
  currentUserId?: string;
}

export default function Marketplace({ currentUserId }: Props) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "sell" | "trade">("all");
  const [search, setSearch] = useState("");
  const [chatListing, setChatListing] = useState<Listing | null>(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("type", filter);
      if (search) params.set("q", search);
      const res = await fetch(`/api/listings?${params}`);
      const data = await res.json();
      setListings(data.listings || []);
    } finally { setLoading(false); }
  }, [filter, search]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  return (
    <section className="max-w-7xl mx-auto px-4 py-16" id="marketplace">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-2">Card Marketplace</h2>
        <p className="text-gray-400">Trade or buy cards directly from other collectors</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listings..."
            className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>
        <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1 gap-1">
          {(["all", "sell", "trade"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${filter === f ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              {f === "all" ? "All" : f === "sell" ? "🏷️ For Sale" : "🔄 Trades"}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
      )}

      {!loading && listings.length === 0 && (
        <div className="text-center py-16 bg-gray-900/50 border border-gray-800 rounded-2xl">
          <div className="text-4xl mb-3">🃏</div>
          <p className="text-gray-400 font-medium">No listings yet</p>
          <p className="text-gray-600 text-sm mt-1">
            {currentUserId ? "Pin a card in your dashboard and list it here!" : "Sign in to list your cards for sale or trade."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {listings.map((listing) => (
          <div key={listing.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition-colors flex flex-col">
            {/* Card image */}
            <div className="relative">
              <div className="aspect-[2.5/3.5] bg-gray-800 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={listing.imageUrl || "https://placehold.co/200x280/1f2937/6b7280?text=?"}
                  alt={listing.cardName}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/200x280/1f2937/6b7280?text=?"; }}
                />
              </div>
              <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold ${listing.listingType === "sell" ? "bg-green-900/80 text-green-300 border border-green-700" : "bg-blue-900/80 text-blue-300 border border-blue-700"}`}>
                {listing.listingType === "sell" ? "FOR SALE" : "TRADE"}
              </span>
            </div>

            {/* Info */}
            <div className="p-4 flex-1 flex flex-col">
              <div className="font-semibold text-white text-sm mb-0.5 truncate">{listing.cardName}</div>
              {listing.setName && <div className="text-xs text-gray-500 mb-2 truncate">{listing.setName}</div>}

              {listing.listingType === "sell" && listing.price && (
                <div className="text-xl font-bold text-green-400 mb-2">{formatCurrency(listing.price)}</div>
              )}
              {listing.listingType === "trade" && listing.wantedCard && (
                <div className="text-xs text-blue-300 mb-2">
                  <span className="text-gray-500">Wants: </span>{listing.wantedCard}
                </div>
              )}
              {listing.description && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{listing.description}</p>
              )}

              {/* Seller info */}
              <div className="flex items-center gap-2 mt-auto mb-3">
                {listing.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={listing.user.image} alt="" className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white font-bold">
                    {(listing.user.name || "?")[0].toUpperCase()}
                  </div>
                )}
                <span className="text-xs text-gray-400 truncate">{listing.user.name || "Anonymous"}</span>
                <span className="text-xs text-gray-600 ml-auto">{new Date(listing.createdAt).toLocaleDateString()}</span>
              </div>

              {/* Action */}
              {currentUserId && currentUserId !== listing.user.id ? (
                <button
                  onClick={() => setChatListing(listing)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  {listing.listingType === "sell" ? "💬 Contact Seller" : "🔄 Propose Trade"}
                </button>
              ) : !currentUserId ? (
                <a href="/login" className="block w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium text-center transition-colors">
                  Sign in to contact
                </a>
              ) : (
                <div className="w-full py-2.5 bg-gray-800 text-gray-500 rounded-xl text-sm text-center">Your listing</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Chat modal */}
      {chatListing && currentUserId && (
        <ChatWindow
          listingId={chatListing.id}
          listingCard={chatListing.cardName}
          listingImage={chatListing.imageUrl}
          sellerName={chatListing.user.name || "Seller"}
          sellerId={chatListing.user.id}
          currentUserId={currentUserId}
          onClose={() => setChatListing(null)}
        />
      )}
    </section>
  );
}
