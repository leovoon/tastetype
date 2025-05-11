// src/lib/schemas.ts
import { z } from 'zod';

export const foodSuggestionSchema = z.object({
  mbti: z.string(),
  analysis: z.object({
    strengths: z.array(z.string().max(20)).length(4).describe('列舉四個 MBTI 優勢關鍵詞，每項不超過 5 字'),
    weaknesses: z.array(z.string().max(20)).length(4).describe('列舉四個 MBTI 劣勢關鍵詞，每項不超過 5 字'),
  }),
  keywords: z.object({
    // Dining Purpose paths
    energizing_path: z.array(z.string().max(15)).length(4).describe('提神活力目的的四個決策關鍵字'),
    relaxing_path: z.array(z.string().max(15)).length(4).describe('放鬆舒緩目的的四個決策關鍵字'),
    social_path: z.array(z.string().max(15)).length(4).describe('社交聚會目的的四個決策關鍵字'),
    comfort_path: z.array(z.string().max(15)).length(4).describe('心靈慰藉目的的四個決策關鍵字'),
    
    // Time-Based paths
    morning_path: z.array(z.string().max(15)).length(4).describe('早晨能量的四個決策關鍵字'),
    midday_path: z.array(z.string().max(15)).length(4).describe('中午專注的四個決策關鍵字'),
    evening_path: z.array(z.string().max(15)).length(4).describe('晚間放鬆的四個決策關鍵字'),
    weekend_path: z.array(z.string().max(15)).length(4).describe('週末享受的四個決策關鍵字'),
  }),
  suggestions: z.object({
    breakfast: z.array(
      z.object({
        food: z.string().describe('早餐建議'),
        drink: z.string().describe('配合早餐的飲品建議')
      })
    ).length(4).describe('早餐建議，4 組'),
    lunch: z.array(
      z.object({
        food: z.string().describe('午餐建議'),
        drink: z.string().describe('配合午餐的飲品建議')
      })
    ).length(4).describe('午餐建議，4 組'),
    dinner: z.array(
      z.object({
        food: z.string().describe('晚餐建議'),
        drink: z.string().describe('配合晚餐的飲品建議')
      })
    ).length(4).describe('晚餐建議，4 組'),
    night_snack: z.array(
      z.object({
        food: z.string().describe('宵夜建議'),
        drink: z.string().describe('配合宵夜的飲品建議')
      })
    ).length(4).describe('宵夜建議，4 組')
  }),
});