# Deployment Guide for MedEngine AI

## Vercel Deployment Setup

### 1. Environment Variables Configuration

Before deploying, you need to configure the following environment variables in your Vercel dashboard:

#### Firebase Configuration:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

#### AI Configuration:
```
GEMINI_API_KEY=your_gemini_api_key
```

### 2. How to Add Environment Variables in Vercel:

1. Go to your Vercel dashboard
2. Select your project (medengine)
3. Navigate to "Settings" → "Environment Variables"
4. Add each variable with its corresponding value
5. Make sure to select "Production", "Preview", and "Development" environments

### 3. Firebase Setup:

1. Create a new Firebase project at https://console.firebase.google.com
2. Enable Authentication and Firestore Database
3. Get your Firebase configuration from Project Settings
4. Add the configuration values to Vercel environment variables

### 4. Gemini AI Setup:

1. Get your Gemini API key from Google AI Studio
2. Add it as `GEMINI_API_KEY` in Vercel

### 5. Redeploy:

After adding all environment variables, trigger a new deployment by pushing a commit or using the Vercel dashboard.

## Local Development

1. Copy `.env.example` to `.env.local`
2. Fill in your actual Firebase and Gemini API keys
3. Run `npm run dev`

## Build Verification

To test the build locally:
```bash
npm run build
npm run start
```

## Troubleshooting

- **Firebase Error**: Ensure all Firebase environment variables are correctly set
- **Build Failures**: Check that all required dependencies are in package.json
- **API Errors**: Verify API keys are valid and have proper permissions
