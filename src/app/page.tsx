"use client";

import { useState } from 'react';

export default function Home() {
  const [platform, setPlatform] = useState('');
  const [advertiser, setAdvertiser] = useState('');
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [ads, setAds] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setAds([]);
    setSearched(true);
    try {
      const params = new URLSearchParams({
        platform,
        advertiser,
        keywords,
      });
      const res = await fetch(`/api/ads?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setAds(data.ads || []);
      } else {
        setError(data.error || 'Unknown error');
      }
    } catch (e) {
      setError('Failed to fetch ads.');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full px-2 sm:px-0">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center tracking-tight text-blue-700">Find and Compare Ads Instantly</h1>
      <div className="w-full max-w-xl bg-white p-4 sm:p-8 rounded-2xl shadow-xl flex flex-col items-center border border-blue-100">
        <div className="w-full flex flex-col gap-3 sm:gap-4 mb-8">
          <select
            className="w-full rounded-md border-gray-300 shadow-sm p-3 text-base focus:ring-2 focus:ring-blue-300 transition"
            value={platform}
            onChange={e => setPlatform(e.target.value)}
          >
            <option value="">All Platforms</option>
            <option value="meta">Meta (Facebook & Instagram)</option>
            <option value="linkedin">LinkedIn</option>
            <option value="google">Google Ads</option>
          </select>
          <input
            type="text"
            className="w-full rounded-md border-gray-300 shadow-sm p-3 text-base focus:ring-2 focus:ring-blue-300 transition"
            placeholder="Advertiser name (optional)"
            value={advertiser}
            onChange={e => setAdvertiser(e.target.value)}
            autoComplete="off"
          />
          <input
            type="text"
            className="w-full rounded-md border-gray-300 shadow-sm p-3 text-base focus:ring-2 focus:ring-blue-300 transition"
            placeholder="Keywords in ad text (optional)"
            value={keywords}
            onChange={e => setKeywords(e.target.value)}
            autoComplete="off"
          />
          <button
            className="w-full mt-2 px-4 py-3 bg-blue-600 text-white text-lg font-bold rounded-md hover:bg-blue-700 transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md"
            onClick={handleSearch}
            disabled={loading}
            style={{ minHeight: 48 }}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        <div className="w-full">
          {error && (
            <div className="border rounded-lg p-4 text-center text-red-500 mb-4 bg-red-50 border-red-200">{error}</div>
          )}
          {loading && (
            <div className="border rounded-lg p-4 text-center text-gray-500 mb-4 bg-gray-50 border-gray-200">Loading...</div>
          )}
          {searched && !loading && !error && (
            ads.length === 0 ? (
              <div className="border rounded-lg p-4 text-center text-gray-500 bg-gray-50 border-gray-200">No ads found. Try adjusting your filters.</div>
            ) : (
              <div className="flex flex-col gap-6">
                {ads.map((ad, idx) => (
                  <div
                    key={idx}
                    className="border border-blue-100 rounded-2xl p-5 bg-white shadow-md hover:shadow-2xl transition-all duration-200 ease-in-out cursor-pointer group"
                  >
                    <div className="font-semibold mb-1 break-words text-blue-700 group-hover:underline">{ad.sponsor || ad.advertiser || 'Unknown Advertiser'}</div>
                    <div className="text-base text-gray-800 mb-2 break-words whitespace-pre-line leading-relaxed">{ad.ad_text}</div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-2">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-medium">{ad.platform?.toUpperCase()}</span>
                      {ad.start_date && <span className="bg-gray-100 px-2 py-1 rounded">Start: {ad.start_date}</span>}
                      {ad.media_type && <span className="bg-gray-100 px-2 py-1 rounded">Type: {ad.media_type}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
