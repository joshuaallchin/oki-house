import { Property } from '../data/properties';
import { PropertyRating } from '../hooks/useNotes';

interface Props {
  property: Property;
  rating: PropertyRating;
  noteCount: number;
  isSelected: boolean;
  onClick: () => void;
  onToggleFavorite: () => void;
}

const statusColors: Record<string, string> = {
  interested: 'bg-blue-100 text-blue-700',
  visited: 'bg-purple-100 text-purple-700',
  applied: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  none: '',
};

const statusLabels: Record<string, string> = {
  interested: '🔍 Interested',
  visited: '👀 Visited',
  applied: '📝 Applied',
  rejected: '❌ Passed',
  none: '',
};

export default function PropertyCard({
  property,
  rating,
  noteCount,
  isSelected,
  onClick,
  onToggleFavorite,
}: Props) {
  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200 hover:shadow-lg ${
        isSelected
          ? 'border-blue-500 shadow-lg ring-2 ring-blue-200'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Image */}
      <div className="relative h-36 sm:h-40 overflow-hidden bg-gray-100">
        <img
          src={property.imageUrl}
          alt={property.listingId}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150"><rect fill="%23e5e7eb" width="200" height="150"/><text fill="%239ca3af" x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="14">No Image</text></svg>';
          }}
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {property.negotiating && (
            <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full shadow">
              商談中
            </span>
          )}
          <span
            className={`px-2 py-0.5 text-xs font-bold rounded-full shadow ${
              property.category === '空き地'
                ? 'bg-emerald-500 text-white'
                : 'bg-blue-500 text-white'
            }`}
          >
            {property.category}
          </span>
        </div>
        {/* Favorite */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/90 rounded-full shadow hover:scale-110 transition-transform"
        >
          {rating.favorite ? (
            <span className="text-red-500 text-lg">❤️</span>
          ) : (
            <span className="text-gray-400 text-lg">🤍</span>
          )}
        </button>
        {/* Price overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
          <p className="text-white font-bold text-lg">{property.price}</p>
        </div>
      </div>

      {/* Details */}
      <div className="p-3">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-sm text-gray-800">{property.listingId}</h3>
          {rating.status !== 'none' && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[rating.status]}`}
            >
              {statusLabels[rating.status]}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-1">
          📍 {property.location}（{property.district}）
        </p>
        {property.layout && (
          <p className="text-xs text-gray-600 mb-1">
            🏠 {property.layout}
          </p>
        )}
        <p className="text-xs text-gray-500 line-clamp-2">{property.description}</p>

        {/* Bottom row */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          {/* Stars */}
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-xs ${
                  star <= rating.rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                ★
              </span>
            ))}
          </div>
          {noteCount > 0 && (
            <span className="text-xs text-gray-400">
              📝 {noteCount} note{noteCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
