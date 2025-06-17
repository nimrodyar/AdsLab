import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

const MOCK_ADS = [
  {
    ad_text: 'Meta ad example about shoes',
    sponsor: 'Meta',
    platform: 'meta',
    start_date: '2024-06-01',
    media_type: 'image',
    advertiser: 'Meta',
    keywords: 'shoes',
  },
  {
    ad_text: 'LinkedIn ad for B2B marketing',
    sponsor: 'LinkedIn',
    platform: 'linkedin',
    start_date: '2024-06-02',
    media_type: 'image',
    advertiser: 'LinkedIn',
    keywords: 'B2B',
  },
  {
    ad_text: 'Google ad about shopping deals',
    sponsor: 'Google',
    platform: 'google',
    start_date: '2024-06-03',
    media_type: 'video',
    advertiser: 'Google',
    keywords: 'shopping',
  },
  {
    ad_text: 'Meta ad for summer sales',
    sponsor: 'Meta',
    platform: 'meta',
    start_date: '2024-06-04',
    media_type: 'carousel',
    advertiser: 'Meta',
    keywords: 'summer',
  },
  {
    ad_text: 'LinkedIn ad for hiring',
    sponsor: 'LinkedIn',
    platform: 'linkedin',
    start_date: '2024-06-05',
    media_type: 'image',
    advertiser: 'LinkedIn',
    keywords: 'hiring',
  },
  {
    ad_text: 'Google ad for travel',
    sponsor: 'Google',
    platform: 'google',
    start_date: '2024-06-06',
    media_type: 'image',
    advertiser: 'Google',
    keywords: 'travel',
  },
];

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeMetaAds({ keywords, advertiser }: { keywords: string; advertiser: string }) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const searchUrl = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=${encodeURIComponent(
    keywords || advertiser
  )}&search_type=keyword_unordered`;
  await page.goto(searchUrl, { waitUntil: 'networkidle2' });
  await delay(3000);
  const ads = await page.evaluate(() => {
    const adNodes = document.querySelectorAll('[data-testid="ad-preview"]');
    return Array.from(adNodes).map((ad: any) => {
      const adText = ad.innerText || '';
      const sponsor = ad.querySelector('[data-testid="ad-sponsor"]')?.innerText || '';
      const startDate = ad.innerText.match(/Started running on (\w+ \d+, \d+)/)?.[1] || '';
      return {
        ad_text: adText,
        sponsor,
        platform: 'meta',
        start_date: startDate,
        media_type: 'unknown',
      };
    });
  });
  await browser.close();
  return ads;
}

async function scrapeLinkedInAds({ advertiser }: { advertiser: string }) {
  if (!advertiser) return [];
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  // LinkedIn company ad transparency page
  const company = advertiser.replace(/ /g, '').toLowerCase();
  const url = `https://www.linkedin.com/company/${company}/ads/`;
  await page.goto(url, { waitUntil: 'networkidle2' });
  await delay(3000);
  const ads = await page.evaluate(() => {
    const adNodes = document.querySelectorAll('.ad-review-card');
    return Array.from(adNodes).map((ad: any) => {
      const adText = ad.innerText || '';
      const sponsor = document.querySelector('h1')?.innerText || '';
      return {
        ad_text: adText,
        sponsor,
        platform: 'linkedin',
        start_date: '',
        media_type: 'unknown',
      };
    });
  });
  await browser.close();
  return ads;
}

async function scrapeGoogleAds({ keywords }: { keywords: string }) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const url = `https://adstransparency.google.com/ads/search?query=${encodeURIComponent(keywords)}`;
  await page.goto(url, { waitUntil: 'networkidle2' });
  await delay(5000);
  const ads = await page.evaluate(() => {
    const adNodes = document.querySelectorAll('div[data-test-id="ad-card"]');
    return Array.from(adNodes).map((ad: any) => {
      const adText = ad.innerText || '';
      const sponsor = ad.querySelector('[data-test-id="ad-card-advertiser-name"]')?.innerText || '';
      return {
        ad_text: adText,
        sponsor,
        platform: 'google',
        start_date: '',
        media_type: 'unknown',
      };
    });
  });
  await browser.close();
  return ads;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const platform = searchParams.get('platform') || '';
  const advertiser = searchParams.get('advertiser')?.toLowerCase() || '';
  const keywords = searchParams.get('keywords')?.toLowerCase() || '';

  try {
    if (platform === 'meta') {
      const ads = await scrapeMetaAds({ keywords, advertiser });
      return NextResponse.json({ ads });
    }
    if (platform === 'linkedin') {
      const ads = await scrapeLinkedInAds({ advertiser });
      return NextResponse.json({ ads });
    }
    if (platform === 'google') {
      const ads = await scrapeGoogleAds({ keywords });
      return NextResponse.json({ ads });
    }
    // If no platform, aggregate all
    const [meta, linkedin, google] = await Promise.all([
      scrapeMetaAds({ keywords, advertiser }),
      scrapeLinkedInAds({ advertiser }),
      scrapeGoogleAds({ keywords }),
    ]);
    return NextResponse.json({ ads: [...meta, ...linkedin, ...google] });
  } catch (e) {
    return NextResponse.json({ ads: [], error: 'Scraping error' }, { status: 500 });
  }
} 