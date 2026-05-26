// app/hooks/useTypewriter.ts
"use client";

import { useState, useEffect, useRef } from "react";

export function useTypewriter(
  targetText: string,
  speed: number = 20
): { displayed: string; isDone: boolean } {
  const [displayed, setDisplayed] = useState("");
  const [isDone, setIsDone] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Synchronous resets are intentional: React 18+ batches them into one
    // re-render, so there is no cascading-render penalty. Immediate reset is
    // required so stale characters from the previous animation are cleared
    // before the new one starts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayed("");
    setIsDone(false);
    indexRef.current = 0;

    if (!targetText) {
      setIsDone(true);
      return;
    }

    function tick() {
      const i = indexRef.current;
      if (i >= targetText.length) {
        setIsDone(true);
        return;
      }
      setDisplayed(targetText.slice(0, i + 1));
      indexRef.current = i + 1;
      timerRef.current = setTimeout(tick, speed);
    }

    timerRef.current = setTimeout(tick, speed);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [targetText, speed]);

  return { displayed, isDone };
}
