import type { ListingDraft } from '../../lib/ownerDraft';

const AMENITIES = ['Lift', 'Parking', 'Power backup', 'Security', 'Wi-Fi', 'Gym', 'Pool', 'Play area'];
const label = 'block text-sm font-semibold mb-1';

export function StepPreferences({ draft, set }: { draft: ListingDraft; set: (patch: Partial<ListingDraft>) => void }) {
  const toggle = (a: string) => {
    const has = draft.amenities.includes(a);
    set({ amenities: has ? draft.amenities.filter(x => x !== a) : [...draft.amenities, a] });
  };
  return (
    <div className="grid gap-4">
      <div>
        <label className={label}>Available from</label>
        <input type="date" className="w-full rounded-lg border border-line px-3 py-2" value={draft.moveInDate}
          onChange={e => set({ moveInDate: e.target.value })} />
      </div>
      <div>
        <label className={label}>Amenities</label>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map(a => {
            const on = draft.amenities.includes(a);
            return (
              <button key={a} type="button" onClick={() => toggle(a)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${on ? 'bg-blueharbor text-white' : 'border border-line text-coolgrey'}`}>
                {a}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
