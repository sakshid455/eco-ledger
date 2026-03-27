import { config } from 'dotenv';
config();

import '@/ai/flows/extract-document-info.ts';
import '@/ai/flows/generate-marketplace-summary.ts';
import '@/ai/flows/estimate-carbon-potential.ts';