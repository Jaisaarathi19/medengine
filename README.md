# MedEngine AI Hospital Monitoring System

A cutting-edge hospital management system built with Next.js, featuring role-based dashboards, AI-powered chatbot, and advanced UI/UX with glassmorphism effects and smooth animations.

## 🚀 Features

### Core Functionality
- **Role-Based Dashboards**: Separate interfaces for Doctors, Nurses, Patients, and Administrators
- **AI-Powered Chatbot**: Integrated Google Gemini AI for medical assistance and queries
- **Patient Management**: Complete patient registration, profile management, and medical history
- **Appointment Booking**: Streamlined appointment scheduling system
- **Prescription Management**: Digital prescription creation and tracking
- **Vital Signs Monitoring**: Upload and track patient vital signs
- **Real-time Notifications**: Firebase-powered notification system

### Technical Excellence
- **Advanced Animations**: Smooth, professional animations using Framer Motion
- **Glassmorphism UI**: Modern glass-like effects and gradients
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **TypeScript**: Full type safety and better development experience
- **Firebase Integration**: Real-time database, authentication, and analytics
- **Modern Architecture**: Next.js 15 with App Router and React 19

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Custom CSS with Glassmorphism
- **Animations**: Framer Motion 11
- **Backend**: Firebase (Firestore, Auth, Analytics)
- **AI**: Google Gemini AI
- **Icons**: Heroicons
- **Deployment**: Vercel
- **Version Control**: Git, GitHub

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project with Firestore enabled

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Jaisaarathi19/medengine.git
cd medengine
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

4. **Initialize Firebase data** (optional)
```bash
npm run firebase:setup
```

5. **Start the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Role-based dashboards
│   ├── login/             # Authentication
│   └── globals.css        # Global styles with custom animations
├── components/            # Reusable React components
│   └── Chatbot.tsx       # AI-powered chatbot
├── lib/                  # Utility functions and configurations
│   ├── firestore/        # Firebase Firestore utilities
│   ├── firebase.ts       # Firebase configuration
│   └── gemini.ts         # Google Gemini AI configuration
└── types/                # TypeScript type definitions
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run firebase:setup` - Initialize Firestore with sample data
- `npm run firebase:test` - Test Firebase connection

## 🎨 UI/UX Features

- **Glassmorphism Effects**: Modern glass-like transparency effects
- **Gradient Backgrounds**: Dynamic animated gradient backgrounds
- **Smooth Animations**: Professional animations and transitions
- **Interactive Elements**: Hover effects and micro-interactions
- **Responsive Design**: Optimized for all device sizes
- **Dark Theme Support**: Built-in dark mode compatibility

## 🔐 Authentication & Security

- Firebase Authentication for secure user management
- Role-based access control (RBAC)
- Protected routes and API endpoints
- Secure data handling and validation

## 📱 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm run start
```
# medengine
# medengine
# medengine
