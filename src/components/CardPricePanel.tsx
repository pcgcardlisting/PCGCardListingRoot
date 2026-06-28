"use client";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface Card {
  productId: number;
  name: string;
  imageUrl: string;
  setName?: string;
  number?: string;
}

interface TCGPrice {
  subTypeName: string;
  lowPrice: number | null;
  midPrice: number | null;
  highPrice: number | null;
  marketPrice: number | null;
}

interface EbayListing {
  itemId: string;
  title: string;
  price: { value: string; currency: string };
  image?: { imageUrl: string };
  itemWebUrl: string;
  condition?: string;
}

interface PriceData {
  tcgPrices: TCGPrice[];
  priceHistory: { date: string; price: number }[];
  ebayData: { lowestPrice: number; averagePrice: number; highestPrice: number; totalListings: number };
  ebayListings: EbayListing[];
}

interface Props {
  card: Card;
  inWatchlist: boolean;
  onAddToWatchlist: () => void;
  onRemoveFromWatchlist: () => void;
}

export default function CardPricePanel({ card, inWatchlist, onAddToWatchlist, onRemoveFromWatchlist }: Props) {
  const [data, setData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"tcg" | "ebay" | "history">("tcg");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setData(null);
    fetch(`/api/cards/${card.productId}/prices?name=${encodeURIComponent(card.name)}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [card.productId, card.name]);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      {/* Card header */}
      <div className="flex items-start gap-4 p-5 border-b border-gray-800">
        <div className="w-20 h-28 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0 shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.imageUrl || "https://placehold.co/80x112/1f2937/6b7280?text=?"}
            alt={card.name}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/80x112/1f2937/6b7280?text=?"; }}
          />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">{card.name}</h2>
          {card.setName && (
            <p className="text-gray-400 text-sm mt-0.5">
              {card.setName}{card.number ? ` · #${card.number}` : ""}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {data?.tcgPrices[0]?.marketPrice && (
              <span className="bg-blue-900/40 border border-blue-800 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                TCG Market: {formatCurrency(data.tcgPrices[0].marketPrice)}
              </span>
            )}
            {data && (data.ebayData?.averagePrice ?? 0) > 0 && (
              <span className="bg-orange-900/40 border border-orange-800 text-orange-300 px-3 py-1 rounded-full text-sm font-medium">
                eBay Avg: {formatCurrency(data.ebayData.averagePrice)}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={inWatchlist ? onRemoveFromWatchlist : onAddToWatchlist}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            inWatchlist
              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-700 hover:bg-red-900/30 hover:text-red-300 hover:border-red-700"
              : "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-yellow-500/20 hover:text-yellow-400 hover:border-yellow-700"
          }`}
        >
          {inWatchlist ? "★ Watching" : "☆ Watch"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {(["tcg", "ebay", "history"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === t ? "text-white border-b-2 border-blue-500" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {t === "tcg" ? "TCGPlayer" : t === "ebay" ? "eBay Listings" : "Price History"}
          </button>
        ))}
      </div>

      <div className="p-5">
        {loading && (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && data && tab === "tcg" && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-400">TCGPlayer Prices by Type</h3>
            {data.tcgPrices.length === 0 ? (
              <p className="text-gray-500 text-sm">No TCGPlayer price data available.</p>
            ) : (
              data.tcgPrices.map((price) => (
                <div key={price.subTypeName} className="bg-gray-800 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-white">{price.subTypeName}</span>
                    {price.marketPrice && (
                      <span className="text-lg font-bold text-blue-400">
                        {formatCurrency(price.marketPrice)}
                        <span className="text-xs text-gray-500 ml-1">market</span>
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Low", value: price.lowPrice },
                      { label: "Mid", value: price.midPrice },
                      { label: "High", value: price.highPrice },
                    ].map((p) => (
                      <div key={p.label} className="text-center bg-gray-700/50 rounded-lg p-2">
                        <div className="text-xs text-gray-500 mb-0.5">{p.label}</div>
                        <div className="text-sm font-semibold text-white">{formatCurrency(p.value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {!loading && data && tab === "ebay" && (
          <div className="space-y-4">
            {/* eBay summary */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Lowest", value: data.ebayData.lowestPrice, color: "text-green-400" },
                { label: "Average", value: data.ebayData.averagePrice, color: "text-blue-400" },
                { label: "Highest", value: data.ebayData.highestPrice, color: "text-red-400" },
              ].map((s) => (
                <div key={s.label} className="bg-gray-800 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">{s.label}</div>
                  <div className={`text-lg font-bold ${s.color}`}>{formatCurrency(s.value)}</div>
                </div>
              ))}
            </div>

            <h3 className="text-sm font-medium text-gray-400">
              Active Listings ({data.ebayData.totalListings} total)
            </h3>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {data.ebayListings.map((listing) => (
                <a
                  key={listing.itemId}
                  href={listing.itemWebUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 rounded-xl p-3 transition-colors"
                >
                  <div className="w-10 h-12 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={listing.image?.imageUrl || "https://placehold.co/40x48/1f2937/6b7280?text=?"}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/40x48/1f2937/6b7280?text=?"; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white truncate">{listing.title}</div>
                    {listing.condition && <div className="text-xs text-gray-500">{listing.condition}</div>}
                  </div>
                  <div className="text-sm font-bold text-orange-400 flex-shrink-0">
                    ${listing.price.value}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {!loading && data && tab === "history" && (
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-4">30-Day Price History</h3>
            {data.priceHistory.length === 0 ? (
              <p className="text-gray-500 text-sm">No price history available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.priceHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#6b7280", fontSize: 10 }}
                    tickFormatter={(v) => v.slice(5)}
                    interval={6}
                  />
                  <YAxis
                    tick={{ fill: "#6b7280", fontSize: 10 }}
                    tickFormatter={(v) => `$${v}`}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }}
                    labelStyle={{ color: "#9ca3af" }}
                    itemStyle={{ color: "#60a5fa" }}
                    formatter={(v) => [`$${Number(v).toFixed(2)}`, "Price"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#3b82f6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
