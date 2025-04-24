import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { APIRoute } from 'astro';
import { validMbtiTypes } from '../../lib/mbtiTypes'; // Import from shared lib
import { foodSuggestionSchema } from '../../lib/schemas'; // Import schema from shared lib
import { GEMINI_API_KEY } from "astro:env/server";

export const prerender = false;

// 環境變數驗證
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

// 初始化 Gemini 模型
const model = "gemini-1.5-flash"; // 使用 flash 模型
const google = createGoogleGenerativeAI({
  apiKey: GEMINI_API_KEY,
});


// Gemini 系統提示
const systemPrompt = `您是一個 MBTI 飲食決策引擎，根據用戶 MBTI 類型生成數據驅動的飲食方案。請嚴格遵循以下架構：

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
▎優勢應用 ➔ 關鍵字：[關鍵字1] → [關鍵字2] → [關鍵字3] → [關鍵字4]
▎劣勢平衡 ➔ 關鍵字：[關鍵字1] → [關鍵字2] → [關鍵字3] → [關鍵字4]

## 一日飲食建議
### 早餐 (4 項)
│├─ [食物1] ➔ 連結優勢 [關鍵詞X] + 平衡 [關鍵詞Y]
│├─ [食物2] ➔ 應用 [關鍵字A] 路徑
│├─ [食物3] ➔ 結合 [關鍵詞Z] 特質
│└─ [食物4] ➔ 強化 [關鍵詞W] 能力

### 午餐 (4 項)
│├─ [食物1] ➔ 連結優勢 [關鍵詞X] + 平衡 [關鍵詞Y]
│├─ [食物2] ➔ 應用 [關鍵字A] 路徑
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

export const POST: APIRoute = async ({ request }) => {
  let mbti: string | undefined;

  try {
    const data = await request.json();
    mbti = data.mbti;
  } catch (error) {
    return new Response(JSON.stringify({ error: "請求格式錯誤，請確認您發送的是有效的 JSON。" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!mbti) {
    return new Response(JSON.stringify({ error: "未提供 MBTI 類型。請輸入您的 MBTI 類型（例如 INFP、ESTJ）。" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const upperCaseMbti = mbti.toUpperCase();

  if (!validMbtiTypes.includes(upperCaseMbti)) {
    return new Response(JSON.stringify({ error: "無效的 MBTI 類型。請輸入正確的 4 字母 MBTI 類型（例如 INFP、ESTJ）。" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // 使用 generateObject 呼叫 Gemini API 並強制輸出指定結構
    const { object: suggestionData } = await generateObject({
      model: google(model),
      schema: foodSuggestionSchema,
      system: systemPrompt,
      prompt: `請為 MBTI 類型 ${upperCaseMbti} 提供飲食建議。`,
    });

    // 返回 Gemini 生成的結構化 JSON
    return new Response(JSON.stringify(suggestionData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    // 更詳細的錯誤處理
    let errorMessage = "伺服器錯誤，請稍後再試。";
    if (error instanceof Error) {
        errorMessage = `Gemini API 請求失敗: ${error.message}`;
    }
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};