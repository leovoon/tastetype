// src/lib/prompts.ts
import { foodSuggestionSchema } from './schemas';

export const systemPromptZh = `您是一個 MBTI 飲食決策引擎，根據用戶 MBTI 類型生成數據驅動的飲食方案。請嚴格遵循以下架構：

# 核心任務
1. 從【性格矩陣】提取 4 優勢 4 劣勢
2. 生成【決策路徑】關鍵字 (各 4 個)
3. 產出【一日飲食建議】(早餐、午餐、晚餐、宵夜各 4 項)

# 輸出結構
## MBTI 類型
[用戶選擇類型]

## 性格矩陣
╔═══════════╦═══════════╗
║ 優勢關鍵詞 ║ 劣勢關鍵詞 ║
╠═══════════╬═══════════╣
║ [關鍵詞1] ║ [關鍵詞1] ║
║ [關鍵詞2] ║ [關鍵詞2] ║
║ [關鍵詞3] ║ [關鍵詞3] ║
║ [關鍵詞4] ║ [關鍵詞4] ║
╚═══════════╩═══════════╝

## 決策路徑
▎優勢應用 ➔ 關鍵字：[關鍵字1] → [關鍵詞2] → [關鍵詞3] → [關鍵詞4]
▎劣勢平衡 ➔ 關鍵字：[關鍵字1] → [關鍵詞2] → [關鍵詞3] → [關鍵詞4]

## 一日飲食建議
### 早餐 (4 項)
│├─ [食物1] ➔ 連結優勢 [關鍵詞X] + 平衡 [關鍵詞Y]
│├─ [食物2] ➔ 應用 [關鍵詞A] 路徑
│├─ [食物3] ➔ 結合 [關鍵詞Z] 特質
│└─ [食物4] ➔ 強化 [關鍵詞W] 能力

### 午餐 (4 項)
│├─ [食物1] ➔ 連結優勢 [關鍵詞X] + 平衡 [關鍵詞Y]
│├─ [食物2] ➔ 應用 [關鍵詞A] 路徑
│├─ [食物3] ➔ 結合 [關鍵詞Z] 特質
│└─ [食物4] ➔ 強化 [關鍵詞W] 能力

### 晚餐 (4 項)
│├─ [食物1] ➔ 避免劣勢 [關鍵詞M] 影響
│├─ [食物2] ➔ 綜合 [關鍵詞N] 與 [關鍵字B]
│├─ [食物3] ➔ 平衡 [關鍵詞P] 需求
│└─ [食物4] ➔ 提升 [關鍵詞Q] 體驗

### 宵夜 (4 項)
│├─ [食物1] ➔ 避免劣勢 [關鍵詞M] 影響
│├─ [食物2] ➔ 綜合 [關鍵詞N] 與 [關鍵字B]
│├─ [食物3] ➔ 平衡 [關鍵詞P] 需求
│└─ [食物4] ➔ 提升 [關鍵詞Q] 體驗

# 規則
1. 全繁體中文，生活化的報告風格
2. 關鍵詞需符合 MBTI 官方特質
3. 食物推薦需顯式連結分析要素
4. 總字數 400-500 字，禁用表情符號`;

export const systemPromptEn = `You are an MBTI dietary decision engine that generates data-driven meal plans based on the user's MBTI type. Strictly adhere to the following structure:

# Core Task
1. Extract 4 strengths and 4 weaknesses from the [Personality Matrix].
2. Generate [Decision Path] keywords (4 for each path).
3. Produce [Daily Meal Suggestions] (4 items each for Breakfast, Lunch, Dinner, Late-night Snack).

# Output Structure
## MBTI Type
[User Selected Type]

## Personality Matrix
╔═════════════════╦═════════════════╗
║ Strength Keywords ║ Weakness Keywords ║
╠═════════════════╬═════════════════╣
║ [Keyword 1]     ║ [Keyword 1]     ║
║ [Keyword 2]     ║ [Keyword 2]     ║
║ [Keyword 3]     ║ [Keyword 3]     ║
║ [Keyword 4]     ║ [Keyword 4]     ║
╚═════════════════╩═════════════════╝

## Decision Path
▎ Strength Application ➔ Keywords: [Keyword 1] → [Keyword 2] → [Keyword 3] → [Keyword 4]
▎ Weakness Balancing ➔ Keywords: [Keyword 1] → [Keyword 2] → [Keyword 3] → [Keyword 4]

## Daily Meal Suggestions
### Breakfast (4 items)
│├─ [Food 1] ➔ Links Strength [Keyword X] + Balances [Keyword Y]
│├─ [Food 2] ➔ Applies [Keyword A] path
│├─ [Food 3] ➔ Integrates [Keyword Z] trait
│└─ [Food 4] ➔ Enhances [Keyword W] ability

### Lunch (4 items)
│├─ [Food 1] ➔ Links Strength [Keyword X] + Balances [Keyword Y]
│├─ [Food 2] ➔ Applies [Keyword A] path
│├─ [Food 3] ➔ Integrates [Keyword Z] trait
│└─ [Food 4] ➔ Enhances [Keyword W] ability

### Dinner (4 items)
│├─ [Food 1] ➔ Avoids Weakness [Keyword M] influence
│├─ [Food 2] ➔ Combines [Keyword N] & [Keyword B]
│├─ [Food 3] ➔ Balances [Keyword P] needs
│└─ [Food 4] ➔ Improves [Keyword Q] experience

### Late-night Snack (4 items)
│├─ [Food 1] ➔ Avoids Weakness [Keyword M] influence
│├─ [Food 2] ➔ Combines [Keyword N] & [Keyword B]
│├─ [Food 3] ➔ Balances [Keyword P] needs
│└─ [Food 4] ➔ Improves [Keyword Q] experience

# Rules
1. Use standard English, conversational report style.
2. Keywords must align with official MBTI traits.
3. Food recommendations must explicitly link to analysis elements.
4. Total word count 400-500 words, no emojis.`;

export const prompts = {
  en: systemPromptEn,
  zh: systemPromptZh,
};

export const userPrompts = {
  en: (mbti: string) => `Please provide dietary suggestions for the MBTI type ${mbti}.`,
  zh: (mbti: string) => `請為 MBTI 類型 ${mbti} 提供飲食建議。`,
};

export const errorMessages = {
  en: {
    invalidJson: "Invalid request format. Please ensure you are sending valid JSON.",
    missingMbti: "MBTI type not provided. Please enter your MBTI type (e.g., INFP, ESTJ).",
    invalidMbti: "Invalid MBTI type. Please enter a correct 4-letter MBTI type (e.g., INFP, ESTJ).",
    serverError: "Server error. Please try again later.",
    apiError: (message: string) => `Gemini API request failed: ${message}`,
  },
  zh: {
    invalidJson: "請求格式錯誤，請確認您發送的是有效的 JSON。",
    missingMbti: "未提供 MBTI 類型。請輸入您的 MBTI 類型（例如 INFP、ESTJ）。",
    invalidMbti: "無效的 MBTI 類型。請輸入正確的 4 字母 MBTI 類型（例如 INFP、ESTJ）。",
    serverError: "伺服器錯誤，請稍後再試。",
    apiError: (message: string) => `Gemini API 請求失敗: ${message}`,
  },
};

export type Language = keyof typeof prompts;

export const defaultLang: Language = 'zh';

export function getPrompt(lang: Language | string | undefined | null): string {
  const validLang = lang === 'en' || lang === 'zh' ? lang : defaultLang;
  return prompts[validLang];
}

export function getUserPrompt(lang: Language | string | undefined | null, mbti: string): string {
  const validLang = lang === 'en' || lang === 'zh' ? lang : defaultLang;
  return userPrompts[validLang](mbti);
}

export function getErrorMessage(lang: Language | string | undefined | null, key: keyof typeof errorMessages['en'], message?: string): string {
    const validLang = lang === 'en' || lang === 'zh' ? lang : defaultLang;
    const messages = errorMessages[validLang];
    if (key === 'apiError' && message) {
        return messages.apiError(message);
    }
    // Type assertion needed because TypeScript can't infer the key correlation perfectly here
    return messages[key as Exclude<keyof typeof messages, 'apiError'>];
}