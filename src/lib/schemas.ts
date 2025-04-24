// src/lib/schemas.ts
import { z } from 'zod';

export const foodSuggestionSchema = z.object({
  mbti: z.string(),
  analysis: z.object({
    strengths: z.array(z.string().max(20)).length(4).describe('列舉四個 MBTI 優勢關鍵詞，每項不超過 5 字'),
    weaknesses: z.array(z.string().max(20)).length(4).describe('列舉四個 MBTI 劣勢關鍵詞，每項不超過 5 字'),
  }),
  keywords: z.object({
    strength_path: z.array(z.string().max(15)).length(4).describe('基於優勢的四個決策關鍵字'),
    weakness_path: z.array(z.string().max(15)).length(4).describe('基於劣勢的四個改進關鍵字'),
  }),
  suggestions: z.object({
    breakfast: z.array(z.string()).length(4).describe('早餐建議，4 項'),
    lunch: z.array(z.string()).length(4).describe('午餐建議，4 項'),
    dinner: z.array(z.string()).length(4).describe('晚餐建議，4 項'),
    night_snack: z.array(z.string()).length(4).describe('宵夜建議，4 項')
  }),
});