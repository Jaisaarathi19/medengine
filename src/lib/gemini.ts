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
  const totalPatients = Array.isArray(patientData) ? patientData.length : 0;
  console.log('🔬 Gemini generatePrediction called with', totalPatients, 'patients');
  
  // Return mock data if API key is not valid
  if (!isValidApiKey) {
    console.warn('Gemini API key not configured - using mock data');
    
    // Calculate realistic risk distribution based on actual data size
    const highRisk = Math.ceil(totalPatients * 0.3); // 30% high risk
    const mediumRisk = Math.ceil(totalPatients * 0.4); // 40% medium risk  
    const lowRisk = totalPatients - highRisk - mediumRisk; // Remaining as low risk
    
    console.log('📊 Mock risk distribution:', { totalPatients, highRisk, mediumRisk, lowRisk });
    
    // Generate mock patient data matching the actual uploaded data
    const mockPatients = [];
    for (let i = 0; i < Math.min(totalPatients, 10); i++) { // Show first 10 for display
      const riskLevel = i < highRisk ? 'High' : i < (highRisk + mediumRisk) ? 'Medium' : 'Low';
      mockPatients.push({
        id: `P${(i + 1).toString().padStart(3, '0')}`,
        name: `Patient ${i + 1}`,
        riskLevel,
        riskFactors: riskLevel === 'High' ? ["High risk factors detected"] : 
                    riskLevel === 'Medium' ? ["Moderate risk factors"] : 
                    ["Low risk profile"]
      });
    }
    
    return {
      totalPatients,
      highRisk,
      mediumRisk,
      lowRisk,
      patients: mockPatients
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
    console.log('🤖 Calling Gemini AI with', totalPatients, 'patients');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let responseText = response.text();
    
    console.log('🎯 Raw AI response:', responseText.substring(0, 200) + '...');
    
    // Clean the response text - remove markdown code blocks if present
    responseText = responseText.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
    
    const parsedResult = JSON.parse(responseText);
    console.log('📋 Parsed AI result:', parsedResult);
    
    return parsedResult;
  } catch (error) {
    console.error('AI prediction error:', error);
    
    const totalPatients = Array.isArray(patientData) ? patientData.length : 0;
    
    // Calculate realistic risk distribution based on actual data size
    const highRisk = Math.ceil(totalPatients * 0.3); // 30% high risk
    const mediumRisk = Math.ceil(totalPatients * 0.4); // 40% medium risk  
    const lowRisk = totalPatients - highRisk - mediumRisk; // Remaining as low risk
    
    // Generate fallback patient data matching the actual uploaded data
    const fallbackPatients = [];
    for (let i = 0; i < Math.min(totalPatients, 10); i++) { // Show first 10 for display
      const riskLevel = i < highRisk ? 'High' : i < (highRisk + mediumRisk) ? 'Medium' : 'Low';
      fallbackPatients.push({
        id: `P${(i + 1).toString().padStart(3, '0')}`,
        name: `Patient ${i + 1}`,
        riskLevel,
        riskFactors: ["API Error - Using fallback data"]
      });
    }
    
    // Return mock data on error
    return {
      totalPatients,
      highRisk,
      mediumRisk,
      lowRisk,
      patients: fallbackPatients
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
