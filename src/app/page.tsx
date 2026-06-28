import Link from "next/link";
import { auth } from "@/lib/auth";
import Marketplace from "@/components/Marketplace";

export default async function HomePage() {
  const session = await auth();
  const currentUserId = session?.user?.id;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 flex flex-col">
      {/* Nav */}
      <nav className="border-b border-gray-800/50 px-4 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <span className="text-lg font-bold text-white">PCG Card Listing</span>
        <div className="flex gap-3">
          {currentUserId ? (
            <Link href="/dashboard" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 text-gray-300 hover:text-white text-sm transition-colors">Sign In</Link>
              <Link href="/register" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-700/40 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-6">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
          Live prices from TCGPlayer &amp; eBay
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          PCG Card
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Listing</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mb-10">
          Track Pokémon TCG card prices in real-time. Compare listings from TCGPlayer and eBay,
          monitor price trends, and buy or trade cards directly with other collectors.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          {currentUserId ? (
            <Link href="/dashboard" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-lg transition-colors">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/register" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-lg transition-colors">
                Get Started Free
              </Link>
              <Link href="/login" className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold text-lg transition-colors border border-gray-700">
                Sign In
              </Link>
            </>
          )}
          <a href="#marketplace" className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold text-lg transition-colors border border-gray-700">
            Browse Marketplace
          </a>
        </div>
      </div>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-16 grid grid-cols-1 md:grid-cols-4 gap-5 w-full">
        {[
          { icon: "📈", title: "Real-Time Prices", desc: "Live market prices from TCGPlayer and eBay." },
          { icon: "📊", title: "Price History", desc: "30-day price trend charts for every card." },
          { icon: "⭐", title: "Watchlist", desc: "Save favourite cards and track them all in one place." },
          { icon: "🤝", title: "Marketplace", desc: "Buy, sell or trade cards directly with other collectors." },
        ].map((f) => (
          <div key={f.title} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 text-center hover:border-blue-700/50 transition-colors">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="text-base font-semibold text-white mb-1">{f.title}</h3>
            <p className="text-gray-400 text-xs">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Marketplace */}
      <div className="bg-gray-950/80 border-t border-gray-800/50">
        <Marketplace currentUserId={currentUserId} />
      </div>

      <footer className="text-center text-gray-600 text-sm py-6 border-t border-gray-800/30">
        © {new Date().getFullYear()} PCG Card Listing · @pcgcardlisting
      </footer>
    </main>
  );
}
