'use server';
/**
 * @fileOverview This file implements a Genkit flow to generate concise, easy-to-understand summaries
 * of tokenized land parcels for investors, highlighting carbon credit potential and key investment aspects.
 *
 * - generateMarketplaceSummary - A function that handles the generation of the marketplace summary.
 * - GenerateMarketplaceSummaryInput - The input type for the generateMarketplaceSummary function.
 * - GenerateMarketplaceSummaryOutput - The return type for the generateMarketplaceSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMarketplaceSummaryInputSchema = z.object({
  landDetails: z
    .string()
    .describe('Detailed description of the land parcel, including location, size, and current use.'),
  carbonCreditPotential: z
    .string()
    .describe(
      'Information about the land parcel\u0027s carbon sequestration potential, estimated carbon credits, and verification status.'
    ),
  investmentAspects: z
    .string()
    .describe('Key investment details such as price, ROI projections, risks, and tokenomics.'),
});
export type GenerateMarketplaceSummaryInput = z.infer<
  typeof GenerateMarketplaceSummaryInputSchema
>;

const GenerateMarketplaceSummaryOutputSchema = z
  .string()
  .describe('A concise, easy-to-understand summary of the tokenized land parcel for an investor.');
export type GenerateMarketplaceSummaryOutput = z.infer<
  typeof GenerateMarketplaceSummaryOutputSchema
>;

export async function generateMarketplaceSummary(
  input: GenerateMarketplaceSummaryInput
): Promise<GenerateMarketplaceSummaryOutput> {
  return generateMarketplaceSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'marketplaceSummaryPrompt',
  input: {schema: GenerateMarketplaceSummaryInputSchema},
  output: {schema: GenerateMarketplaceSummaryOutputSchema},
  prompt: `You are an expert investment analyst specializing in sustainable finance and real asset tokenization.
Your task is to generate a concise, easy-to-understand summary of a tokenized land parcel for potential investors.
Focus on highlighting its carbon credit potential and key investment aspects, making it easy for an investor to quickly evaluate the opportunity without reading lengthy documents.

Land Details: {{{landDetails}}}

Carbon Credit Potential: {{{carbonCreditPotential}}}

Investment Aspects: {{{investmentAspects}}}

Based on the information above, provide a summary that covers:
1. A brief overview of the land parcel.
2. The environmental impact and carbon credit generation potential.
3. The key financial and investment highlights, including potential returns and any notable risks.

The summary should be professional, clear, and compelling for an investor.`,
});

const generateMarketplaceSummaryFlow = ai.defineFlow(
  {
    name: 'generateMarketplaceSummaryFlow',
    inputSchema: GenerateMarketplaceSummaryInputSchema,
    outputSchema: GenerateMarketplaceSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate marketplace summary.');
    }
    return output;
  }
);
