import type { APIRoute } from 'astro';

const validMbtiTypes = [
  "INFP", "INFJ", "INTP", "INTJ",
  "ISFP", "ISFJ", "ISTP", "ISTJ",
  "ENFP", "ENFJ", "ENTP", "ENTJ",
  "ESFP", "ESFJ", "ESTP", "ESTJ"
];

export const GET: APIRoute = () => { // Removed unused 'request' parameter
  return new Response(
    JSON.stringify(validMbtiTypes), // Return the array directly
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
};