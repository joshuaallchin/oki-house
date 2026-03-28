import { useState } from 'react';
import { Property } from '../data/properties';
import { Note, PropertyRating } from '../hooks/useNotes';

interface Props {
  property: Property;
  rating: PropertyRating;
  notes: Note[];
  onClose: () => void;
  onAddNote: (propertyId: number, text: string) => void;
  onUpdateNote: (noteId: string, text: string) => void;
  onDeleteNote: (noteId: string) => void;
  onSetRating: (propertyId: number, rating: number) => void;
  onToggleFavorite: (propertyId: number) => void;
  onSetStatus: (propertyId: number, status: PropertyRating['status']) => void;
}

const statusOptions: { value: PropertyRating['status']; label: string; emoji: string }[] = [
  { value: 'none', label: 'No status', emoji: '⚪' },
  { value: 'interested', label: 'Interested', emoji: '🔍' },
  { value: 'visited', label: 'Visited', emoji: '👀' },
  { value: 'applied', label: 'Applied', emoji: '📝' },
  { value: 'rejected', label: 'Passed', emoji: '❌' },
];

export default function PropertyDetail({
  property,
  rating,
  notes,
  onClose,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onSetRating,
  onToggleFavorite,
  onSetStatus,
}: Props) {
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    onAddNote(property.id, newNote.trim());
    setNewNote('');
  };

  const handleSaveEdit = (noteId: string) => {
    if (!editText.trim()) return;
    onUpdateNote(noteId, editText.trim());
    setEditingNoteId(null);
    setEditText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header Image */}
        <div className="relative h-48 sm:h-56 flex-shrink-0">
          <img
            src={property.imageUrl}
            alt={property.listingId}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:bg-white shadow-lg"
          >
            ✕
          </button>
          <div className="absolute bottom-3 left-4 right-4">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-white text-xl font-bold">{property.listingId}</h2>
                <p className="text-white/90 text-sm">
                  📍 {property.location}（{property.district}）
                </p>
              </div>
              <p className="text-white font-bold text-2xl">{property.price}</p>
            </div>
          </div>
          {property.negotiating && (
            <span className="absolute top-3 left-3 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
              商談中
            </span>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Quick Actions */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              {/* Star Rating */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 mr-1">Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => onSetRating(property.id, star === rating.rating ? 0 : star)}
                    className={`text-xl transition-transform hover:scale-125 ${
                      star <= rating.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              {/* Favorite */}
              <button
                onClick={() => onToggleFavorite(property.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full border transition-colors text-sm font-medium"
                style={{
                  borderColor: rating.favorite ? '#f43f5e' : '#d1d5db',
                  background: rating.favorite ? '#fff1f2' : 'white',
                  color: rating.favorite ? '#e11d48' : '#6b7280',
                }}
              >
                {rating.favorite ? '❤️ Favorited' : '🤍 Favorite'}
              </button>
            </div>
            {/* Status */}
            <div className="flex flex-wrap gap-1.5">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onSetStatus(property.id, opt.value)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    rating.status === opt.value
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {opt.emoji} {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Property Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm mb-2">Property Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-gray-400 text-xs">Type</p>
                <p className="font-medium text-gray-700">{property.category}</p>
              </div>
              {property.layout && (
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-gray-400 text-xs">Layout</p>
                  <p className="font-medium text-gray-700">{property.layout}</p>
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-gray-400 text-xs">Transaction</p>
                <p className="font-medium text-gray-700">{property.type}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-gray-400 text-xs">Status</p>
                <p className="font-medium text-gray-700">
                  {property.negotiating ? '🟡 商談中' : '🟢 Available'}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3 bg-blue-50 rounded-lg p-2.5">
              💡 {property.description}
            </p>
          </div>

          {/* Contact */}
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm mb-2">Contact</h3>
            <p className="text-sm text-gray-600">{property.contact}</p>
          </div>

          {/* Links */}
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm mb-2">Links</h3>
            <div className="flex flex-wrap gap-2">
              <a
                href={property.detailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg"
              >
                🌐 Official Page
              </a>
              {property.pdfUrl && (
                <a
                  href={property.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-800 bg-red-50 px-3 py-1.5 rounded-lg"
                >
                  📄 PDF Details
                </a>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="px-4 py-3">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">
              📝 Notes ({notes.length})
            </h3>

            {/* Add note */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                placeholder="Add a note..."
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </div>

            {/* Notes list */}
            <div className="space-y-2">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                >
                  {editingNoteId === note.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(note.id)}
                        className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(note.id)}
                        className="text-xs text-green-600 hover:text-green-800 font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingNoteId(null)}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-700">{note.text}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-400">
                          {new Date(note.updatedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingNoteId(note.id);
                              setEditText(note.text);
                            }}
                            className="text-xs text-blue-500 hover:text-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDeleteNote(note.id)}
                            className="text-xs text-red-400 hover:text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {notes.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-4">
                  No notes yet. Add one above!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
