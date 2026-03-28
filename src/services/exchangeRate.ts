// Exchange rate service using Frankfurter API (free, no API key needed)

const CACHE_KEY = 'okinoshima-exchange-rate';
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
const FALLBACK_RATE = 150; // Fallback rate if API fails

interface CachedRate {
  rate: number;
  timestamp: number;
}

interface FrankfurterResponse {
  amount: number;
  base: string;
  date: string;
  rates: {
    JPY?: number;
    USD?: number;
  };
}

// Fetch current USD to JPY exchange rate
export async function fetchExchangeRate(): Promise<number> {
  // Check cache first
  const cached = getCachedRate();
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Using cached exchange rate:', cached.rate);
    return cached.rate;
  }

  try {
    // Frankfurter API - free, no key needed
    const response = await fetch(
      'https://api.frankfurter.app/latest?from=USD&to=JPY',
      { 
        signal: AbortSignal.timeout(5000) // 5 second timeout
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: FrankfurterResponse = await response.json();
    
    if (data.rates?.JPY) {
      const rate = data.rates.JPY;
      console.log('Fetched fresh exchange rate:', rate);
      setCachedRate(rate);
      return rate;
    }
    
    throw new Error('No JPY rate in response');
  } catch (error) {
    console.warn('Failed to fetch exchange rate:', error);
    
    // Return cached rate even if expired, or fallback
    if (cached) {
      console.log('Using expired cached rate:', cached.rate);
      return cached.rate;
    }
    
    console.log('Using fallback rate:', FALLBACK_RATE);
    return FALLBACK_RATE;
  }
}

function getCachedRate(): CachedRate | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    return JSON.parse(cached);
  } catch {
    return null;
  }
}

function setCachedRate(rate: number): void {
  try {
    const data: CachedRate = {
      rate,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to cache exchange rate:', error);
  }
}

// Get the current rate (from cache or fallback, without fetching)
export function getCurrentRate(): number {
  const cached = getCachedRate();
  return cached?.rate ?? FALLBACK_RATE;
}

// Check if rate is from live API or fallback
export function isRateLive(): boolean {
  const cached = getCachedRate();
  if (!cached) return false;
  return Date.now() - cached.timestamp < CACHE_DURATION;
}

// Get rate age in minutes
export function getRateAge(): number | null {
  const cached = getCachedRate();
  if (!cached) return null;
  return Math.round((Date.now() - cached.timestamp) / 60000);
}
