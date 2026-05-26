// app/page.tsx
"use client";

import { useState } from "react";
import { buildOptimizedPrompt } from "@/app/lib/promptUtils";
import { useTypewriter } from "@/app/hooks/useTypewriter";
import { CopyButton } from "@/app/components/CopyButton";

export default function HomePage() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");

  const { displayed, isDone } = useTypewriter(outputText, 20);

  // isTyping is derived — no extra state or effect needed
  const isTyping = outputText !== "" && !isDone;
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
  }

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
              {displayed}
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
