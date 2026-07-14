export function MatchChip({ percent }: { percent: number }) {
  return (
    <span className="inline-flex h-[26px] items-center rounded-full bg-iceblue text-graphite px-[11px] text-[13px] font-bold">
      {percent}% match
    </span>
  );
}
