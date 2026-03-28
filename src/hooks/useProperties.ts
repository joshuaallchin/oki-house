import { useState, useEffect, useCallback } from 'react';
import { Property, properties as fallbackProperties } from '../data/properties';
import { 
  scrapeProperties, 
  getCachedProperties, 
  setCachedProperties,
} from '../services/scraper';

export type DataSource = 'live' | 'cached' | 'fallback';

export interface UsePropertiesResult {
  properties: Property[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  dataSource: DataSource;
  refresh: () => Promise<void>;
}

export function useProperties(): UsePropertiesResult {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<DataSource>('fallback');

  const loadProperties = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);

    // Check cache first (unless forcing refresh)
    if (!forceRefresh) {
      const cached = getCachedProperties();
      if (cached && cached.properties.length > 0) {
        // Check if cache is less than 1 hour old
        const cacheAge = Date.now() - new Date(cached.lastUpdated).getTime();
        const oneHour = 60 * 60 * 1000;
        
        if (cacheAge < oneHour) {
          console.log('Using cached properties');
          setProperties(cached.properties);
          setLastUpdated(cached.lastUpdated);
          setDataSource('cached');
          setIsLoading(false);
          return;
        }
      }
    }

    try {
      console.log('Fetching live properties...');
      const result = await scrapeProperties();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (result.properties.length > 0) {
        setProperties(result.properties);
        setLastUpdated(result.lastUpdated);
        setDataSource('live');
        
        // Cache the results
        setCachedProperties({
          properties: result.properties,
          lastUpdated: result.lastUpdated,
        });
      } else {
        // No properties found, try cache
        const cached = getCachedProperties();
        if (cached && cached.properties.length > 0) {
          setProperties(cached.properties);
          setLastUpdated(cached.lastUpdated);
          setDataSource('cached');
          setError('Could not fetch live data, showing cached results');
        } else {
          // Fall back to hardcoded data
          setProperties(fallbackProperties);
          setLastUpdated(null);
          setDataSource('fallback');
          setError('No data found - showing sample data');
        }
      }
    } catch (err) {
      console.error('Failed to load properties:', err);
      
      // Try cache first
      const cached = getCachedProperties();
      if (cached && cached.properties.length > 0) {
        setProperties(cached.properties);
        setLastUpdated(cached.lastUpdated);
        setDataSource('cached');
        setError(`Live fetch failed: ${err instanceof Error ? err.message : 'Unknown error'}. Showing cached data.`);
      } else {
        // Fall back to hardcoded data
        setProperties(fallbackProperties);
        setLastUpdated(null);
        setDataSource('fallback');
        const errMsg = err instanceof Error ? err.message : 'Unknown error';
        // Simplify error message for display
        const shortError = errMsg.includes('All proxies failed') 
          ? 'Could not connect to source' 
          : errMsg.substring(0, 50);
        setError(`${shortError} - showing sample data`);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadProperties(true);
  }, [loadProperties]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  return {
    properties,
    isLoading,
    error,
    lastUpdated,
    dataSource,
    refresh,
  };
}
