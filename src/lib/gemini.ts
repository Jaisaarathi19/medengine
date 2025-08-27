import { GoogleGenerativeAI } from '@google/generative-ai';

// Check if API key is available and valid
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const isValidApiKey = apiKey && apiKey !== 'AIzaSyExample_YourGeminiApiKeyHere' && apiKey.startsWith('AIzaSy');

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

if (isValidApiKey) {
  genAI = new GoogleGenerativeAI(apiKey!);
  model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
}

export { model };

export async function generatePrediction(patientData: unknown[]) {
  // Return mock data if API key is not valid
  if (!isValidApiKey) {
    console.warn('Gemini API key not configured - using mock data');
    return {
      totalPatients: Array.isArray(patientData) ? patientData.length : 0,
      highRisk: 2,
      mediumRisk: 3,
      lowRisk: 5,
      patients: [
        {
          id: "P001",
          name: "John Smith",
          riskLevel: "High",
          riskFactors: ["Previous readmissions", "Multiple comorbidities"]
        },
        {
          id: "P002",
          name: "Maria Rodriguez",
          riskLevel: "Low",
          riskFactors: ["Good medication compliance"]
        }
      ]
    };
  }

  const prompt = `
    Analyze the following patient discharge data and predict readmission risk:
    ${JSON.stringify(patientData)}
    
    Classify each patient as High Risk, Medium Risk, or Low Risk for readmission.
    Return ONLY valid JSON in this exact format (no markdown, no code blocks, no extra text):
    {
      "totalPatients": number,
      "highRisk": number,
      "mediumRisk": number,
      "lowRisk": number,
      "patients": [
        {
          "id": "patient_id",
          "name": "patient_name",
          "riskLevel": "High",
          "riskFactors": ["factor1", "factor2"]
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let responseText = response.text();
    
    // Clean the response text - remove markdown code blocks if present
    responseText = responseText.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
    
    return JSON.parse(responseText);
  } catch (error) {
    console.error('AI prediction error:', error);
    // Return mock data on error
    return {
      totalPatients: Array.isArray(patientData) ? patientData.length : 0,
      highRisk: 1,
      mediumRisk: 2,
      lowRisk: 3,
      patients: [
        {
          id: "P001",
          name: "Sample Patient",
          riskLevel: "Medium",
          riskFactors: ["API Error - Using fallback data"]
        }
      ]
    };
  }
}

export async function generatePatientSummary(patientData: unknown) {
  // Return mock summary if API key is not valid
  if (!isValidApiKey) {
    console.warn('Gemini API key not configured - using mock summary');
    return "Patient Summary: API key not configured. Please set up your Gemini API key to enable AI-powered patient summaries.";
  }

  const prompt = `
    Create a comprehensive summary of this patient's medical data:
    ${JSON.stringify(patientData)}
    
    Include key medical history, current vitals, risk factors, and recommendations.
    Keep it concise but informative for healthcare professionals.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('AI summary error:', error);
    return "Patient Summary: Unable to generate AI summary at this time. Please check your API configuration.";
  }
}

export async function chatbotResponse(message: string, context?: string) {
  // Return helpful message if API key is not valid
  if (!isValidApiKey) {
    console.warn('Gemini API key not configured - using fallback response');
    return "I'm the MedEngine AI assistant, but I need a valid Gemini API key to provide intelligent responses. Please configure your API key in the .env.local file to enable full AI features. In the meantime, you can explore the dashboards and patient management features!";
  }

  const prompt = `
    You are a helpful hospital assistant AI. Answer only hospital-related queries.
    Context: ${context || 'General hospital information'}
    Question: ${message}
    
    Provide helpful, accurate information related to hospital operations, patient care, or medical procedures.
    If the question is not hospital-related, politely redirect to hospital topics.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Chatbot error:', error);
    return "I'm experiencing technical difficulties right now. Please check your API configuration or try again later.";
  }
}
