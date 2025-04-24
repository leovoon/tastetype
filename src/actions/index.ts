import { defineAction, ActionError } from 'astro:actions';
import { z } from 'zod';
import { validMbtiTypes } from '../lib/mbtiTypes';
import { foodSuggestionSchema } from '../lib/schemas';

// Define the expected data structure from the API (same as in the original page)


type FoodSuggestion = z.infer<typeof foodSuggestionSchema>;

export const server = {
  getFoodSuggestion: defineAction({
    accept: 'json',
    input: z.object({
      mbti: z.string().refine(mbti => validMbtiTypes.includes(mbti.toUpperCase()), {
        message: "Invalid MBTI type provided."
      }),
      // Need the origin to construct the API URL
      origin: z.string().url()
    }),
    handler: async ({ mbti, origin }): Promise<FoodSuggestion> => {
      try {
        const response = await fetch(`${origin}/api/food-suggestion`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mbti: mbti.toUpperCase() }), // Ensure uppercase
        });

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (jsonError) {
            // Handle cases where the error response is not valid JSON
            throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: `API request failed with status ${response.status} and non-JSON response.` });
          }
          // Use ActionError for standardized errors
          throw new ActionError({ code: 'BAD_REQUEST', message: errorData?.error || `API request failed with status ${response.status}` });
        }

        const rawData = await response.json();
        const parsedData = foodSuggestionSchema.safeParse(rawData);

        if (!parsedData.success) {
          console.error('API response validation failed:', parsedData.error);
          // Use ActionError for validation errors
          throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'Invalid data format received from API.' });
        }

        return parsedData.data;
      } catch (e) {
        console.error('Failed to fetch suggestion data via action:', e);
        if (e instanceof ActionError) {
          throw e; // Re-throw ActionErrors
        }
        // Wrap other errors in ActionError
        throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: e instanceof Error ? e.message : 'An unknown error occurred while fetching data.' });
      }
    },
  }),
};