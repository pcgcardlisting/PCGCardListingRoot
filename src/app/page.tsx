import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 flex flex-col">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center flex-1 px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-700/40 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-6">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
          Live prices from TCGPlayer &amp; eBay
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          PCG Card
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Listing
          </span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mb-10">
          Track Pokémon TCG card prices in real-time. Compare listings from TCGPlayer and eBay,
          monitor price trends, and build your personal watchlist.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/register"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-lg transition-colors"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold text-lg transition-colors border border-gray-700"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {[
          {
            icon: "📈",
            title: "Real-Time Prices",
            desc: "Live market prices from TCGPlayer and eBay updated continuously.",
          },
          {
            icon: "📊",
            title: "Price History Charts",
            desc: "30-day price trend charts for every card in your watchlist.",
          },
          {
            icon: "⭐",
            title: "Personal Watchlist",
            desc: "Save your favourite cards and track them all in one place.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 text-center hover:border-blue-700/50 transition-colors"
          >
            <div className="text-4xl mb-4">{f.icon}</div>
            <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
            <p className="text-gray-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="text-center text-gray-600 text-sm pb-6">
        © {new Date().getFullYear()} PCG Card Listing · pcgcardlisting
      </footer>
    </main>
  );
}
