import { Property } from '../data/properties';
import { useLanguage, formatPrice } from '../i18n';

interface Props {
  property: Property;
  onClick: () => void;
  onShowOnMap?: () => void;
  isSelected: boolean;
  isFavorite: boolean;
  rating: number;
  noteCount: number;
}

export default function PropertyCard({ 
  property, 
  onClick, 
  onShowOnMap,
  isSelected,
  isFavorite,
  rating,
  noteCount,
}: Props) {
  const { language, t, translateLocation, translateDistrict } = useLanguage();
  
  const priceText = formatPrice(property.priceMan, language);
  const isShop = property.type === '空き家・店舗付き';
  const isLand = property.type === '空き地';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
      }`}
    >
      {/* Property Image */}
      <div className="relative h-36 bg-gray-200">
        <img
          src={property.imageUrl}
          alt={`${property.listingCode} - ${property.location}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.parentElement!.style.background = isLand
              ? 'linear-gradient(135deg, #bbf7d0, #86efac)'
              : 'linear-gradient(135deg, #bfdbfe, #93c5fd)';
          }}
        />
        
        {/* Price badge */}
        <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-sm font-bold shadow">
          {priceText}
        </div>
        
        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {property.isNegotiating && (
            <span className="bg-amber-500 text-white px-2 py-0.5 rounded text-xs font-medium">
              {t('underNegotiation')}
            </span>
          )}
          {isShop && (
            <span className="bg-purple-500 text-white px-2 py-0.5 rounded text-xs font-medium">
              {t('withShop')}
            </span>
          )}
        </div>
        
        {/* Favorite indicator */}
        {isFavorite && (
          <div className="absolute bottom-2 right-2 text-2xl drop-shadow">
            ❤️
          </div>
        )}
        
        {/* Notes count */}
        {noteCount > 0 && (
          <div className="absolute bottom-2 left-2 bg-white/90 text-gray-700 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
            📝 {noteCount}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-xs text-gray-500 font-medium">{property.listingCode}</div>
            <div className="font-medium text-gray-900">
              {translateLocation(property.location)}
            </div>
            <div className="text-sm text-gray-600">
              {translateDistrict(property.district)}
            </div>
          </div>
          
          <div className="text-right">
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
              isLand
                ? 'bg-green-100 text-green-700'
                : isShop
                ? 'bg-purple-100 text-purple-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {isLand ? t('vacantLand') : isShop ? t('withShop') : t('house')}
            </span>
          </div>
        </div>
        
        {property.layout && (
          <div className="mt-2 text-sm text-gray-600">
            {t('layout')}: {property.layout}
          </div>
        )}
        
        {property.landArea && (
          <div className="mt-2 text-sm text-gray-600">
            {t('landArea')}: {property.landArea}
          </div>
        )}

        {/* Rating */}
        {rating > 0 && (
          <div className="mt-2 text-amber-500 text-sm">
            {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
          </div>
        )}
        
        {/* Show on Map button */}
        {onShowOnMap && (
          <button
            onClick={(e) => { e.stopPropagation(); onShowOnMap(); }}
            className="mt-2 w-full text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-2 rounded transition-colors"
          >
            📍 {t('showOnMap')}
          </button>
        )}
      </div>
    </div>
  );
}
