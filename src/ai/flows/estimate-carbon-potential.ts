'use server';
/**
 * @fileOverview An AI agent for estimating carbon sequestration potential and projected carbon credits of a land parcel.
 *
 * - estimateCarbonPotential - A function that handles the carbon estimation process.
 * - EstimateCarbonPotentialInput - The input type for the estimateCarbonPotential function.
 * - EstimateCarbonPotentialOutput - The return type for the estimateCarbonPotential function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EstimateCarbonPotentialInputSchema = z.object({
  landAreaAcres: z
    .number()
    .positive()
    .describe('The total area of the land parcel in acres.'),
  soilType: z
    .string()
    .describe('The type of soil present in the land parcel (e.g., clay, sand, loam, peat, silt).'),
  vegetationType: z
    .string()
    .describe('The dominant vegetation type (e.g., forest, grassland, agricultural, wetlands).'),
  climateZone: z
    .string()
    .describe('The climate zone of the land parcel (e.g., tropical, temperate, arid, polar).'),
  historicalLandUse: z
    .string()
    .describe('The historical use of the land (e.g., previously agricultural, untouched forest, degraded land).'),
  locationDescription: z
    .string()
    .describe(
      'A brief description of the land parcel\'s location, topography, and any unique environmental features.'
    ),
});
export type EstimateCarbonPotentialInput = z.infer<
  typeof EstimateCarbonPotentialInputSchema
>;

const EstimateCarbonPotentialOutputSchema = z.object({
  carbonSequestrationPotentialTonsPerYear: z
    .number()
    .positive()
    .describe('Estimated tons of CO2 sequestered per year by the land parcel.'),
  projectedCarbonCreditsPerYear: z
    .number()
    .int()
    .positive()
    .describe(
      'Estimated number of carbon credits generated per year (1 credit = 1 ton of CO2e) based on sequestration potential.'
    ),
  estimationDetails: z
    .string()
    .describe(
      'A detailed explanation of the carbon estimation, including factors considered, methodologies, and assumptions made.'
    ),
  recommendations: z
    .string()
    .describe(
      'Recommendations for improving carbon sequestration, enhancing biodiversity, and maximizing credit generation potential.'
    ),
});
export type EstimateCarbonPotentialOutput = z.infer<
  typeof EstimateCarbonPotentialOutputSchema
>;

export async function estimateCarbonPotential(
  input: EstimateCarbonPotentialInput
): Promise<EstimateCarbonPotentialOutput> {
  return estimateCarbonPotentialFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateCarbonPotentialPrompt',
  input: { schema: EstimateCarbonPotentialInputSchema },
  output: { schema: EstimateCarbonPotentialOutputSchema },
  prompt: `You are an expert in carbon accounting, land management, and environmental science. Your task is to dynamically estimate the carbon sequestration potential and projected carbon credits for a given land parcel based on its characteristics.

Provide quantitative estimates for annual carbon sequestration (in tons of CO2e) and the corresponding number of carbon credits. Also, offer a detailed explanation of your estimation process, including key factors and assumptions, and provide practical recommendations for improvement.

Land Parcel Characteristics:
- Land Area: {{{landAreaAcres}}} acres
- Soil Type: {{{soilType}}}
- Vegetation Type: {{{vegetationType}}}
- Climate Zone: {{{climateZone}}}
- Historical Land Use: {{{historicalLandUse}}}
- Location Description: {{{locationDescription}}}

Consider the interplay of these factors to provide the most accurate and actionable estimates. Remember to format your output according to the specified schema, including the detailed explanations and recommendations.`,
});

const estimateCarbonPotentialFlow = ai.defineFlow(
  {
    name: 'estimateCarbonPotentialFlow',
    inputSchema: EstimateCarbonPotentialInputSchema,
    outputSchema: EstimateCarbonPotentialOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
