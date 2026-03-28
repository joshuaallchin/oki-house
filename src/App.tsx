import { useState, useMemo, useEffect, useCallback } from 'react';
import { properties, Property } from './data/properties';
import { useNotes } from './hooks/useNotes';
import { LanguageProvider, useLanguage, formatPrice } from './i18n';
import MapView from './components/MapView';
import PropertyCard from './components/PropertyCard';
import PropertyDetail from './components/PropertyDetail';

type ViewMode = 'split' | 'map' | 'list';
type SortOption = 'newest' | 'price-asc' | 'price-desc';
type FilterType = 'all' | '空き家' | '空き地';

function AppContent() {
  const { t, language, setLanguage } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [detailProperty, setDetailProperty] = useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [maxPrice, setMaxPrice] = useState(3000);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [mobileShowMap, setMobileShowMap] = useState(true);
  
  const { 
    notesMap, 
    addNote, 
    updateNote, 
    deleteNote, 
    getNotesForProperty,
    favorites, 
    toggleFavorite,
    ratings,
    setRating,
    statuses,
    setStatus,
  } = useNotes();

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    let result = properties.filter(p => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchableText = `${p.listingCode} ${p.location} ${p.district} ${p.description}`.toLowerCase();
        if (!searchableText.includes(query)) return false;
      }
      
      // Type filter - include 店舗付き with 空き家
      if (filterType === '空き家' && p.type === '空き地') return false;
      if (filterType === '空き地' && p.type !== '空き地') return false;
      
      // Max price filter (for sale properties only, not rentals)
      if (p.transactionType === '売買' && p.priceMan > maxPrice) return false;
      
      // Favorites only
      if (favoritesOnly && !favorites[p.id]) return false;
      
      // Available only
      if (availableOnly && p.isNegotiating) return false;
      
      return true;
    });
    
    // Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case 'price-asc':
          return a.priceMan - b.priceMan;
        case 'price-desc':
          return b.priceMan - a.priceMan;
        case 'newest':
        default:
          return b.id - a.id;
      }
    });
    
    return result;
  }, [searchQuery, filterType, sortOption, maxPrice, favoritesOnly, availableOnly, favorites]);

  // Close detail when clicking outside on mobile
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDetailProperty(null);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setSortOption('newest');
    setMaxPrice(3000);
    setFavoritesOnly(false);
    setAvailableOnly(false);
  };

  // Show property on map
  const handleShowOnMap = useCallback((property: Property) => {
    setSelectedProperty(property);
    if (viewMode === 'list') {
      setViewMode('split');
    }
    setMobileShowMap(true);
  }, [viewMode]);

  // Open property detail
  const handleOpenDetail = useCallback((property: Property) => {
    setDetailProperty(property);
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{t('appTitle')}</h1>
              <p className="text-blue-100 text-xs sm:text-sm">{t('appSubtitle')}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(language === 'ja' ? 'en' : 'ja')}
                className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition"
              >
                🌐 {language === 'ja' ? 'EN' : 'JP'}
              </button>
              
              {/* View mode buttons */}
              <div className="flex bg-white/20 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition hidden sm:block ${
                    viewMode === 'split' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/20'
                  }`}
                >
                  {t('splitView')}
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    viewMode === 'map' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/20'
                  }`}
                >
                  {t('mapView')}
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    viewMode === 'list' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/20'
                  }`}
                >
                  {t('listView')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-wrap gap-2 items-center">
            {/* Search */}
            <div className="relative flex-grow max-w-xs">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute left-2.5 top-2.5 text-gray-400">🔍</span>
            </div>
            
            {/* Type filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('allTypes')}</option>
              <option value="空き家">{t('houses')}</option>
              <option value="空き地">{t('land')}</option>
            </select>
            
            {/* Sort */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">{t('sortNewest')}</option>
              <option value="price-asc">{t('sortPriceAsc')}</option>
              <option value="price-desc">{t('sortPriceDesc')}</option>
            </select>
            
            {/* Max price slider */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 whitespace-nowrap">{t('maxPrice')}:</span>
              <input
                type="range"
                min="50"
                max="3000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-20 sm:w-32"
              />
              <span className="text-gray-800 font-medium whitespace-nowrap">
                {formatPrice(maxPrice, language).split(' ')[0]}
              </span>
            </div>
            
            {/* Toggle filters */}
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={favoritesOnly}
                onChange={(e) => setFavoritesOnly(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>❤️ {t('favoritesOnly')}</span>
            </label>
            
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>✓ {t('availableOnly')}</span>
            </label>
            
            {/* Clear filters */}
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
            >
              {t('clearFilters')}
            </button>
          </div>
          
          {/* Results count */}
          <div className="mt-2 text-sm text-gray-600">
            {t('showing')} {filteredProperties.length} {t('of')} {properties.length} {t('properties')}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col sm:flex-row min-h-0">
        {/* Map view */}
        {(viewMode === 'split' || viewMode === 'map') && (
          <div className={`${
            viewMode === 'split' ? 'sm:w-1/2' : 'w-full'
          } ${
            viewMode === 'split' && !mobileShowMap ? 'hidden sm:block' : ''
          } h-[50vh] sm:h-full relative flex-shrink-0`}>
            <MapView 
              properties={filteredProperties}
              selectedProperty={selectedProperty}
              onSelectProperty={handleOpenDetail}
              favorites={favorites}
            />
            
            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-lg shadow-lg p-3 text-xs z-[400]">
              <div className="font-medium mb-2">{t('mapLegend')}</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  <span>{t('legendHouse')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span>{t('legendLand')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span>{t('legendNegotiating')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span>{t('legendFavorite')}</span>
                </div>
              </div>
            </div>
            
            {/* Mobile toggle for split view */}
            {viewMode === 'split' && (
              <button
                onClick={() => setMobileShowMap(!mobileShowMap)}
                className="sm:hidden absolute top-4 right-4 bg-white shadow-lg rounded-lg px-3 py-2 text-sm font-medium z-[400]"
              >
                {mobileShowMap ? `📋 ${t('listView')}` : `🗺️ ${t('mapView')}`}
              </button>
            )}
          </div>
        )}
        
        {/* List view */}
        {(viewMode === 'split' || viewMode === 'list') && (
          <div className={`${
            viewMode === 'split' ? 'sm:w-1/2' : 'w-full'
          } ${
            viewMode === 'split' && mobileShowMap ? 'hidden sm:block' : ''
          } flex-1 overflow-y-auto bg-gray-50`}>
            <div className={`p-4 grid gap-4 ${
              viewMode === 'list' ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'
            }`}>
              {filteredProperties.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onClick={() => handleOpenDetail(property)}
                  onShowOnMap={() => handleShowOnMap(property)}
                  isSelected={selectedProperty?.id === property.id}
                  isFavorite={!!favorites[property.id]}
                  rating={ratings[property.id] || 0}
                  noteCount={notesMap[property.id]?.length || 0}
                />
              ))}
              
              {filteredProperties.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <div className="text-4xl mb-2">🏠</div>
                  <p>{language === 'ja' ? '条件に合う物件が見つかりませんでした' : 'No properties match your filters'}</p>
                  <button
                    onClick={clearFilters}
                    className="mt-2 text-blue-600 hover:underline"
                  >
                    {t('clearFilters')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Property detail modal */}
      {detailProperty && (
        <PropertyDetail
          property={detailProperty}
          onClose={() => setDetailProperty(null)}
          rating={ratings[detailProperty.id] || 0}
          notes={getNotesForProperty(detailProperty.id)}
          onAddNote={(text) => addNote(detailProperty.id, text)}
          onUpdateNote={(noteId, text) => updateNote(detailProperty.id, noteId, text)}
          onDeleteNote={(noteId) => deleteNote(detailProperty.id, noteId)}
          isFavorite={!!favorites[detailProperty.id]}
          onToggleFavorite={() => toggleFavorite(detailProperty.id)}
          onSetRating={(r) => setRating(detailProperty.id, r)}
          status={statuses[detailProperty.id] || 'none'}
          onSetStatus={(s) => setStatus(detailProperty.id, s)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
