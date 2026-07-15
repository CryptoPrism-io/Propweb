import { useCallback, useEffect, useRef, useState } from 'react';

const STEP_DELAY_MS = 550;

/**
 * Drives a mocked "AI thinking" sequence: cycles through `steps` on a fixed
 * delay, then calls `onDone`. Purely cosmetic UI delay — any real parsing
 * should already have run synchronously before calling `start()`.
 */
export function useAiThinking(steps: string[], onDone: () => void) {
  const [thinking, setThinking] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const start = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setThinking(true);
    setStepIndex(0);

    steps.forEach((_, i) => {
      if (i === 0) return; // step 0 shows immediately, no timer needed
      timers.current.push(setTimeout(() => setStepIndex(i), i * STEP_DELAY_MS));
    });

    timers.current.push(
      setTimeout(() => {
        setThinking(false);
        onDone();
      }, steps.length * STEP_DELAY_MS),
    );
  }, [steps, onDone]);

  // Clean up any pending timers when the component unmounts
  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
    };
  }, []);

  return { thinking, currentStep: steps[stepIndex], start };
}
