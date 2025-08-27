#!/usr/bin/env node

/**
 * Test Gemini AI Integration
 * This script tests if the Gemini API is working correctly
 */

const { generatePrediction, chatbotResponse } = require('../src/lib/gemini.ts');

// Sample patient data for testing
const samplePatients = [
  {
    id: 'P001',
    name: 'John Smith',
    age: 65,
    conditions: ['Diabetes', 'Hypertension'],
    previousAdmissions: 3,
    medicationCompliance: 'Poor'
  },
  {
    id: 'P002', 
    name: 'Jane Doe',
    age: 45,
    conditions: ['Asthma'],
    previousAdmissions: 0,
    medicationCompliance: 'Good'
  }
];

async function testGeminiIntegration() {
  try {
    console.log('🤖 Testing Gemini AI Integration...\n');
    
    // Test 1: Prediction Generation
    console.log('📊 Testing prediction generation...');
    const predictions = await generatePrediction(samplePatients);
    console.log('✅ Predictions generated successfully:');
    console.log(JSON.stringify(predictions, null, 2));
    console.log('');
    
    // Test 2: Chatbot Response
    console.log('💬 Testing chatbot response...');
    const chatResponse = await chatbotResponse('What are the visiting hours?');
    console.log('✅ Chatbot response:');
    console.log(chatResponse);
    console.log('');
    
    console.log('🎉 All Gemini AI tests passed successfully!');
    console.log('Your API key is working correctly.');
    
  } catch (error) {
    console.error('❌ Gemini AI test failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Check your API key in .env.local');
    console.log('2. Ensure you have internet connection');
    console.log('3. Verify API key permissions in Google AI Studio');
  }
}

testGeminiIntegration();
