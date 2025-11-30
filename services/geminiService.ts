
import { GoogleGenAI, Type } from "@google/genai";
import { Tour, MatchResult, TravelerRequest, PricingSchema } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  /**
   * AI Match: Analyzes Tours (not just guides) against user request
   */
  findBestTours: async (request: TravelerRequest, tours: Tour[]): Promise<MatchResult[]> => {
    // Simplify data for token efficiency
    const candidates = tours.map(t => ({
      id: t.id,
      title: t.publicData.title,
      summary: t.publicData.summary,
      price: t.pricing.basePrice,
      category: t.category,
      location: t.publicData.meetingPoint // Approximate location
    }));

    const prompt = `
      Traveler Request:
      - Interests: ${request.interests.join(', ')}
      - Group: ${request.groupSize} ppl
      - Budget: ${request.budgetRange}
      
      Available Tours:
      ${JSON.stringify(candidates)}

      Return a JSON object with a list of "matches". Each match has "tourId", "matchScore" (0-100), and "aiReasoning".
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matches: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    tourId: { type: Type.STRING },
                    matchScore: { type: Type.NUMBER },
                    aiReasoning: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });
      const json = JSON.parse(response.text || '{"matches": []}');
      return json.matches || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  /**
   * Generates Title, Summary, and HIDDEN notes based on raw input
   */
  generateTourContent: async (rawInput: string): Promise<{ public: any, private: any }> => {
    const prompt = `
      You are a professional tour guide consultant.
      Based on this rough input: "${rawInput}"
      
      Generate structured content for a tour listing.
      1. Public Content: Catchy title, marketing summary, highlights.
      2. Private Content: Logistics notes for the guide (e.g. weather backup, hidden routes).
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              public: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
                }
              },
              private: {
                type: Type.OBJECT,
                properties: {
                  logisticsNotes: { type: Type.STRING },
                  weatherBackupPlan: { type: Type.STRING }
                }
              }
            }
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error(e);
      return { public: {}, private: {} };
    }
  },

  /**
   * Suggests Pricing
   */
  suggestPricing: async (tourDescription: string, location: string): Promise<PricingSchema> => {
    const prompt = `
      Suggest a competitive price for a tour described as: "${tourDescription}" in "${location}".
      Return JSON with basePrice, currency, and suggest one add-on service.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        basePrice: { type: Type.NUMBER },
                        currency: { type: Type.STRING },
                        perPerson: { type: Type.BOOLEAN },
                        addOns: { 
                            type: Type.ARRAY, 
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    name: { type: Type.STRING },
                                    price: { type: Type.NUMBER },
                                    description: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text || '{}');
    } catch(e) {
        return { basePrice: 100, currency: 'USD', perPerson: true, addOns: [] };
    }
  }
};
