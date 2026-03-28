import { useState, useMemo, useCallback } from 'react';
import { properties } from './data/properties';
import { useNotes } from './hooks/useNotes';
import MapView from './components/MapView';
import PropertyCard from './components/PropertyCard';
import PropertyDetail from './components/PropertyDetail';

type ViewMode = 'split' | 'map' | 'list';
type SortOption = 'price-asc' | 'price-desc' | 'id';
type CategoryFilter = 'all' | '空き家' | '空き地';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('price-asc');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [showFilters, setShowFilters] = useState(false);

  const {
    addNote,
    updateNote,
    deleteNote,
    getNotesForProperty,
    getRating,
    setRating,
    toggleFavorite,
    setStatus,
    ratings,
  } = useNotes();

  const filteredProperties = useMemo(() => {
    let result = [...properties];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.listingId.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.price.includes(q)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((p) => p.category === categoryFilter);
    }

    // Favorites only
    if (showFavoritesOnly) {
      result = result.filter((p) => getRating(p.id).favorite);
    }

    // Available only
    if (showAvailableOnly) {
      result = result.filter((p) => !p.negotiating);
    }

    // Max price
    result = result.filter((p) => p.priceNum <= maxPrice);

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.priceNum - b.priceNum);
        break;
      case 'price-desc':
        result.sort((a, b) => b.priceNum - a.priceNum);
        break;
      case 'id':
        result.sort((a, b) => a.id - b.id);
        break;
    }

    return result;
  }, [searchQuery, sortBy, categoryFilter, showFavoritesOnly, showAvailableOnly, maxPrice, getRating, ratings]);

  const handleOpenDetail = useCallback((id: number) => {
    setDetailId(id);
    setSelectedId(id);
  }, []);

  const detailProperty = detailId ? properties.find((p) => p.id === detailId) : null;

  const favCount = useMemo(
    () => properties.filter((p) => getRating(p.id).favorite).length,
    [getRating, ratings]
  );

  const availableCount = useMemo(
    () => filteredProperties.filter((p) => !p.negotiating).length,
    [filteredProperties]
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0 z-20">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-lg font-bold text-gray-800 whitespace-nowrap">
              <span className="hidden sm:inline">🏠 隠岐の島 家探し</span>
              <span className="sm:hidden">🏠 隠岐の島</span>
            </h1>
            <span className="hidden md:inline text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {filteredProperties.length} properties · {availableCount} available · {favCount} ❤️
            </span>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white shadow text-gray-800 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📋
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors hidden sm:block ${
                viewMode === 'split'
                  ? 'bg-white shadow text-gray-800 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ⬜⬜
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                viewMode === 'map'
                  ? 'bg-white shadow text-gray-800 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🗺️
            </button>
          </div>
        </div>

        {/* Search & Filters Row */}
        <div className="flex items-center gap-2 mt-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location, ID, etc..."
              className="w-full text-sm border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              🔍
            </span>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              showFilters
                ? 'bg-blue-50 border-blue-300 text-blue-600'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            ⚙️ <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
            <div className="flex flex-wrap gap-3">
              {/* Category */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-gray-500">Type:</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
                  className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white"
                >
                  <option value="all">All</option>
                  <option value="空き家">空き家 (House)</option>
                  <option value="空き地">空き地 (Land)</option>
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-gray-500">Sort:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white"
                >
                  <option value="price-asc">Price ↑</option>
                  <option value="price-desc">Price ↓</option>
                  <option value="id">Listing ID</option>
                </select>
              </div>

              {/* Max Price */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-gray-500">Max:</label>
                <input
                  type="range"
                  min={50}
                  max={2000}
                  step={50}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-xs text-gray-600 font-mono w-16">{maxPrice}万円</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  showFavoritesOnly
                    ? 'bg-red-50 border-red-300 text-red-600'
                    : 'bg-white border-gray-200 text-gray-500'
                }`}
              >
                ❤️ Favorites only
              </button>
              <button
                onClick={() => setShowAvailableOnly(!showAvailableOnly)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  showAvailableOnly
                    ? 'bg-green-50 border-green-300 text-green-600'
                    : 'bg-white border-gray-200 text-gray-500'
                }`}
              >
                🟢 Available only
              </button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-200">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> House
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Land
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Negotiating
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Favorited
              </span>
            </div>
          </div>
        )}

        {/* Mobile stats */}
        <div className="sm:hidden flex items-center gap-2 mt-1.5">
          <span className="text-xs text-gray-400">
            {filteredProperties.length} results · {availableCount} available · {favCount} ❤️
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex">
        {/* Map */}
        {(viewMode === 'map' || viewMode === 'split') && (
          <div
            className={`${
              viewMode === 'split' ? 'hidden sm:block sm:w-1/2 lg:w-3/5' : 'w-full'
            } relative`}
          >
            <MapView
              properties={filteredProperties}
              selectedId={selectedId}
              onSelectProperty={handleOpenDetail}
              getRating={getRating}
            />
            {/* Floating info when map is full */}
            {viewMode === 'map' && selectedId && (
              <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80">
                {(() => {
                  const p = properties.find((p) => p.id === selectedId);
                  if (!p) return null;
                  const r = getRating(p.id);
                  return (
                    <div
                      className="bg-white rounded-xl shadow-2xl overflow-hidden cursor-pointer border border-gray-200"
                      onClick={() => handleOpenDetail(p.id)}
                    >
                      <div className="flex">
                        <img
                          src={p.imageUrl}
                          alt=""
                          className="w-24 h-24 object-cover flex-shrink-0"
                        />
                        <div className="p-3 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-sm text-gray-800">{p.listingId}</h3>
                            {r.favorite && <span>❤️</span>}
                          </div>
                          <p className="text-lg font-bold text-gray-900">{p.price}</p>
                          <p className="text-xs text-gray-500">
                            📍 {p.location} · {p.layout || p.category}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* List */}
        {(viewMode === 'list' || viewMode === 'split') && (
          <div
            className={`${
              viewMode === 'split' ? 'w-full sm:w-1/2 lg:w-2/5' : 'w-full max-w-5xl mx-auto'
            } overflow-y-auto p-3`}
          >
            {filteredProperties.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                <span className="text-4xl mb-2">🏚️</span>
                <p className="text-sm">No properties match your filters</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                    setShowFavoritesOnly(false);
                    setShowAvailableOnly(false);
                    setMaxPrice(2000);
                  }}
                  className="mt-2 text-sm text-blue-500 hover:text-blue-700"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div
                className={`grid gap-3 ${
                  viewMode === 'list'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : 'grid-cols-1 lg:grid-cols-2'
                }`}
              >
                {filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    rating={getRating(property.id)}
                    noteCount={getNotesForProperty(property.id).length}
                    isSelected={property.id === selectedId}
                    onClick={() => handleOpenDetail(property.id)}
                    onToggleFavorite={() => toggleFavorite(property.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Map/List Toggle - only when in split mode on mobile */}
      {viewMode === 'split' && (
        <div className="sm:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-10">
          <div className="flex bg-white rounded-full shadow-lg border border-gray-200 p-1">
            <button
              onClick={() => setViewMode('list')}
              className="px-4 py-2 text-sm rounded-full bg-blue-500 text-white"
            >
              📋 List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className="px-4 py-2 text-sm rounded-full text-gray-600"
            >
              🗺️ Map
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailProperty && (
        <PropertyDetail
          property={detailProperty}
          rating={getRating(detailProperty.id)}
          notes={getNotesForProperty(detailProperty.id)}
          onClose={() => setDetailId(null)}
          onAddNote={addNote}
          onUpdateNote={updateNote}
          onDeleteNote={deleteNote}
          onSetRating={setRating}
          onToggleFavorite={toggleFavorite}
          onSetStatus={setStatus}
        />
      )}
    </div>
  );
}

export default App;
