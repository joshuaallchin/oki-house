import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchExchangeRate, getCurrentRate, isRateLive, getRateAge } from './services/exchangeRate';

export type Language = 'ja' | 'en';

// Default fallback rate
const DEFAULT_RATE = 150;

// Dynamic exchange rate state
let currentExchangeRate = getCurrentRate() || DEFAULT_RATE;
let exchangeRateListeners: ((rate: number) => void)[] = [];

// Initialize exchange rate on module load
fetchExchangeRate().then(rate => {
  currentExchangeRate = rate;
  exchangeRateListeners.forEach(listener => listener(rate));
});

// Subscribe to rate updates
export function subscribeToExchangeRate(listener: (rate: number) => void): () => void {
  exchangeRateListeners.push(listener);
  return () => {
    exchangeRateListeners = exchangeRateListeners.filter(l => l !== listener);
  };
}

// Refresh exchange rate
export async function refreshExchangeRate(): Promise<number> {
  const rate = await fetchExchangeRate();
  currentExchangeRate = rate;
  exchangeRateListeners.forEach(listener => listener(rate));
  return rate;
}

// Get exchange rate info for display
export function getExchangeRateInfo(): { rate: number; isLive: boolean; ageMinutes: number | null } {
  return {
    rate: currentExchangeRate,
    isLive: isRateLive(),
    ageMinutes: getRateAge(),
  };
}

export function formatPrice(priceInManYen: number, language: Language, exchangeRate?: number): string {
  const rate = exchangeRate ?? currentExchangeRate;
  const yenAmount = priceInManYen * 10000;
  const usdAmount = Math.round(yenAmount / rate);
  
  if (language === 'ja') {
    return `${priceInManYen.toLocaleString()}万円 ($${usdAmount.toLocaleString()})`;
  } else {
    return `¥${priceInManYen.toLocaleString()}万 ($${usdAmount.toLocaleString()})`;
  }
}

export function formatRentPrice(monthlyRent: number, language: Language, exchangeRate?: number): string {
  const rate = exchangeRate ?? currentExchangeRate;
  const usdAmount = Math.round((monthlyRent * 10000) / rate);
  
  if (language === 'ja') {
    return `${monthlyRent}万円/月 ($${usdAmount.toLocaleString()}/mo)`;
  } else {
    return `¥${monthlyRent}万/mo ($${usdAmount.toLocaleString()}/mo)`;
  }
}

type TranslationKey = keyof typeof translations.ja;

const translations = {
  ja: {
    // App title
    appTitle: '隠岐の島 家探し',
    appSubtitle: '空き家・空き地バンク検索',
    
    // View modes
    splitView: '分割',
    mapView: '地図',
    listView: '一覧',
    
    // Filters
    search: '検索...',
    searchPlaceholder: 'ID、場所、説明で検索...',
    allTypes: 'すべて',
    houses: '空き家のみ',
    land: '空き地のみ',
    sortBy: '並び替え',
    sortNewest: '新着順',
    sortPriceAsc: '価格: 安い順',
    sortPriceDesc: '価格: 高い順',
    maxPrice: '上限価格',
    favoritesOnly: 'お気に入りのみ',
    availableOnly: '交渉可のみ',
    clearFilters: 'フィルターをクリア',
    
    // Property types
    house: '空き家',
    vacantLand: '空き地',
    withShop: '店舗付き',
    landArea: '土地面積',
    underNegotiation: '商談中',
    
    // Transaction types
    sale: '売買',
    rent: '賃貸',
    
    // Property details
    listingId: '物件番号',
    location: '所在地',
    district: '地区',
    price: '価格',
    layout: '間取り',
    transactionType: '取引種別',
    propertyType: '物件種別',
    availability: '状態',
    available: '申込可',
    negotiating: '商談中',
    contact: 'お問い合わせ先',
    description: '物件ポイント',
    
    // Actions
    viewDetails: '詳細を見る',
    viewOnSite: '公式サイトで見る',
    viewPDF: 'PDF詳細を見る',
    addNote: 'メモを追加',
    save: '保存',
    cancel: 'キャンセル',
    delete: '削除',
    close: '閉じる',
    showOnMap: '地図で表示',
    
    // Notes
    notes: 'メモ',
    noNotes: 'メモはまだありません',
    addFirstNote: '最初のメモを追加',
    notePlaceholder: 'この物件についてメモを追加...',
    
    // Status
    status: '検討状況',
    statusNone: '未選択',
    statusInterested: '興味あり',
    statusVisited: '見学済み',
    statusApplied: '申込済み',
    statusPassed: '見送り',
    
    // Rating
    rating: '評価',
    
    // Favorites
    favorite: 'お気に入り',
    addToFavorites: 'お気に入りに追加',
    removeFromFavorites: 'お気に入りから削除',
    
    // Map legend
    mapLegend: '凡例',
    legendHouse: '空き家',
    legendLand: '空き地',
    legendNegotiating: '商談中',
    legendFavorite: 'お気に入り',
    
    // Stats
    properties: '件',
    showing: '表示中',
    of: '/',
    total: '全',
    
    // Language
    language: '言語',
    japanese: '日本語',
    english: 'English',
    
    // Districts
    'saigo_south': '西郷地区（南部）',
    'saigo_north': '西郷地区（北部）',
    'saigo_west': '西郷地区（西部）',
    'saigo_east': '西郷地区（東部）',
    'goka': '五箇地区',
    'tsuma': '都万地区',
    'fuse': '布施地区',
    'nakamura': '中村地区',
  },
  en: {
    // App title
    appTitle: 'Okinoshima House Hunter',
    appSubtitle: 'Vacant House & Land Bank Search',
    
    // View modes
    splitView: 'Split',
    mapView: 'Map',
    listView: 'List',
    
    // Filters
    search: 'Search...',
    searchPlaceholder: 'Search by ID, location, description...',
    allTypes: 'All Types',
    houses: 'Houses Only',
    land: 'Land Only',
    sortBy: 'Sort By',
    sortNewest: 'Newest First',
    sortPriceAsc: 'Price: Low to High',
    sortPriceDesc: 'Price: High to Low',
    maxPrice: 'Max Price',
    favoritesOnly: 'Favorites Only',
    availableOnly: 'Available Only',
    clearFilters: 'Clear Filters',
    
    // Property types
    house: 'House',
    vacantLand: 'Vacant Land',
    withShop: 'With Shop',
    landArea: 'Land Area',
    underNegotiation: 'Under Negotiation',
    
    // Transaction types
    sale: 'For Sale',
    rent: 'For Rent',
    
    // Property details
    listingId: 'Listing ID',
    location: 'Location',
    district: 'District',
    price: 'Price',
    layout: 'Layout',
    transactionType: 'Transaction',
    propertyType: 'Property Type',
    availability: 'Status',
    available: 'Available',
    negotiating: 'Under Negotiation',
    contact: 'Contact',
    description: 'Property Highlights',
    
    // Actions
    viewDetails: 'View Details',
    viewOnSite: 'View on Official Site',
    viewPDF: 'View PDF Details',
    addNote: 'Add Note',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    close: 'Close',
    showOnMap: 'Show on Map',
    
    // Notes
    notes: 'Notes',
    noNotes: 'No notes yet',
    addFirstNote: 'Add your first note',
    notePlaceholder: 'Add a note about this property...',
    
    // Status
    status: 'Your Status',
    statusNone: 'Not Set',
    statusInterested: 'Interested',
    statusVisited: 'Visited',
    statusApplied: 'Applied',
    statusPassed: 'Passed',
    
    // Rating
    rating: 'Rating',
    
    // Favorites
    favorite: 'Favorite',
    addToFavorites: 'Add to Favorites',
    removeFromFavorites: 'Remove from Favorites',
    
    // Map legend
    mapLegend: 'Legend',
    legendHouse: 'House',
    legendLand: 'Land',
    legendNegotiating: 'Negotiating',
    legendFavorite: 'Favorite',
    
    // Stats
    properties: 'properties',
    showing: 'Showing',
    of: 'of',
    total: '',
    
    // Language
    language: 'Language',
    japanese: '日本語',
    english: 'English',
    
    // Districts
    'saigo_south': 'Saigo (South)',
    'saigo_north': 'Saigo (North)',
    'saigo_west': 'Saigo (West)',
    'saigo_east': 'Saigo (East)',
    'goka': 'Goka',
    'tsuma': 'Tsuma',
    'fuse': 'Fuse',
    'nakamura': 'Nakamura',
  }
};

// Location translations
export const locationTranslations: Record<string, string> = {
  '西町': 'Nishimachi',
  '中町': 'Nakamachi',
  '東町': 'Higashimachi',
  '港町': 'Minatomachi',
  '栄町': 'Sakaemachi',
  '城北町': 'Johokumachi',
  '岬町': 'Misakimachi',
  '有木': 'Ariki',
  '原田': 'Harada',
  '下西': 'Shimonishi',
  '今津': 'Imatsu',
  '加茂': 'Kamo',
  '大久': 'Oku',
  '北方': 'Kitakata',
  '久見': 'Kumi',
  '津戸': 'Tsudo',
  '那久': 'Nagu',
  '都万': 'Tsuma',
  '油井': 'Yui',
  '飯美': 'Ibi',
  '飯田': 'Iida',
  '中村': 'Nakamura',
  '元屋': 'Motoya',
  '湊': 'Minato',
  '西村': 'Nishimura',
  '池田': 'Ikeda',
  '平': 'Taira',
  '郡': 'Kori',
  '代': 'Yo',
  '布施': 'Fuse',
};

// District translations
export const districtTranslations: Record<string, string> = {
  '西郷地区（南部）': 'Saigo District (South)',
  '西郷地区（北部）': 'Saigo District (North)',
  '西郷地区（西部）': 'Saigo District (West)',
  '西郷地区（東部）': 'Saigo District (East)',
  '五箇地区': 'Goka District',
  '都万地区': 'Tsuma District',
  '布施地区': 'Fuse District',
  '中村地区': 'Nakamura District',
};

// Description translations (common phrases)
export const descriptionTranslations: Record<string, string> = {
  '西郷港近くにある': 'Located near Saigo Port',
  '西郷港にほど近い': 'Close to Saigo Port',
  '西郷港周辺の': 'Around Saigo Port',
  '西郷港の近くにある': 'Near Saigo Port',
  '西郷港すぐ近くの': 'Very close to Saigo Port',
  '住宅地内にある': 'in a residential area',
  '住宅地の一角に': 'in a corner of a residential area',
  '住宅街の一角にある': 'in a corner of a residential neighborhood',
  '倉庫付き': 'with warehouse',
  '倉庫・駐車場付き': 'with warehouse and parking',
  '駐車場付き': 'with parking',
  '部屋数の多い': 'with many rooms',
  '部屋数が多く': 'with many rooms',
  '広々とした': 'spacious',
  '広い': 'spacious',
  '物件です': 'property',
  '土地です': 'land',
  '空地です': 'vacant land',
  '下水道接続済み': 'sewer connected',
  '光回線工事済み': 'fiber optic ready',
  '見晴らし・日当たり良好': 'good view and sunlight',
  '日当たり良好': 'good sunlight',
  '子育て環境は良好': 'good environment for raising children',
  '小中学校に近く': 'close to elementary and junior high schools',
  '小中学校や': 'elementary and junior high schools and',
  '病院、商業施設に近い': 'close to hospital and commercial facilities',
  '商業施設や医療機関に近い': 'close to commercial and medical facilities',
  '各種商業施設や総合病院に近接': 'close to various commercial facilities and general hospital',
  '市街地に近く': 'close to downtown',
  '市街地・空港に近接': 'close to downtown and airport',
  '空港近く': 'near the airport',
  '空港近隣の': 'near the airport',
  '隠岐空港近くの': 'near Oki Airport',
  '空港・園地の近くにある': 'near the airport and gardens',
  '海が近く': 'close to the sea',
  '海岸近くに': 'near the coast',
  '海岸のすぐそばにある': 'right by the coast',
  '海が見える': 'with sea view',
  '海を見下ろす': 'overlooking the sea',
  '緑に囲まれた': 'surrounded by greenery',
  '川沿いの': 'along the river',
  '漁港近くの': 'near the fishing port',
  '県道に面した': 'facing the prefectural road',
  '国道沿いで': 'along the national road',
  '利便性の良い立地': 'convenient location',
  '使いやすい': 'easy to use',
  'コンパクトな': 'compact',
  '２階建て': '2-story',
  '2階建て': '2-story',
  '2階建で': '2-story',
  '家庭菜園・園芸などにも好適': 'suitable for home gardening',
  '飲食店などにも活用いただけます': 'can be used for restaurants etc.',
  '飲食・旅館業許可の承継もできます': 'restaurant/inn license can be transferred',
  '店舗付きの': 'with shop',
  '店舗付きで': 'with shop',
  '元民宿です': 'former minshuku (Japanese inn)',
  '土地が広く': 'with spacious land',
  '敷地面積の広い': 'with large lot size',
  '中庭付きの': 'with courtyard',
  '屋根裏収納付き': 'with attic storage',
  '農地付きの': 'with farmland',
  '分筆も可能です': 'subdivision possible',
  '条件あり': 'conditions apply',
  '近隣に保育施設や商業施設等が立地': 'daycare and commercial facilities nearby',
};

export function translateDescription(desc: string, language: Language): string {
  if (language === 'ja') return desc;
  
  let translated = desc;
  
  // Sort by length (longest first) to avoid partial replacements
  const sortedPhrases = Object.entries(descriptionTranslations)
    .sort((a, b) => b[0].length - a[0].length);
  
  for (const [jp, en] of sortedPhrases) {
    translated = translated.replace(new RegExp(jp, 'g'), en);
  }
  
  // Clean up any remaining Japanese particles/connectors
  translated = translated
    .replace(/、/g, ', ')
    .replace(/。/g, '. ')
    .replace(/の物件です/g, ' property')
    .replace(/の土地です/g, ' land')
    .replace(/にある/g, ' ')
    .replace(/立地しています/g, 'located')
    .replace(/位置しています/g, 'located')
    .replace(/ある/g, '')
    .replace(/です/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Capitalize first letter
  return translated.charAt(0).toUpperCase() + translated.slice(1);
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  translateLocation: (location: string) => string;
  translateDistrict: (district: string) => string;
  translateDesc: (desc: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('okinoshima-language');
    return (saved as Language) || 'ja';
  });

  useEffect(() => {
    localStorage.setItem('okinoshima-language', language);
  }, [language]);

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  const translateLocation = (location: string): string => {
    if (language === 'ja') return location;
    return locationTranslations[location] || location;
  };

  const translateDistrict = (district: string): string => {
    if (language === 'ja') return district;
    return districtTranslations[district] || district;
  };

  const translateDesc = (desc: string): string => {
    return translateDescription(desc, language);
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      translateLocation, 
      translateDistrict,
      translateDesc 
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
