// Scraper service to fetch live data from Okinoshima akiya bank
import { Property } from '../data/properties';

const BASE_URL = 'https://www.town.okinoshima.shimane.jp';
// Important: use ?ck=1 so pagination with &page=X works correctly
const LISTING_URL = `${BASE_URL}/cgi-bin/recruit.php/1/list/?ck=1`;

// CORS proxies - we'll try multiple in case one fails
const CORS_PROXIES = [
  // allorigins - returns JSON with contents field, most reliable
  (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  // allorigins raw endpoint
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  // corsproxy.io 
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  // cors.sh - another option
  (url: string) => `https://proxy.cors.sh/${url}`,
  // thingproxy
  (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`,
];

// District coordinates (approximate centers for geocoding fallback)
const DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
  '西郷地区（南部）': { lat: 36.2085, lng: 133.3260 },
  '西郷地区（北部）': { lat: 36.2280, lng: 133.3120 },
  '西郷地区（西部）': { lat: 36.1850, lng: 133.2620 },
  '西郷地区（東部）': { lat: 36.2150, lng: 133.3400 },
  '五箇地区': { lat: 36.2400, lng: 133.2000 },
  '都万地区': { lat: 36.1680, lng: 133.2800 },
  '布施地区': { lat: 36.2600, lng: 133.2700 },
  '中村地区': { lat: 36.2100, lng: 133.2400 },
};

// Location-specific coordinate offsets for variety
const LOCATION_OFFSETS: Record<string, { lat: number; lng: number }> = {
  '西町': { lat: 0.002, lng: -0.002 },
  '東町': { lat: -0.001, lng: 0.003 },
  '港町': { lat: -0.002, lng: -0.001 },
  '栄町': { lat: -0.003, lng: 0.004 },
  '中町': { lat: 0.001, lng: 0.001 },
  '有木': { lat: 0.003, lng: -0.003 },
  '今津': { lat: 0.002, lng: 0.002 },
  '都万': { lat: 0.001, lng: 0.002 },
  '久見': { lat: 0.005, lng: -0.010 },
  '津戸': { lat: -0.004, lng: -0.003 },
  '池田': { lat: 0.002, lng: -0.001 },
  '平': { lat: 0.004, lng: -0.002 },
  '郡': { lat: -0.002, lng: 0.005 },
  '岬町': { lat: 0.003, lng: -0.005 },
  '城北町': { lat: 0.004, lng: 0.003 },
  '原田': { lat: 0.006, lng: -0.004 },
  '下西': { lat: -0.005, lng: 0.001 },
  '加茂': { lat: -0.006, lng: -0.008 },
  '大久': { lat: 0.003, lng: 0.010 },
  '北方': { lat: 0.008, lng: -0.012 },
  '那久': { lat: -0.003, lng: 0.004 },
  '油井': { lat: -0.008, lng: 0.003 },
  '飯美': { lat: 0.010, lng: 0.005 },
  '飯田': { lat: 0.012, lng: 0.008 },
  '中村': { lat: 0.002, lng: -0.006 },
  '元屋': { lat: -0.004, lng: -0.002 },
  '湊': { lat: 0.006, lng: 0.002 },
  '西村': { lat: -0.002, lng: 0.006 },
};

async function fetchWithProxy(url: string): Promise<string> {
  const errors: string[] = [];
  
  for (const getProxyUrl of CORS_PROXIES) {
    const proxyUrl = getProxyUrl(url);
    try {
      console.log(`Trying proxy: ${proxyUrl.substring(0, 50)}...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
      
      const response = await fetch(proxyUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      let text = await response.text();
      
      // Handle allorigins /get endpoint which returns JSON
      if (proxyUrl.includes('allorigins.win/get')) {
        try {
          const json = JSON.parse(text);
          text = json.contents || text;
        } catch {
          // Not JSON, use as-is
        }
      }
      
      // Verify we got HTML content
      if (text.includes('recruit.php') || text.includes('空き家') || text.includes('<table')) {
        console.log('Successfully fetched HTML content');
        return text;
      } else {
        throw new Error('Response does not appear to contain expected content');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`${proxyUrl.substring(0, 30)}: ${errorMsg}`);
      console.warn(`Proxy failed:`, errorMsg);
      continue;
    }
  }
  
  throw new Error(`All proxies failed: ${errors.join('; ')}`);
}

function getCoordinates(district: string, location: string, id: number): { lat: number; lng: number } {
  const base = DISTRICT_COORDS[district] || { lat: 36.21, lng: 133.31 };
  const offset = LOCATION_OFFSETS[location] || { lat: 0, lng: 0 };
  
  // Use property ID to create consistent but varied positions
  const idJitter = {
    lat: ((id * 7) % 100 - 50) * 0.00004,
    lng: ((id * 13) % 100 - 50) * 0.00004,
  };
  
  return {
    lat: base.lat + offset.lat + idJitter.lat,
    lng: base.lng + offset.lng + idJitter.lng,
  };
}

export interface ScrapeResult {
  properties: Property[];
  lastUpdated: string;
  error?: string;
}

// Parse properties from HTML
function parsePageProperties(html: string, seenIds: Set<number>): Property[] {
  const properties: Property[] = [];
  
  // Find all property blocks - each property is in a div with class containing entry
  // Use regex to find detail links and extract the ID
  const detailLinkPattern = /href="\/cgi-bin\/recruit\.php\/1\/detail\/(\d+)\?ck=1"[^>]*>([^<]+)</g;
  const detailMatches = [...html.matchAll(detailLinkPattern)];
  
  console.log(`Found ${detailMatches.length} detail links`);
  
  for (const match of detailMatches) {
    const id = parseInt(match[1], 10);
    const listingCode = match[2].trim();
    
    if (seenIds.has(id)) continue;
    seenIds.add(id);
    
    // Find the context around this property - look for the entry block
    const idIndex = html.indexOf(`/detail/${id}?`);
    if (idIndex === -1) continue;
    
    // Get a chunk of HTML around this property (before and after)
    const startIndex = Math.max(0, idIndex - 200);
    const endIndex = Math.min(html.length, idIndex + 2500);
    const context = html.substring(startIndex, endIndex);
    
    // Extract image URL - look for the full image path
    let imageUrl = '';
    // Try multiple patterns for image URLs
    const imgPatterns = [
      // Pattern 1: Full URL with protocol-relative path //www.town...
      /src="(\/\/www\.town\.okinoshima\.shimane\.jp\/material\/recruit\/1\/\d+\/[^"]+\.(jpg|jpeg|png|gif))"/i,
      // Pattern 2: Full URL with https
      /src="(https:\/\/www\.town\.okinoshima\.shimane\.jp\/material\/recruit\/1\/\d+\/[^"]+\.(jpg|jpeg|png|gif))"/i,
      // Pattern 3: Relative path starting with /material
      /src="(\/material\/recruit\/1\/\d+\/[^"]+\.(jpg|jpeg|png|gif))"/i,
      // Pattern 4: Any .jpg/.png in material/recruit path
      /material\/recruit\/1\/(\d+)\/(\d+\.(jpg|jpeg|png|gif))/i,
    ];
    
    for (const pattern of imgPatterns) {
      const imgMatch = context.match(pattern);
      if (imgMatch) {
        const matched = imgMatch[1];
        // Handle different URL formats
        if (matched.startsWith('//')) {
          imageUrl = 'https:' + matched;
        } else if (matched.startsWith('/material')) {
          imageUrl = BASE_URL + matched;
        } else if (matched.startsWith('http')) {
          imageUrl = matched;
        } else {
          // Pattern 4 captures filename differently
          imageUrl = `${BASE_URL}/material/recruit/1/${imgMatch[1]}/${imgMatch[2]}`;
        }
        console.log(`Found image for ${id}: ${imageUrl.substring(0, 80)}...`);
        break;
      }
    }
    
    if (!imageUrl) {
      console.log(`No image found for property ${id}`);
      imageUrl = ''; // Will trigger fallback display
    }
    
    // Parse other fields
    const isNegotiating = context.includes('商談中');
    const hasShop = context.includes('店舗付き');
    const isLand = context.includes('>空き地<') || (context.includes('空き地') && !context.includes('空き家'));
    const type: Property['type'] = hasShop ? '空き家・店舗付き' : isLand ? '空き地' : '空き家';
    const transactionType: Property['transactionType'] = context.includes('>賃貸<') ? '賃貸' : '売買';
    
    // Extract district
    let district = '西郷地区（南部）';
    for (const d of Object.keys(DISTRICT_COORDS)) {
      if (context.includes(d)) {
        district = d;
        break;
      }
    }
    
    // Extract location - look in the table cells
    let location = '';
    const locationMatch = context.match(/>所在地[^<]*<\/th>\s*<td>([^<]+)</);
    if (locationMatch) {
      location = locationMatch[1].trim();
    } else {
      for (const loc of Object.keys(LOCATION_OFFSETS)) {
        if (context.includes(`>${loc}<`) || context.includes(`<td>${loc}</td>`)) {
          location = loc;
          break;
        }
      }
    }
    
    // Extract price
    let priceMan = 0;
    let priceRaw = '価格要問合せ';
    const priceMatch = context.match(/>価格<\/th>\s*<td>([^<]+)</);
    if (priceMatch) {
      priceRaw = priceMatch[1].trim();
      const numMatch = priceRaw.match(/([\d,]+)/);
      if (numMatch) {
        priceMan = parseInt(numMatch[1].replace(/,/g, ''), 10);
      }
    }
    
    // Extract layout
    let layout: string | undefined;
    const layoutMatch = context.match(/>間取り<\/th>\s*<td>([^<]+)</);
    if (layoutMatch) {
      layout = layoutMatch[1].trim();
    }
    
    // Extract description
    let description = `${type}物件`;
    const descMatch = context.match(/<dt>物件ポイント<\/dt>\s*<dd>([^<]+)</);
    if (descMatch) {
      description = descMatch[1].trim();
    }
    
    // Extract contact
    let contact = '隠岐の島町役場　電話番号：08512-2-8570';
    const contactMatch = context.match(/>申し込み[^<]*<\/th>\s*<td>([^<]+(?:<br[^>]*>[^<]+)*)/);
    if (contactMatch) {
      contact = contactMatch[1].replace(/<br[^>]*>/g, ' ').trim();
    }
    
    // Extract PDF URL - try to find it in context
    let pdfUrl = '';
    
    // Try to find PDF URL in the listing context
    // The PDF links look like: href="//www.town.okinoshima.shimane.jp/material/recruit/1/ID/FILENAME.pdf"
    const pdfPatterns = [
      // Protocol-relative PDF URL
      new RegExp(`href="(//www\\.town\\.okinoshima\\.shimane\\.jp/material/recruit/1/${id}/[^"]+\\.pdf)"`, 'i'),
      // HTTPS PDF URL
      new RegExp(`href="(https://www\\.town\\.okinoshima\\.shimane\\.jp/material/recruit/1/${id}/[^"]+\\.pdf)"`, 'i'),
      // Relative PDF path
      new RegExp(`href="(/material/recruit/1/${id}/[^"]+\\.pdf)"`, 'i'),
      // Generic PDF pattern for this property
      new RegExp(`material/recruit/1/${id}/(\\d+\\.pdf)`, 'i'),
    ];
    
    for (const pattern of pdfPatterns) {
      const pdfMatch = context.match(pattern);
      if (pdfMatch) {
        const matched = pdfMatch[1];
        if (matched.startsWith('//')) {
          pdfUrl = 'https:' + matched;
        } else if (matched.startsWith('/material')) {
          pdfUrl = BASE_URL + matched;
        } else if (matched.startsWith('http')) {
          pdfUrl = matched;
        } else {
          // Filename only - construct full URL
          pdfUrl = `${BASE_URL}/material/recruit/1/${id}/${matched}`;
        }
        console.log(`Found PDF for ${id}: ${pdfUrl.substring(0, 80)}...`);
        break;
      }
    }
    
    // If no PDF found in listing, construct from image URL pattern
    if (!pdfUrl) {
      if (imageUrl && imageUrl.includes('/material/recruit/')) {
        // Image URLs are like: .../material/recruit/1/ID/TIMESTAMP.jpg
        // PDF URLs are like:   .../material/recruit/1/ID/TIMESTAMP.pdf
        // They have different timestamps, so we can't just swap extensions
        // Instead, link to the detail page where users can find the PDF
        pdfUrl = `${BASE_URL}/cgi-bin/recruit.php/1/detail/${id}?ck=1`;
        console.log(`No PDF found for ${id}, using detail page URL`);
      } else {
        pdfUrl = `${BASE_URL}/cgi-bin/recruit.php/1/detail/${id}?ck=1`;
        console.log(`No PDF found for ${id}, using detail page URL`);
      }
    }
    
    // Get coordinates
    const coords = getCoordinates(district, location, id);
    
    const property: Property = {
      id,
      listingCode,
      type,
      transactionType,
      isNegotiating,
      district,
      location: location || '西郷',
      priceMan,
      priceRaw,
      layout,
      description,
      contact,
      imageUrl,
      pdfUrl,
      lat: coords.lat,
      lng: coords.lng,
    };
    
    properties.push(property);
  }
  
  return properties;
}

export async function scrapeProperties(): Promise<ScrapeResult> {
  const allProperties: Property[] = [];
  const seenIds = new Set<number>();
  const maxPages = 10; // Safety limit
  
  try {
    console.log('Fetching all listing pages...');
    
    // Fetch all pages
    for (let page = 1; page <= maxPages; page++) {
      // Use &page=X for pagination (works because base URL has ?ck=1)
      const pageUrl = page === 1 ? LISTING_URL : `${LISTING_URL}&page=${page}`;
      console.log(`Fetching page ${page}: ${pageUrl}`);
      
      try {
        const html = await fetchWithProxy(pageUrl);
        
        const pageProperties = parsePageProperties(html, seenIds);
        console.log(`Found ${pageProperties.length} properties on page ${page}`);
        
        if (pageProperties.length === 0) {
          console.log(`No properties on page ${page}, stopping pagination`);
          break;
        }
        
        allProperties.push(...pageProperties);
        
        // If we got fewer than 20 properties, we've likely reached the last page
        if (pageProperties.length < 20) {
          console.log(`Page ${page} has fewer than 20 properties, assuming last page`);
          break;
        }
        
        // Small delay between requests to be nice to the server
        if (page < maxPages) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      } catch (pageError) {
        console.warn(`Failed to fetch page ${page}:`, pageError);
        // If we already have some properties, continue with what we have
        if (allProperties.length > 0) {
          console.log(`Continuing with ${allProperties.length} properties from previous pages`);
          break;
        }
        throw pageError;
      }
    }
    
    console.log(`Total scraped: ${allProperties.length} properties`);
    
    if (allProperties.length === 0) {
      return {
        properties: [],
        lastUpdated: new Date().toISOString(),
        error: 'No properties found - page structure may have changed',
      };
    }
    
    return {
      properties: allProperties,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Scrape error:', error);
    return {
      properties: [],
      lastUpdated: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Storage key for cached data
const CACHE_KEY = 'okinoshima-properties-cache';

export interface CachedData {
  properties: Property[];
  lastUpdated: string;
}

export function getCachedProperties(): CachedData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    return JSON.parse(cached);
  } catch {
    return null;
  }
}

export function setCachedProperties(data: CachedData): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to cache properties:', error);
  }
}

// PDF URL cache so we don't re-fetch the same detail page
const pdfCache: Record<number, string> = {};

/**
 * Lazily fetch the real PDF URL for a property by scraping its detail page.
 * Results are cached in memory for the session.
 */
export async function fetchPdfUrl(propertyId: number): Promise<string> {
  if (pdfCache[propertyId]) return pdfCache[propertyId];

  const detailUrl = `${BASE_URL}/cgi-bin/recruit.php/1/detail/${propertyId}?ck=1`;

  try {
    const html = await fetchWithProxy(detailUrl);

    // The PDF link looks like:
    // href="//www.town.okinoshima.shimane.jp/material/recruit/1/ID/TIMESTAMP.pdf"
    const patterns = [
      /href="(\/\/www\.town\.okinoshima\.shimane\.jp\/material\/recruit\/1\/\d+\/[^"]+\.pdf)"/i,
      /href="(https:\/\/www\.town\.okinoshima\.shimane\.jp\/material\/recruit\/1\/\d+\/[^"]+\.pdf)"/i,
      /href="(\/material\/recruit\/1\/\d+\/[^"]+\.pdf)"/i,
    ];

    for (const pattern of patterns) {
      const m = html.match(pattern);
      if (m) {
        let url = m[1];
        if (url.startsWith('//')) url = 'https:' + url;
        else if (url.startsWith('/material')) url = BASE_URL + url;
        pdfCache[propertyId] = url;
        console.log(`PDF for ${propertyId}: ${url}`);
        return url;
      }
    }
  } catch (e) {
    console.warn(`Could not fetch detail page for property ${propertyId}:`, e);
  }

  // Fall back to the detail page itself so the user can find the PDF link
  return detailUrl;
}
