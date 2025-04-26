import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { APIRoute } from 'astro';
import { validMbtiTypes } from '../../lib/mbtiTypes'; // Import from shared lib
import { foodSuggestionSchema } from '../../lib/schemas'; // Import schema from shared lib
import { getPrompt, getUserPrompt, getErrorMessage, type Language, defaultLang } from '../../lib/prompts'; // Import prompts and helpers
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


// System prompt is now handled by getPrompt function from prompts.ts

export const POST: APIRoute = async ({ request }) => {
  let mbti: string | undefined;
  let lang: Language | string | undefined;

  try {
    const data = await request.json();
    mbti = data.mbti;
    lang = data.lang || defaultLang; // Get language or default to 'zh'
  } catch (error) {
    // Use default language for initial error if lang cannot be determined
    const errorLang = typeof lang === 'string' && (lang === 'en' || lang === 'zh') ? lang : defaultLang;
    return new Response(JSON.stringify({ error: getErrorMessage(errorLang, 'invalidJson') }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!mbti) {
    return new Response(JSON.stringify({ error: getErrorMessage(lang, 'missingMbti') }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const upperCaseMbti = mbti.toUpperCase();

  if (!validMbtiTypes.includes(upperCaseMbti)) {
    return new Response(JSON.stringify({ error: getErrorMessage(lang, 'invalidMbti') }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Use generateObject to call Gemini API and enforce the specified structure
    const systemPrompt = getPrompt(lang);
    const userPrompt = getUserPrompt(lang, upperCaseMbti);

    const { object: suggestionData } = await generateObject({
      model: google(model),
      schema: foodSuggestionSchema,
      system: systemPrompt,
      prompt: userPrompt,
    });

    // 返回 Gemini 生成的結構化 JSON
    return new Response(JSON.stringify(suggestionData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    // More detailed error handling using centralized messages
    let errorMessage = getErrorMessage(lang, 'serverError');
    if (error instanceof Error) {
        errorMessage = getErrorMessage(lang, 'apiError', error.message);
    }
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};