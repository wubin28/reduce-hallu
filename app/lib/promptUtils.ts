// app/lib/promptUtils.ts
const PREFIX = "你是专家。";
const SUFFIX =
  "请提供主要观点的3个不同出处的网页链接以便我查验。如果你不知道或查不到，就实说，不要编造。";

export function buildOptimizedPrompt(input: string): string {
  return `${PREFIX}${input}${SUFFIX}`;
}
