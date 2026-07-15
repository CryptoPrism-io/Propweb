import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAiThinking } from './useAiThinking';

describe('useAiThinking', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('cycles through steps and calls onDone after the sequence completes', () => {
    const onDone = vi.fn();
    const { result } = renderHook(() => useAiThinking(['Reading…', 'Matching…', 'Done'], onDone));

    act(() => result.current.start());
    expect(result.current.thinking).toBe(true);
    expect(result.current.currentStep).toBe('Reading…');

    act(() => { vi.advanceTimersByTime(550); });
    expect(result.current.currentStep).toBe('Matching…');

    act(() => { vi.advanceTimersByTime(550); });
    expect(result.current.currentStep).toBe('Done');

    act(() => { vi.advanceTimersByTime(550); });
    expect(result.current.thinking).toBe(false);
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
