"use client";
import { PRODUCT_BUCKETS, TIKTOK_URL, type Product } from "@/lib/shopData";

export default function ShopSection() {
  return (
    <div className="flex-1">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 border-b border-rose-100 py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="text-5xl mb-4">🧶✨🎨</div>
          <h1 className="text-4xl md:text-5xl font-bold text-rose-700 mb-3 leading-tight">
            Craft-A-Holic Mom
          </h1>
          <p className="text-lg text-rose-500 font-medium mb-2">Handmade with love, one creation at a time</p>
          <p className="text-gray-500 text-sm max-w-xl mx-auto mb-8">
            Resin crafts, custom tumblers, sublimation prints, TCG accessories &amp; seasonal gifts —
            all handcrafted and available on TikTok Shop.
          </p>
          <a
            href={TIKTOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-rose-500 hover:bg-rose-400 text-white rounded-2xl font-bold text-lg transition-colors shadow-lg"
          >
            <TikTokIcon />
            Shop on TikTok
          </a>
        </div>
      </div>

      {/* Product Buckets */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">My Creations</h2>
          <p className="text-gray-400 text-sm">Click any product to shop on TikTok</p>
        </div>

        <div className="space-y-12">
          {PRODUCT_BUCKETS.map((bucket) => (
            <section key={bucket.id}>
              {/* Bucket header */}
              <div className={`rounded-2xl border ${bucket.color} px-6 py-4 mb-5 flex items-center gap-3`}>
                <span className="text-3xl">{bucket.icon}</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{bucket.title}</h3>
                  <p className="text-sm text-gray-500">{bucket.description}</p>
                </div>
              </div>

              {/* Products grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {bucket.products.map((product) => (
                  <ProductCard key={product.id} product={product} bucketColor={bucket.color} />
                ))}
                {/* Empty add-slot */}
                <AddProductSlot bucketId={bucket.id} />
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-8 text-center">
          <div className="text-3xl mb-3">🛍️</div>
          <h3 className="text-xl font-bold text-rose-700 mb-2">Want to order something custom?</h3>
          <p className="text-gray-500 text-sm mb-5">DM me on TikTok for custom orders, bulk pricing, or special requests!</p>
          <a
            href={TIKTOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-400 text-white rounded-xl font-semibold transition-colors"
          >
            <TikTokIcon />
            Message me on TikTok
          </a>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, bucketColor }: { product: Product; bucketColor: string }) {
  const isEmpty = !product.imageUrl && product.badge === "COMING SOON";

  const inner = (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer">
      {/* Image area */}
      <div className="aspect-square bg-gray-50 relative overflow-hidden">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-200">
            <span className="text-3xl opacity-30">📷</span>
            <span className="text-xs text-gray-300 font-medium">Photo coming soon</span>
          </div>
        )}
        {product.badge && (
          <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full ${
            product.badge === "NEW" ? "bg-green-500 text-white" :
            product.badge === "SOLD OUT" ? "bg-gray-500 text-white" :
            product.badge === "POPULAR" ? "bg-orange-500 text-white" :
            "bg-gray-200 text-gray-500"
          }`}>
            {product.badge}
          </span>
        )}
        {!isEmpty && (
          <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="bg-white text-rose-600 font-semibold text-xs px-3 py-1.5 rounded-full shadow flex items-center gap-1">
              <TikTokIcon small /> Shop Now
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="font-semibold text-gray-800 text-sm truncate">{product.name}</div>
        {product.description && (
          <div className="text-xs text-gray-400 truncate mt-0.5">{product.description}</div>
        )}
        {product.price && (
          <div className="text-sm font-bold text-rose-600 mt-1">{product.price}</div>
        )}
      </div>
    </div>
  );

  if (isEmpty) return <div>{inner}</div>;

  return (
    <a
      href={product.tiktokUrl || TIKTOK_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      {inner}
    </a>
  );
}

function AddProductSlot({ bucketId }: { bucketId: string }) {
  return (
    <div
      className="bg-white border-2 border-dashed border-gray-200 rounded-2xl aspect-square flex flex-col items-center justify-center gap-2 text-gray-300 hover:border-rose-300 hover:text-rose-300 transition-colors cursor-default"
      title={`Add a product to the ${bucketId} bucket in src/lib/shopData.ts`}
    >
      <span className="text-3xl">+</span>
      <span className="text-xs text-center px-2 leading-tight">Add product<br />in shopData.ts</span>
    </div>
  );
}

function TikTokIcon({ small }: { small?: boolean }) {
  const size = small ? "w-3 h-3" : "w-5 h-5";
  return (
    <svg className={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.73a4.85 4.85 0 01-1.01-.04z"/>
    </svg>
  );
}
