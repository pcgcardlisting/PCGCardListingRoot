import Link from "next/link";
import { auth } from "@/lib/auth";
import ShopSection from "@/components/ShopSection";
import CardCollectorSection from "@/components/CardCollectorSection";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  const currentUserId = session?.user?.id;
  const { tab } = await searchParams;
  const activeTab = tab === "cards" ? "cards" : "home";

  return (
    <main className="min-h-screen bg-[#fdf8f3] flex flex-col">
      {/* ── Navigation ── */}
      <nav className="bg-white border-b border-rose-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">🧶</span>
            <div className="leading-tight">
              <div className="text-base font-bold text-rose-700 leading-none">Craft-A-Holic Mom</div>
              <div className="text-xs text-rose-400">Handmade with love</div>
            </div>
          </Link>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-rose-50 border border-rose-100 rounded-full p-1">
            <Link
              href="/?tab=home"
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === "home"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-rose-600 hover:bg-rose-100"
              }`}
            >
              🏠 Shop
            </Link>
            <Link
              href="/?tab=cards"
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === "cards"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-indigo-600 hover:bg-indigo-50"
              }`}
            >
              🃏 Card Collector
            </Link>
          </div>

          {/* Auth */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {currentUserId ? (
              <Link
                href="/dashboard"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-500 hover:text-gray-800 transition-colors hidden sm:block">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Join Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Tab Content ── */}
      {activeTab === "home" ? (
        <ShopSection />
      ) : (
        <CardCollectorSection currentUserId={currentUserId} />
      )}

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-rose-100 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-2xl mb-2">🧶</div>
          <div className="font-bold text-rose-700 mb-1">Craft-A-Holic Mom</div>
          <p className="text-gray-400 text-xs mb-3">Handmade crafts &amp; TCG card collecting — all in one place</p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <a
              href="https://www.tiktok.com/@YOUR_TIKTOK_HERE"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-rose-500 transition-colors"
            >
              TikTok Shop
            </a>
            <span>·</span>
            <Link href="/?tab=cards" className="hover:text-indigo-500 transition-colors">Card Collector</Link>
            <span>·</span>
            <Link href="/login" className="hover:text-gray-600 transition-colors">Sign In</Link>
          </div>
          <p className="text-gray-300 text-xs mt-4">© {new Date().getFullYear()} Craft-A-Holic Mom</p>
        </div>
      </footer>
    </main>
  );
}
