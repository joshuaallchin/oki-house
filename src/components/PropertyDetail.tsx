import { useState } from 'react';
import { Property, getDetailUrl } from '../data/properties';
import { Note } from '../hooks/useNotes';
import { useLanguage, formatPrice } from '../i18n';

interface Props {
  property: Property;
  onClose: () => void;
  rating: number;
  notes: Note[];
  onAddNote: (text: string) => void;
  onUpdateNote: (noteId: string, text: string) => void;
  onDeleteNote: (noteId: string) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onSetRating: (rating: number) => void;
  status: 'none' | 'interested' | 'visited' | 'applied' | 'passed';
  onSetStatus: (status: 'none' | 'interested' | 'visited' | 'applied' | 'passed') => void;
}

export default function PropertyDetail({
  property,
  onClose,
  rating,
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  isFavorite,
  onToggleFavorite,
  onSetRating,
  status,
  onSetStatus,
}: Props) {
  const { language, t, translateLocation, translateDistrict, translateDesc } = useLanguage();
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const priceText = formatPrice(property.priceMan, language);
  const isShop = property.type === '空き家・店舗付き';
  const isLand = property.type === '空き地';
  const detailUrl = getDetailUrl(property.id);
  // PDF URL is directly stored in the property data
  const pdfUrl = property.pdfUrl;

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(newNote.trim());
      setNewNote('');
    }
  };

  const handleUpdateNote = (noteId: string) => {
    if (editText.trim()) {
      onUpdateNote(noteId, editText.trim());
      setEditingNote(null);
      setEditText('');
    }
  };

  const statusOptions = [
    { value: 'none', label: t('statusNone'), color: 'gray' },
    { value: 'interested', label: t('statusInterested'), color: 'blue' },
    { value: 'visited', label: t('statusVisited'), color: 'purple' },
    { value: 'applied', label: t('statusApplied'), color: 'green' },
    { value: 'passed', label: t('statusPassed'), color: 'red' },
  ] as const;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[1000]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header image area */}
        <div className="relative h-56 bg-gray-200">
          <img
            src={property.imageUrl}
            alt={`${property.listingCode} - ${property.location}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.style.background = isLand
                ? 'linear-gradient(135deg, #bbf7d0, #4ade80)'
                : 'linear-gradient(135deg, #bfdbfe, #60a5fa)';
            }}
          />
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 transition shadow-lg"
          >
            ✕
          </button>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {property.isNegotiating && (
              <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow">
                {t('underNegotiation')}
              </span>
            )}
            {isShop && (
              <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow">
                {t('withShop')}
              </span>
            )}
          </div>
          
          {/* Price and location overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
            <div className="text-2xl font-bold">{priceText}</div>
            <div className="text-lg">{translateLocation(property.location)}, {translateDistrict(property.district)}</div>
            <div className="text-sm opacity-80">{property.listingCode}</div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Actions row */}
          <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b">
            {/* Favorite */}
            <button
              onClick={onToggleFavorite}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                isFavorite 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isFavorite ? '❤️' : '🤍'} {isFavorite ? t('removeFromFavorites') : t('addToFavorites')}
            </button>
            
            {/* Rating */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => onSetRating(star === rating ? 0 : star)}
                  className="text-2xl hover:scale-110 transition"
                >
                  {star <= rating ? '★' : '☆'}
                </button>
              ))}
            </div>
          </div>
          
          {/* Status selector */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">{t('status')}</h3>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onSetStatus(option.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                    status === option.value
                      ? option.color === 'gray' ? 'bg-gray-600 text-white'
                        : option.color === 'blue' ? 'bg-blue-600 text-white'
                        : option.color === 'purple' ? 'bg-purple-600 text-white'
                        : option.color === 'green' ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Property details grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">{t('propertyType')}</div>
              <div className="font-medium">
                {isLand ? t('vacantLand') : isShop ? t('withShop') : t('house')}
              </div>
            </div>
            {property.layout && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">{t('layout')}</div>
                <div className="font-medium">{property.layout}</div>
              </div>
            )}
            {property.landArea && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">{language === 'en' ? 'Land Area' : '土地面積'}</div>
                <div className="font-medium text-sm">{property.landArea}</div>
              </div>
            )}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">{t('transactionType')}</div>
              <div className="font-medium">{property.transactionType === '売買' ? t('sale') : t('rent')}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">{t('availability')}</div>
              <div className={`font-medium ${property.isNegotiating ? 'text-amber-600' : 'text-green-600'}`}>
                {property.isNegotiating ? t('negotiating') : t('available')}
              </div>
            </div>
          </div>
          
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">{t('description')}</h3>
            <p className="text-gray-600 bg-gray-50 rounded-lg p-3">
              {translateDesc(property.description)}
            </p>
          </div>
          
          {/* Contact */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">{t('contact')}</h3>
            <p className="text-gray-600 bg-blue-50 rounded-lg p-3 border border-blue-100">
              📞 {property.contact}
            </p>
          </div>
          
          {/* External links */}
          <div className="flex flex-wrap gap-3 mb-6 pb-6 border-b">
            <a
              href={detailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              🔗 {t('viewOnSite')}
            </a>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              📄 {t('viewPDF')}
            </a>
          </div>
          
          {/* Notes section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
              📝 {t('notes')}
              <span className="text-sm font-normal text-gray-500">({notes.length})</span>
            </h3>
            
            {/* Add new note */}
            <div className="mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={t('notePlaceholder')}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={2}
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {t('addNote')}
              </button>
            </div>
            
            {/* Notes list */}
            <div className="space-y-3">
              {notes.length === 0 ? (
                <p className="text-gray-500 text-sm italic">{t('noNotes')}</p>
              ) : (
                notes.map(note => (
                  <div key={note.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    {editingNote === note.id ? (
                      <div>
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={2}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleUpdateNote(note.id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            {t('save')}
                          </button>
                          <button
                            onClick={() => {
                              setEditingNote(null);
                              setEditText('');
                            }}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                          >
                            {t('cancel')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-800 whitespace-pre-wrap">{note.text}</p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-yellow-200">
                          <span className="text-xs text-gray-500">
                            {new Date(note.updatedAt).toLocaleDateString(language === 'ja' ? 'ja-JP' : 'en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingNote(note.id);
                                setEditText(note.text);
                              }}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => onDeleteNote(note.id)}
                              className="text-sm text-red-600 hover:underline"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
