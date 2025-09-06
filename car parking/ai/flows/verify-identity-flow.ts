'use server';

/**
 * @fileOverview An AI-powered identity verification flow for parking booking.
 *
 * - verifyIdentity - A function that handles the identity and vehicle verification process.
 * - VerifyIdentityInput - The input type for the verifyIdentity function.
 * - VerifyIdentityOutput - The return type for the verifyIdentity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyIdentityInputSchema = z.object({
  vehicleNumber: z.string().describe('The vehicle registration number.'),
  mobileNumber: z.string().describe('The user\'s mobile number.'),
  userPhotoDataUri: z
    .string()
    .describe(
      "A photo of the user's face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type VerifyIdentityInput = z.infer<typeof VerifyIdentityInputSchema>;

const VerifyIdentityOutputSchema = z.object({
  isVerified: z
    .boolean()
    .describe(
      'Whether the identity and vehicle details are verified successfully.'
    ),
  reason: z
    .string()
    .describe(
      'The reason for verification failure, or a success message.'
    ),
});
export type VerifyIdentityOutput = z.infer<typeof VerifyIdentityOutputSchema>;

export async function verifyIdentity(input: VerifyIdentityInput): Promise<VerifyIdentityOutput> {
  return verifyIdentityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifyIdentityPrompt',
  input: {schema: VerifyIdentityInputSchema},
  output: {schema: VerifyIdentityOutputSchema},
  prompt: `You are a verification agent for Simhastha Park Smart. Your task is to verify the user's identity and vehicle details based on the provided information.

You must perform the following checks:
1.  Analyze the user's photo to ensure it's a real person's face.
2.  Check if the vehicle number has a valid format (e.g., MH-12-AB-1234).
3.  Check if the mobile number format is valid (it should be a 10-digit number).

Based on these checks, decide if the verification is successful.
- If the user's face is not clear or not a real person, fail the verification.
- If the vehicle number is invalid, fail the verification.
- If the mobile number is invalid, fail the verification.

If all checks pass, the verification is successful. Provide a clear reason for your decision in the 'reason' field.

User Information:
- Vehicle Number: {{{vehicleNumber}}}
- MobileNumber: {{{mobileNumber}}}
- User's Photo: {{media url=userPhotoDataUri}}
`,
});

const verifyIdentityFlow = ai.defineFlow(
  {
    name: 'verifyIdentityFlow',
    inputSchema: VerifyIdentityInputSchema,
    outputSchema: VerifyIdentityOutputSchema,
  },
  async (input) => {
    // In a real application, you might have more complex logic here,
    // like calling external APIs or databases.
    // For this simulation, we pass everything to the LLM.
    const maxRetries = 3;
    const initialDelay = 1000; // 1 second

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const {output} = await prompt(input);
        return output!;
      } catch (error: any) {
        // Check if the error is a 503 Service Unavailable error
        const isServiceUnavailable = error.message?.includes('503') || error.status === 503;

        if (isServiceUnavailable && attempt < maxRetries) {
          console.log(`Attempt ${attempt} failed with 503. Retrying in ${initialDelay * attempt}ms...`);
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, initialDelay * attempt));
        } else {
          // For other errors or if max retries are reached, rethrow the error
          console.error(`Verification failed after ${attempt} attempts.`, error);
          throw new Error('The AI verification service is currently unavailable. Please try again later.');
        }
      }
    }
    
    // This part should not be reachable, but is here for type safety.
    throw new Error('Verification flow failed to complete.');
  }
);
