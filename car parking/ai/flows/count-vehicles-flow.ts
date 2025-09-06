'use server';

/**
 * @fileOverview An AI-powered vehicle counting flow.
 *
 * - countVehicles - A function that counts vehicles in a photo.
 * - CountVehiclesInput - The input type for the countVehicles function.
 * - CountVehiclesOutput - The return type for the countVehicles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CountVehiclesInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a parking area, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type CountVehiclesInput = z.infer<typeof CountVehiclesInputSchema>;

const CountVehiclesOutputSchema = z.object({
  vehicleCount: z.number().describe('The number of vehicles detected in the photo.'),
});
export type CountVehiclesOutput = z.infer<typeof CountVehiclesOutputSchema>;

export async function countVehicles(input: CountVehiclesInput): Promise<CountVehiclesOutput> {
  return countVehiclesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'countVehiclesPrompt',
  input: {schema: CountVehiclesInputSchema},
  output: {schema: CountVehiclesOutputSchema},
  prompt: `You are a vehicle counting system for a parking lot.
Analyze the provided image and count the number of vehicles present.

Image: {{media url=photoDataUri}}

Return only the total count of vehicles in the 'vehicleCount' field.`,
});

const countVehiclesFlow = ai.defineFlow(
  {
    name: 'countVehiclesFlow',
    inputSchema: CountVehiclesInputSchema,
    outputSchema: CountVehiclesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
