'use server';
/**
 * @fileOverview A Genkit flow for extracting key data points and summarizing uploaded land registration documents.
 *
 * - extractDocumentInfo - A function that handles the document information extraction process.
 * - ExtractDocumentInfoInput - The input type for the extractDocumentInfo function.
 * - ExtractDocumentInfoOutput - The return type for the extractDocumentInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractDocumentInfoInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The land registration document content, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractDocumentInfoInput = z.infer<
  typeof ExtractDocumentInfoInputSchema
>;

const ExtractDocumentInfoOutputSchema = z.object({
  landArea: z.string().describe('The total land area mentioned in the document.'),
  legalDescription: z
    .string()
    .describe('The legal description of the land parcel.'),
  ownershipDetails: z
    .string()
    .describe('Details about the current owner(s) of the land.'),
  summary: z.string().describe('A concise summary of the entire document.'),
});
export type ExtractDocumentInfoOutput = z.infer<
  typeof ExtractDocumentInfoOutputSchema
>;

export async function extractDocumentInfo(
  input: ExtractDocumentInfoInput
): Promise<ExtractDocumentInfoOutput> {
  return extractDocumentInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractDocumentInfoPrompt',
  input: {schema: ExtractDocumentInfoInputSchema},
  output: {schema: ExtractDocumentInfoOutputSchema},
  prompt: `You are an expert administrative assistant specializing in land registration documents.
Your task is to carefully review the provided land registration document and extract the following key data points:
- Land Area: The total area of the land parcel.
- Legal Description: The detailed legal description of the property.
- Ownership Details: Information about the current owner(s), including names and any relevant identification.

After extracting these details, provide a concise summary of the entire document.

Document: {{media url=documentDataUri}}`,
});

const extractDocumentInfoFlow = ai.defineFlow(
  {
    name: 'extractDocumentInfoFlow',
    inputSchema: ExtractDocumentInfoInputSchema,
    outputSchema: ExtractDocumentInfoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to extract document information.');
    }
    return output;
  }
);
