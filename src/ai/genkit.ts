import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
// OpenAI plugin removed

export const ai = genkit({
  plugins: [
    googleAI(),
    // openai() plugin removed
  ],
  model: 'googleai/gemini-2.0-flash', 
});
