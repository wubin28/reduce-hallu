# 减少 AI 幻觉 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Next.js Hello World page with a "减少 AI 幻觉" prompt optimizer tool that prepends/appends anti-hallucination text with a typewriter animation.

**Architecture:** Pure client-side app with no backend. Logic is split into three focused units — a prompt-building utility, a typewriter hook, and a copy button component — all assembled in `page.tsx`. State lives entirely in `HomePage`.

**Tech Stack:** Next.js 16.2.6 (App Router), React 19.2.4, TypeScript strict, Tailwind CSS v4

---

## Chunk 1: Core Logic Units

### Task 1: Prompt builder utility

**Files:**
- Create: `app/lib/promptUtils.ts`

- [ ] **Step 1: Create the directory and utility file**

```bash
mkdir -p app/lib
```

Then create `app/lib/promptUtils.ts`:

```typescript
// app/lib/promptUtils.ts
const PREFIX = "你是专家。";
const SUFFIX =
  "请提供主要观点的3个不同出处的网页链接以便我查验。如果你不知道或查不到，就实说，不要编造。";

export function buildOptimizedPrompt(input: string): string {
  return `${PREFIX}${input}${SUFFIX}`;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd C:\Users\wubin\OOR\katas\reduce-hallu && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Verify whitespace preservation by code inspection**

Open `app/lib/promptUtils.ts` and confirm:
- The template literal is `\`${PREFIX}${input}${SUFFIX}\`` with no `.trim()` or any other transformation on `input`
- `PREFIX` ends with `。` and `SUFFIX` begins with `请` — no extra whitespace added between them and the user's text

This is a static code check; the actual end-to-end output will be confirmed in the smoke test (Task 6, Step 3).

- [ ] **Step 4: Commit**

```bash
git add app/lib/promptUtils.ts
git commit -m "feat: add buildOptimizedPrompt utility"
```

---

### Task 2: Typewriter hook

**Files:**
- Create: `app/hooks/useTypewriter.ts`

- [ ] **Step 1: Create the hook**

```typescript
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
    // Reset when target text changes
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Manually verify hook behavior in the browser (after Task 4 is done)**

When the full page is running, confirm:
- Text in result area appears character-by-character (not all at once)
- While animation is running: the input textarea is empty and editable; the "查询事实" button is **disabled** (regardless of what is typed into the textarea)
- After animation finishes AND textarea is empty: "查询事实" button remains **disabled**
- After animation finishes AND new non-whitespace text is typed: "查询事实" button becomes **enabled**
- Submitting a new prompt after animation is done replaces the old result and restarts from empty

- [ ] **Step 4: Commit**

```bash
git add app/hooks/useTypewriter.ts
git commit -m "feat: add useTypewriter hook"
```

---

### Task 3: CopyButton component

**Files:**
- Create: `app/components/CopyButton.tsx`

- [ ] **Step 1: Create the component**

```tsx
// app/components/CopyButton.tsx
"use client";

import { useState, useEffect, useRef } from "react";

interface CopyButtonProps {
  text: string;
  disabled?: boolean;
}

export function CopyButton({ text, disabled = false }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up any pending reset timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function handleCopy() {
    // Clear any pending reset before starting a new copy action
    if (timerRef.current) clearTimeout(timerRef.current);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silent fallback: clipboard unavailable, permission denied, or non-secure context
    }
  }

  return (
    <button
      onClick={handleCopy}
      disabled={disabled}
      className="
        px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200
        border border-orange-300 text-orange-600
        hover:bg-orange-50 active:scale-95
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
      "
    >
      {copied ? "已复制 ✓" : "复制"}
    </button>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Manually verify copy behavior (after Task 4 is done)**

With the full page running:
- Click "复制" → button shows "已复制 ✓"; after ~2 s it reverts to "复制"
- Click "复制" again before 2 s is up → timer resets cleanly, shows "已复制 ✓" again for a full 2 s
- Button is disabled (greyed out) while typewriter is animating

To verify silent clipboard degradation: in DevTools Console, run:
```js
Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
```
Then click "复制" — the page must show **no error**, no alert, no console error; the button simply does nothing visible.
Restore afterwards: reload the page (or run `location.reload()`) to restore the real clipboard API.

- [ ] **Step 4: Commit**

```bash
git add app/components/CopyButton.tsx
git commit -m "feat: add CopyButton component"
```

---

## Chunk 2: Page Assembly & Verification

### Task 4: Assemble HomePage in page.tsx

**Files:**
- Modify: `app/page.tsx` (full replacement)

- [ ] **Step 1: Replace page.tsx with the assembled page**

```tsx
// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { buildOptimizedPrompt } from "@/app/lib/promptUtils";
import { useTypewriter } from "@/app/hooks/useTypewriter";
import { CopyButton } from "@/app/components/CopyButton";

export default function HomePage() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const { displayed, isDone } = useTypewriter(isTyping ? outputText : "", 20);

  // Clear isTyping when the animation finishes
  useEffect(() => {
    if (isDone && isTyping) {
      setIsTyping(false);
    }
  }, [isDone, isTyping]);

  // canSubmit: non-empty input AND animation not running
  const canSubmit = inputText.trim() !== "" && !isTyping;
  const hasOutput = outputText !== "";
  const copyDisabled = isTyping || !hasOutput;

  function handleSubmit() {
    if (!canSubmit) return;
    // Pass raw inputText to preserve user formatting; trim is only for the
    // canSubmit guard above
    const optimized = buildOptimizedPrompt(inputText);
    setOutputText(optimized);
    setInputText("");
    setIsTyping(true);
  }

  // Show animated text while typing; full text once done
  const resultText = isTyping ? displayed : outputText;

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col">
      {/* Header */}
      <header
        className="w-full text-white text-center py-10 px-6"
        style={{
          background: "linear-gradient(135deg, #ea580c, #f97316, #fb923c)",
        }}
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
          🧠 减少 AI 幻觉
        </h1>
        <p className="text-sm sm:text-base opacity-90 max-w-lg mx-auto">
          自动为提示词添加「减幻前缀和后缀」，让 AI 给出更可信的回答
        </p>
      </header>

      {/* Main */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Result area — shown only when there is output */}
        {hasOutput && (
          <div className="bg-white border border-orange-200 rounded-2xl p-5 shadow-sm shadow-orange-100">
            <div className="flex items-center justify-between mb-3">
              <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                ✨ 优化后的提示词
              </span>
              <CopyButton text={outputText} disabled={copyDisabled} />
            </div>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap border-l-4 border-orange-400 pl-4">
              {resultText}
              {isTyping && (
                <span className="inline-block w-0.5 h-4 bg-orange-500 ml-0.5 align-middle animate-pulse" />
              )}
            </p>
          </div>
        )}

        {/* Input area */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            📝 输入待优化的提示词
          </label>
          <div className="flex flex-col sm:flex-row gap-3 items-start">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="在这里输入你想问 AI 的问题…"
              rows={4}
              className="
                flex-1 w-full resize-y rounded-xl border-2 border-orange-200
                bg-white px-4 py-3 text-sm text-gray-800 leading-relaxed
                placeholder:text-gray-400
                focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100
                transition-colors duration-200
              "
            />
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="
                shrink-0 w-full sm:w-auto
                px-6 py-3 rounded-xl font-bold text-white text-sm
                transition-all duration-200 active:scale-95
                disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
              "
              style={{
                background: canSubmit
                  ? "linear-gradient(135deg, #f97316, #ea580c)"
                  : "#f97316",
                boxShadow: canSubmit
                  ? "0 4px 14px rgba(249,115,22,0.35)"
                  : "none",
              }}
            >
              🔍 查询事实
            </button>
          </div>
          <p className="text-xs text-orange-700 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
            💡 点击「查询事实」后，将自动添加
            <strong>「你是专家」</strong>前缀和
            <strong>「请提供来源链接」</strong>后缀。
          </p>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Update page metadata in layout.tsx**

In `app/layout.tsx`, replace:

```typescript
export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};
```

With:

```typescript
export const metadata: Metadata = {
  title: "减少 AI 幻觉",
  description: "自动为提示词添加减幻前缀和后缀，让 AI 给出更可信的回答",
};
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/layout.tsx
git commit -m "feat: implement HomePage and update page metadata"
```

---

### Task 5: Lint, build, and smoke test

- [ ] **Step 1: Run ESLint**

Run: `npm run lint`
Expected: No errors or warnings

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: Build completes with exit code 0 and no TypeScript or JSX errors in the output.

- [ ] **Step 3: Start dev server and smoke test manually**

Run: `npm run dev`

Open `http://localhost:3000` and verify each item:
1. Gradient orange header shows "🧠 减少 AI 幻觉"; browser tab title shows "减少 AI 幻觉"
2. Textarea and "🔍 查询事实" button are visible; button is **disabled** when textarea is empty
3. Type a prompt → button becomes active (full opacity)
4. Click button → input clears, result card appears above with typewriter animation; button disabled during animation
5. Animation finishes → button re-enables (if textarea has content) or stays disabled (if empty)
6. **Whitespace preservation:** type a multiline prompt (e.g., `line1\nline2\n  indented`), click "查询事实" → result shows `你是专家。line1↵line2↵  indented请提供…` with the original newlines and spaces intact (use `whitespace-pre-wrap` rendering to verify)
7. **Previous result persists:** submit a prompt, wait for animation → start typing a new prompt without submitting → confirm the previous result card is still visible above the textarea
8. "复制" button is disabled during animation; enabled after; click shows "已复制 ✓" then reverts after 2 s; click a second time before 2 s → timer resets cleanly
9. Open DevTools → Network tab, clear existing entries → click "查询事实" → confirm **no new fetch or XHR requests appear** triggered by that click (ignore any pre-existing Fast Refresh/HMR websocket traffic)
10. Toggle to mobile viewport (e.g. 390px wide) → textarea and button stack vertically, layout is not broken

- [ ] **Step 4: Stop dev server and commit**

Stop the dev server (Ctrl+C), then:

```bash
git add -A
git commit -m "chore: verify lint, build, and smoke test pass"
```
