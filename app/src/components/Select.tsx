import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CaretDown, Check } from '@phosphor-icons/react';

export type SelectOption = { v: string; l: string };

const triggerBase =
  'flex w-full items-center justify-between gap-2 border bg-white text-left font-semibold text-graphite outline-none transition focus-visible:border-blueharbor';

const triggerByVariant: Record<'field' | 'pill', string> = {
  field: 'rounded-2xl px-4 py-3.5 text-sm',
  pill: 'w-auto rounded-full py-1.5 pl-3 pr-2.5 text-sm',
};

export function Select({
  value,
  onChange,
  options,
  variant = 'field',
  compact = false,
  active = false,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  variant?: 'field' | 'pill';
  /** tighter padding/radius, for dense form grids */
  compact?: boolean;
  /** visually flag that a non-default value is selected (pill variant) */
  active?: boolean;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find(o => o.v === value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) setHighlight(Math.max(0, options.findIndex(o => o.v === value)));
  }, [open, options, value]);

  const commit = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
    }
  };

  const onListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(i => Math.min(i + 1, options.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); commit(options[highlight].v); }
  };

  const isPill = variant === 'pill';
  const triggerClass = [
    triggerBase,
    triggerByVariant[variant],
    compact ? 'rounded-lg px-3 py-2 text-sm' : '',
    open ? 'border-blueharbor' : isPill && active ? 'border-blueharbor text-blueharbor' : 'border-line',
  ].join(' ');

  return (
    <div ref={rootRef} className={`relative ${isPill ? 'inline-block' : ''}`}>
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => setOpen(v => !v)}
        onKeyDown={onTriggerKeyDown}
        className={triggerClass}
      >
        <span className="truncate">{selected?.l ?? ''}</span>
        <CaretDown
          size={isPill ? 14 : 16}
          weight="bold"
          className={`shrink-0 text-coolgrey transition-transform duration-200 ${open ? 'rotate-180' : ''} ${isPill && active ? 'text-blueharbor' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listId}
            role="listbox"
            tabIndex={-1}
            onKeyDown={onListKeyDown}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className="absolute left-0 top-[calc(100%+6px)] z-50 max-h-64 w-full min-w-[10rem] overflow-auto rounded-[14px] border border-line bg-white p-1.5 shadow-card"
          >
            {options.map((o, i) => {
              const isSelected = o.v === value;
              return (
                <li
                  key={o.l}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => commit(o.v)}
                  className={`flex cursor-pointer items-center justify-between gap-2 rounded-[10px] px-3 py-2.5 text-sm font-semibold transition ${
                    isSelected ? 'text-blueharbor' : 'text-graphite'
                  } ${highlight === i ? 'bg-moontint' : ''}`}
                >
                  <span className="truncate">{o.l}</span>
                  {isSelected && <Check size={15} weight="bold" className="shrink-0 text-blueharbor" />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
