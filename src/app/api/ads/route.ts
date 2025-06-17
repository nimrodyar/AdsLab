import { NextRequest, NextResponse } from 'next/server';

const META_ADS_TOKEN = process.env.META_ADS_TOKEN;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_APP = process.env.RAPIDAPI_APP;

async function fetchMetaAds({ keywords, advertiser }: { keywords: string; advertiser: string }) {
  if (!META_ADS_TOKEN) return { ads: [], error: 'Meta API token missing' };
  const params = new URLSearchParams({
    access_token: META_ADS_TOKEN,
    ad_reached_countries: 'ALL',
    fields: 'ad_creative_body,ad_creative_link_caption,ad_creative_link_description,ad_creative_link_title,ad_delivery_start_time,ad_delivery_stop_time,ad_snapshot_url,bylines,currency,demographic_distribution,delivery_by_region,impressions,media_url,page_id,page_name,platform,spend,ad_creative_media_type',
    limit: '10',
  });
  if (keywords) params.append('q', keywords);
  if (advertiser) params.append('search_terms', advertiser);
  const url = `https://graph.facebook.com/v19.0/ads_archive?${params.toString()}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) return { ads: [], error: data.error?.message || 'Meta API error' };
  const ads = (data.data || []).map((ad: any) => ({
    ad_text: ad.ad_creative_body || ad.ad_creative_link_description || '',
    sponsor: ad.page_name || '',
    platform: 'meta',
    start_date: ad.ad_delivery_start_time || '',
    media_type: ad.ad_creative_media_type || '',
    image: ad.media_url || '',
    link: ad.ad_snapshot_url || '',
  }));
  return { ads };
}

async function fetchLinkedInAds({ keywords, advertiser }: { keywords: string; advertiser: string }) {
  if (!RAPIDAPI_KEY) return { ads: [], error: 'RapidAPI key missing' };
  const url = `https://linkedin-api8.p.rapidapi.com/search-ads?keywords=${encodeURIComponent(keywords || advertiser)}`;
  const res = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY!,
      'X-RapidAPI-Host': 'linkedin-api8.p.rapidapi.com',
    },
  });
  const data = await res.json();
  if (!res.ok) return { ads: [], error: data.error || 'LinkedIn API error' };
  const ads = (data.ads || data.results || []).map((ad: any) => ({
    ad_text: ad.text || ad.description || '',
    sponsor: ad.companyName || ad.sponsor || '',
    platform: 'linkedin',
    start_date: ad.startDate || '',
    media_type: ad.mediaType || '',
    image: ad.imageUrl || '',
    link: ad.url || '',
  }));
  return { ads };
}

async function fetchGoogleAds({ keywords }: { keywords: string }) {
  if (!RAPIDAPI_KEY) return { ads: [], error: 'RapidAPI key missing' };
  const url = `https://google-ads-transparency-report.p.rapidapi.com/search?query=${encodeURIComponent(keywords)}`;
  const res = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY!,
      'X-RapidAPI-Host': 'google-ads-transparency-report.p.rapidapi.com',
    },
  });
  const data = await res.json();
  if (!res.ok) return { ads: [], error: data.error || 'Google API error' };
  const ads = (data.ads || data.results || []).map((ad: any) => ({
    ad_text: ad.text || ad.description || '',
    sponsor: ad.advertiser || '',
    platform: 'google',
    start_date: ad.startDate || '',
    media_type: ad.mediaType || '',
    image: ad.imageUrl || '',
    link: ad.url || '',
  }));
  return { ads };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const platform = searchParams.get('platform') || '';
  const advertiser = searchParams.get('advertiser') || '';
  const keywords = searchParams.get('keywords') || '';

  try {
    if (platform === 'meta') {
      const { ads, error } = await fetchMetaAds({ keywords, advertiser });
      return NextResponse.json({ ads, error });
    }
    if (platform === 'linkedin') {
      const { ads, error } = await fetchLinkedInAds({ keywords, advertiser });
      return NextResponse.json({ ads, error });
    }
    if (platform === 'google') {
      const { ads, error } = await fetchGoogleAds({ keywords });
      return NextResponse.json({ ads, error });
    }
    // If no platform, aggregate all
    const [meta, linkedin, google] = await Promise.all([
      fetchMetaAds({ keywords, advertiser }),
      fetchLinkedInAds({ keywords, advertiser }),
      fetchGoogleAds({ keywords }),
    ]);
    return NextResponse.json({
      ads: [...(meta.ads || []), ...(linkedin.ads || []), ...(google.ads || [])],
      errors: { meta: meta.error, linkedin: linkedin.error, google: google.error },
    });
  } catch (e) {
    return NextResponse.json({ ads: [], error: 'API error', debug: String(e) }, { status: 500 });
  }
} 