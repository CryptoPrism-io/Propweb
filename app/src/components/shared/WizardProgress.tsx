export function WizardProgress({ step, labels }: { step: number; labels: string[] }) {
  return (
    <ol className="mb-6 flex items-center gap-2">
      {labels.map((label, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                active ? 'bg-blueharbor text-white' : done ? 'bg-limeglow text-graphite' : 'bg-white text-coolgrey border border-line'
              }`}
            >
              {n}
            </span>
            <span className={`text-xs font-semibold ${active ? 'text-graphite' : 'text-coolgrey'}`}>{label}</span>
            {n < labels.length && <span className="h-px flex-1 bg-line" />}
          </li>
        );
      })}
    </ol>
  );
}
