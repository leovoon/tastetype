import { streamText } from "ai";
import {  createGoogleGenerativeAI } from '@ai-sdk/google';
import type { APIRoute } from "astro";

export const prerender = false;

// Best practice: Validate environment variables at startup
const apiKey = import.meta.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

const model = "gemini-1.5-flash-8b";
const google = createGoogleGenerativeAI({
  apiKey,
});
// API route handler with improved error handling and streaming support
export const POST: APIRoute = async ({ request }) => {
  try {
    

    const { messages } = await request.json();
    
    const result = streamText({
      model: google(model),
      messages,
      system: "You are a helpful AI assistant",
    });
    
      return result.toDataStreamResponse({
        getErrorMessage: errorHandler,
      });
    
  } catch (error) {
    console.error('API Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};

export function errorHandler(error: unknown) {
    if (error == null) {
      return 'unknown error';
    }
  
    if (typeof error === 'string') {
      return error;
    }
  
    if (error instanceof Error) {
      return error.message;
    }
  
    return JSON.stringify(error);
  }