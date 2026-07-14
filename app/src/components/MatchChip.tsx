export function MatchChip({ percent }: { percent: number }) {
  return (
    <span className="inline-flex items-center rounded-full bg-iceblue text-graphite px-[11px] py-[5px] text-xs font-bold">
      {percent}% match
    </span>
  );
}
