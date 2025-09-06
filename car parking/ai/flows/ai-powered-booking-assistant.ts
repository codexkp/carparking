'use server';

/**
 * @fileOverview An AI-powered booking assistant flow.
 *
 * - askBookingAssistant - A function that answers users' booking questions.
 * - AskBookingAssistantInput - The input type for the askBookingAssistant function.
 * - AskBookingAssistantOutput - The return type for the askBookingAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskBookingAssistantInputSchema = z.object({
  query: z.string().describe('The user query about parking availability, location details, and parking rules.'),
});
export type AskBookingAssistantInput = z.infer<typeof AskBookingAssistantInputSchema>;

const AskBookingAssistantOutputSchema = z.object({
  answer: z.string().describe('The answer to the user query.'),
});
export type AskBookingAssistantOutput = z.infer<typeof AskBookingAssistantOutputSchema>;

export async function askBookingAssistant(input: AskBookingAssistantInput): Promise<AskBookingAssistantOutput> {
  return askBookingAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askBookingAssistantPrompt',
  input: {schema: AskBookingAssistantInputSchema},
  output: {schema: AskBookingAssistantOutputSchema},
  prompt: `You are a parking concierge for Simhastha Park Smart, an innovative parking management system.

  Answer the following question to the best of your ability using the context provided.
  If you cannot answer the question based on the context, respond politely that you do not have the information to answer the question.

  Question: {{{query}}}

  Context: Simhastha Park Smart provides real-time parking availability for different zones. Users can book available spaces. The system updates dynamically based on sensor data.
`,
});

const askBookingAssistantFlow = ai.defineFlow(
  {
    name: 'askBookingAssistantFlow',
    inputSchema: AskBookingAssistantInputSchema,
    outputSchema: AskBookingAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
