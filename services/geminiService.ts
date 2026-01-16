import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MilitaryRecord } from "../types";

// Schema definition to enforce strict JSON output from Gemini
const recordSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      militaryNumber: { type: Type.STRING, description: "رقم العسكري (Military Number) found on the far right" },
      rank: { type: Type.STRING, description: "الرتبة (Rank) found in the second column from right" },
      name: { type: Type.STRING, description: "الاسم (Name) found in the third column from right" },
      date: { type: Type.STRING, description: "تاريخ الاستشهاد (Date) - maintain format DD/MM/YYYY" },
      location: { type: Type.STRING, description: "المكان (Location) e.g., Tripoli, Derna" },
      nationalId: { type: Type.STRING, description: "الرقم الوطني (National ID) - long number ~12 digits" },
    },
    required: ["militaryNumber", "rank", "name", "date", "location", "nationalId"],
  },
};

export const processImageWithGemini = async (base64Image: string): Promise<MilitaryRecord[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Using Flash for speed and excellent vision capabilities
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: `
              Analyze this image containing a military data table in Arabic.
              The table is oriented Right-to-Left (RTL).
              
              Extract the data into a JSON array based on these columns (from Right to Left):
              1. Military Number (رقم العسكري)
              2. Rank (رتبة)
              3. Name (الاسم)
              4. Date (تاريخ الاستشهاد)
              5. Location (مكان الاستشهاد)
              6. National ID (الرقم الوطني)

              Clean the data:
              - Remove any non-numeric characters from IDs.
              - Fix common OCR errors in Arabic names.
              - Ensure dates are DD/MM/YYYY.
              - If a cell is empty or illegible, use an empty string.
              - Ignore the header row.
            `,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: recordSchema,
        temperature: 0.1, // Low temperature for factual extraction
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned from AI");

    const parsedData = JSON.parse(jsonText);
    
    // Add the empty notes field as requested
    return parsedData.map((item: any) => ({
      ...item,
      notes: "" 
    }));

  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw new Error("فشل في معالجة الصورة. يرجى التأكد من وضوح الجدول والمحاولة مرة أخرى.");
  }
};