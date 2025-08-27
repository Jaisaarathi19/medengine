import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });

    // Create context for medical assistant
    const systemPrompt = `You are MedEngine AI, a professional healthcare assistant for a hospital management system. You are knowledgeable, empathetic, and helpful. 

Your capabilities include:
- Providing general health information and wellness tips
- Explaining medical procedures and terms in simple language
- Helping with appointment scheduling guidance
- Offering first aid and emergency guidance
- Providing medication reminders and general medication information
- Supporting mental health with encouraging words

Important guidelines:
- Always emphasize that you cannot replace professional medical advice
- Encourage users to consult healthcare professionals for serious concerns
- Be empathetic and supportive
- Keep responses concise but informative
- For emergencies, always advise calling emergency services immediately
- Never provide specific diagnoses or treatment recommendations

Current conversation context: ${conversationHistory ? conversationHistory.slice(-5).map((msg: any) => `${msg.isUser ? 'User' : 'Assistant'}: ${msg.text}`).join('\n') : 'This is the start of the conversation.'}

User message: ${message}

Please respond as MedEngine AI:`;

    // Generate response
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const aiResponse = response.text();

    return NextResponse.json({
      message: aiResponse,
      success: true,
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    
    // Fallback response if AI fails
    const fallbackResponses = [
      "I'm here to help with your healthcare questions. Could you please rephrase your question?",
      "I'm experiencing some technical difficulties right now. Please try asking your question again, or contact our support team if the issue persists.",
      "Thank you for your message. I'm currently processing your request. Please ensure your question is clear and try again.",
      "I'm MedEngine AI, and I'm here to assist you with healthcare-related questions. How can I help you today?",
    ];
    
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    return NextResponse.json({
      message: randomResponse,
      success: true,
      fallback: true,
    });
  }
}
