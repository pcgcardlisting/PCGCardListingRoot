"use client";
import { useState, useEffect, useRef, useCallback } from "react";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string | null };
}

interface ChatRoom {
  id: string;
  buyer?: { id: string; name: string | null; image: string | null };
  messages: Message[];
}

interface Props {
  listingId: string;
  listingCard: string;
  listingImage?: string | null;
  sellerName: string;
  sellerId: string;
  currentUserId: string;
  onClose: () => void;
}

export default function ChatWindow({ listingId, listingCard, listingImage, sellerName, sellerId, currentUserId, onClose }: Props) {
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const iAmSeller = currentUserId === sellerId;

  const loadChat = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat?listingId=${listingId}`);
      const data = await res.json();
      if (data.isSeller) {
        setIsSeller(true);
        setRooms(data.rooms || []);
        if (!activeRoomId && data.rooms?.length > 0) {
          setActiveRoomId(data.rooms[0].id);
          setMessages(data.rooms[0].messages || []);
        } else if (activeRoomId) {
          const r = data.rooms?.find((r: ChatRoom) => r.id === activeRoomId);
          if (r) setMessages(r.messages || []);
        }
      } else {
        setRoom(data.room);
        setMessages(data.room?.messages || []);
        if (data.room) setActiveRoomId(data.room.id);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [listingId, activeRoomId]);

  useEffect(() => {
    loadChat();
    pollRef.current = setInterval(loadChat, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [loadChat]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function sendMessage() {
    if (!input.trim() || !activeRoomId || sending) return;
    setSending(true);
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: activeRoomId, content: input.trim() }),
      });
      setInput("");
      loadChat();
    } finally { setSending(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg flex flex-col shadow-2xl" style={{ height: "520px" }}>
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-800">
          {listingImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={listingImage} alt={listingCard} className="w-10 h-14 rounded-lg object-cover bg-gray-800" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white text-sm truncate">{listingCard}</div>
            <div className="text-xs text-gray-400">{iAmSeller ? "Your listing" : `Seller: ${sellerName}`}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 transition-colors">✕</button>
        </div>

        {/* Seller: room picker */}
        {isSeller && rooms.length > 1 && (
          <div className="flex gap-2 px-4 py-2 border-b border-gray-800 overflow-x-auto">
            {rooms.map((r) => (
              <button
                key={r.id}
                onClick={() => { setActiveRoomId(r.id); setMessages(r.messages); }}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${activeRoomId === r.id ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}
              >
                {r.buyer?.name || "Buyer"}
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && <div className="flex justify-center pt-8"><div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /></div>}

          {!loading && messages.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              {iAmSeller ? (rooms.length === 0 ? "No enquiries yet." : "Select a buyer above to view messages.") : "Start a conversation about this card!"}
            </div>
          )}

          {messages.map((msg) => {
            const isMe = msg.sender.id === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${isMe ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-800 text-white rounded-bl-sm"}`}>
                  {!isMe && <div className="text-xs text-gray-400 mb-1">{msg.sender.name}</div>}
                  <div className="text-sm">{msg.content}</div>
                  <div className="text-xs opacity-50 mt-0.5 text-right">{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-800 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
            disabled={!activeRoomId}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || !activeRoomId || sending}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl text-sm font-medium transition-colors"
          >
            {sending ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
