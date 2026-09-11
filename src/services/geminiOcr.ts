// MediVault-AI — Gemini 1.5 Flash Vision OCR Service
// Specialized in extracting structured clinical laboratory data from scanned documents

export interface ExtractedLabData {
  testName: string;
  value: number;
  unit: string;
  referenceRange: string;
  referenceRangeLow: number | null;
  referenceRangeHigh: number | null;
  date: string;
  facility: string;
  confidence: number;
  rawSummary?: string;
  lowConfidenceReason?: string;
}

export function getGeminiApiKey(): string {
  return (
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (import.meta as any).env?.GEMINI_API_KEY ||
    localStorage.getItem('medivault_gemini_api_key') ||
    ''
  );
}

export function setGeminiApiKey(key: string): void {
  localStorage.setItem('medivault_gemini_api_key', key.trim());
}

/**
 * Converts a File or Blob into a base64 string without data prefix
 */
export async function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes('base64,') ? result.split('base64,')[1] : result;
      const mimeType = file.type || 'image/jpeg';
      resolve({ base64, mimeType });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Sends a lab report image to Gemini 1.5 Flash Vision and returns structured JSON
 */
export async function extractLabReportWithGemini(
  file: File,
  customApiKey?: string
): Promise<ExtractedLabData> {
  const apiKey = customApiKey || getGeminiApiKey();

  if (!apiKey) {
    throw new Error(
      'Gemini API Key not found. Please paste VITE_GEMINI_API_KEY in your .env file or enter it in the prompt.'
    );
  }

  const { base64, mimeType } = await fileToBase64(file);

  const prompt = `You are a clinical diagnostics OCR engine specialized in extracting medical lab test results.
Analyze this laboratory report image carefully.
Extract the primary diagnostic test information (e.g. Fasting Blood Glucose, HbA1c, Serum Creatinine, Total Cholesterol, Lipid Panel, Complete Blood Count).

Return ONLY a JSON object with this exact structure:
{
  "testName": "string (e.g. Fasting Blood Glucose)",
  "value": number (numeric value only, e.g. 138 or 7.1),
  "unit": "string (e.g. mg/dL, %, g/dL, mmol/L)",
  "referenceRange": "string (e.g. 70 - 99 mg/dL)",
  "referenceRangeLow": number or null (e.g. 70),
  "referenceRangeHigh": number or null (e.g. 99),
  "date": "string in YYYY-MM-DD format (if not found in document use ${new Date().toISOString().split('T')[0]})",
  "facility": "string (name of the laboratory or hospital, e.g. Apollo Diagnostics, Max Healthcare, Fortis, Dr Lal PathLabs)",
  "confidence": number between 40 and 99 (estimate extraction confidence score percentage based on image legibility, blur, handwriting vs print),
  "rawSummary": "brief 1-sentence description of what you observed on the report",
  "lowConfidenceReason": "string (optional explanation if confidence is below 85, e.g. blurred text or handwritten note)"
}

Do not include any explanation outside the JSON.`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      response_mime_type: 'application/json',
    },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    let message = `Gemini API error (${response.status})`;
    try {
      const errJson = JSON.parse(errText);
      message = errJson.error?.message || message;
    } catch {
      message = errText || message;
    }
    throw new Error(message);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('Gemini returned an empty response from this image.');
  }

  // Parse JSON (stripping markdown fences if present)
  let cleanJson = rawText.trim();
  if (cleanJson.startsWith('```json')) {
    cleanJson = cleanJson.slice(7);
  } else if (cleanJson.startsWith('```')) {
    cleanJson = cleanJson.slice(3);
  }
  if (cleanJson.endsWith('```')) {
    cleanJson = cleanJson.slice(0, -3);
  }
  cleanJson = cleanJson.trim();

  const parsed = JSON.parse(cleanJson) as ExtractedLabData;

  // Validate and sanitize types
  const numericValue = typeof parsed.value === 'number' ? parsed.value : parseFloat(String(parsed.value)) || 0;
  const confidenceScore = typeof parsed.confidence === 'number' ? Math.min(99.5, Math.max(40, parsed.confidence)) : 92.5;

  return {
    testName: parsed.testName || 'Diagnostic Investigation',
    value: numericValue,
    unit: parsed.unit || 'mg/dL',
    referenceRange: parsed.referenceRange || 'Standard reference range',
    referenceRangeLow: parsed.referenceRangeLow ?? null,
    referenceRangeHigh: parsed.referenceRangeHigh ?? null,
    date: parsed.date || new Date().toISOString().split('T')[0],
    facility: parsed.facility || 'Hospital Diagnostic Laboratory',
    confidence: confidenceScore,
    rawSummary: parsed.rawSummary,
    lowConfidenceReason: parsed.lowConfidenceReason,
  };
}
