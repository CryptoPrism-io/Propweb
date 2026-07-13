export function MatchChip({ percent }: { percent: number }) {
  return (
    <span className="inline-flex items-center rounded-full bg-iceblue px-2.5 py-1 text-xs font-semibold text-graphite">
      {percent}% match
    </span>
  );
}
