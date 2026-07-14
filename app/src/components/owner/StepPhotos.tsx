import type { ListingDraft } from '../../lib/ownerDraft';

const PRESETS = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
  'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
];

export function StepPhotos({ draft, set }: { draft: ListingDraft; set: (patch: Partial<ListingDraft>) => void }) {
  const toggle = (url: string) => {
    const has = draft.photos.includes(url);
    set({ photos: has ? draft.photos.filter(p => p !== url) : [...draft.photos, url] });
  };
  return (
    <div>
      <p className="mb-3 text-sm text-coolgrey">Select photos for your listing (demo — tap to add).</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {PRESETS.map(url => {
          const selected = draft.photos.includes(url);
          return (
            <button key={url} type="button" onClick={() => toggle(url)}
              className={`relative overflow-hidden rounded-lg ${selected ? 'ring-2 ring-blueharbor' : 'border border-line'}`}>
              <img src={url} alt="" className="h-24 w-full object-cover" />
              {selected && <span className="absolute right-1 top-1 rounded-full bg-blueharbor px-1.5 py-0.5 text-[10px] font-bold text-white">✓</span>}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-coolgrey">{draft.photos.length} selected</p>
    </div>
  );
}
