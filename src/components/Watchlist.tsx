"use client";

interface WatchlistItem {
  id: string;
  cardId: string;
  cardName: string;
  setName?: string | null;
  cardNumber?: string | null;
  imageUrl?: string | null;
  source: string;
}

interface Props {
  items: WatchlistItem[];
  loading: boolean;
  onSelect: (item: WatchlistItem) => void;
  onRemove: (cardId: string, source: string) => void;
  selectedCardId?: number;
}

export default function Watchlist({ items, loading, onSelect, onRemove, selectedCardId }: Props) {
  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
        <div className="text-3xl mb-3">⭐</div>
        <h3 className="text-white font-medium mb-1">Your watchlist is empty</h3>
        <p className="text-gray-500 text-sm">Search for cards and click ★ to add them here.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <div className="p-3 border-b border-gray-800">
        <h3 className="text-sm font-medium text-gray-400">{items.length} card{items.length !== 1 ? "s" : ""} tracked</h3>
      </div>
      <div className="overflow-y-auto max-h-[60vh]">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-800 transition-colors border-b border-gray-800/50 last:border-0 ${
              selectedCardId === parseInt(item.cardId) ? "bg-gray-800 border-l-2 border-l-blue-500" : ""
            }`}
          >
            <div className="w-10 h-14 rounded-md overflow-hidden flex-shrink-0 bg-gray-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl || "https://placehold.co/40x56/1f2937/6b7280?text=?"}
                alt={item.cardName}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/40x56/1f2937/6b7280?text=?"; }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{item.cardName}</div>
              {item.setName && (
                <div className="text-xs text-gray-500 truncate">{item.setName}</div>
              )}
              <div className="text-xs text-gray-600 capitalize">{item.source}</div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(item.cardId, item.source); }}
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
              title="Remove from watchlist"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
