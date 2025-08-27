# MedEngine AI Hospital Monitoring System

A comprehensive Next.js-based hospital management system with role-based dashboards, real-time patient monitoring, and AI-powered health risk assessment.

## 🚀 Features

### Role-Based Dashboards
- **Doctor Dashboard**: Patient management, appointment scheduling, real-time high-risk patient monitoring
- **Patient Dashboard**: Medical records access, appointment booking, health vitals tracking
- **Nurse Dashboard**: Patient care coordination, vitals monitoring, medication tracking
- **Admin Dashboard**: System administration, user management, hospital analytics

### Real-Time Patient Monitoring
- **High-Risk Patient Detection**: ML-powered risk assessment with real-time alerts
- **Vital Signs Tracking**: Continuous monitoring of patient health metrics
- **Notification System**: Instant alerts for critical patient conditions
- **Recovery Analytics**: Patient recovery rate tracking and reporting

### Advanced Features
- **AI Chatbot**: Powered by Google Gemini AI for medical consultations
- **Firebase Integration**: Real-time data synchronization and secure authentication
- **Responsive Design**: Modern glassmorphism UI with Tailwind CSS
- **Data Analytics**: Comprehensive reporting and statistical analysis

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Firebase Firestore, Authentication
- **AI Integration**: Google Gemini API, Local ML Models
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: Firestore NoSQL Database
- **Authentication**: Firebase Auth with role-based access control

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/medengine.git
   cd medengine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Configure Firebase**
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Set up Firestore security rules (see `firestore.rules`)

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏥 Usage

### User Roles & Access
- **Doctors**: Full access to patient records, prescription management, risk assessment
- **Nurses**: Patient care coordination, vitals monitoring, medication tracking
- **Patients**: Personal health records, appointment booking, communication with care team
- **Admins**: System configuration, user management, analytics dashboard

### Key Workflows

#### High-Risk Patient Management
1. ML models continuously analyze patient data
2. High-risk patients are automatically flagged
3. Real-time notifications sent to care team
4. Filterable dashboard for quick patient triage

#### Appointment Scheduling
1. Patients book appointments through their dashboard
2. Doctors manage schedules and availability
3. Automated reminders and notifications
4. Real-time calendar synchronization

#### Prescription Management
1. Doctors create digital prescriptions
2. Integration with patient medical history
3. Drug interaction checking
4. Digital prescription delivery

## 🔧 Development

### Project Structure
```
src/
├── app/                    # Next.js app router pages
│   ├── dashboard/         # Role-based dashboards
│   ├── api/               # API routes
│   └── [features]/        # Feature-specific pages
├── components/            # Reusable React components
├── contexts/              # React contexts (Auth, etc.)
├── lib/                   # Utility libraries
│   ├── firestore/         # Firestore service modules
│   ├── firebase.ts        # Firebase configuration
│   └── gemini.ts          # AI integration
└── types/                 # TypeScript type definitions
```

### Key Services
- **Authentication**: `src/lib/auth.ts`
- **Database Operations**: `src/lib/firestore/`
- **AI Integration**: `src/lib/gemini.ts`
- **Real-time Stats**: `src/lib/firestore/dashboard-stats.ts`

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
```

## 📊 Real-Time Features

The system provides real-time updates for:
- Patient vital signs and health metrics
- High-risk patient alerts and notifications
- Appointment scheduling and calendar updates
- Dashboard statistics and analytics
- Inter-team communication and messaging

## 🔐 Security

- **Firebase Authentication**: Secure user authentication and session management
- **Role-Based Access Control**: Granular permissions based on user roles
- **Data Encryption**: All sensitive data encrypted in transit and at rest
- **HIPAA Compliance**: Designed with healthcare data privacy standards in mind

## 🤖 AI Integration

### Gemini AI Chatbot
- Natural language medical consultations
- Symptom analysis and triage recommendations
- Medical knowledge base integration
- Multi-language support

### Machine Learning Models
- Risk prediction algorithms
- Patient outcome forecasting
- Treatment recommendation systems
- Automated health monitoring

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- Desktop computers (primary healthcare workstations)
- Tablet devices (mobile rounds and patient bedside)
- Smartphone access (emergency situations and remote monitoring)

## 🚀 Deployment

### Vercel Deployment (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on every push to main branch

### Manual Deployment
1. Build the application: `npm run build`
2. Deploy the `out` folder to your hosting provider
3. Ensure environment variables are configured on the server

## 🧪 Sample Data

The system includes sample data for testing:
- Sample patients, medical records, and prescriptions
- Test user accounts for each role
- Mock appointment data and vital signs
- Example high-risk patient scenarios

## 📈 Performance

- **Optimized for Speed**: Next.js optimizations, lazy loading, code splitting
- **Real-time Updates**: Efficient Firestore listeners with minimal re-renders
- **Caching Strategy**: Intelligent caching for frequently accessed data
- **Mobile Performance**: Optimized for healthcare professionals on-the-go

## 🛡️ Error Handling

- Comprehensive error boundaries
- User-friendly error messages
- Automatic retry mechanisms for failed operations
- Detailed logging for debugging and monitoring

## 📞 Support

For technical support or feature requests:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the troubleshooting guides in project files

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏆 Contributors

Built with ❤️ for healthcare professionals worldwide.

---

**Note**: This system is designed for educational and demonstration purposes. For production use in healthcare environments, ensure compliance with local healthcare regulations and data protection laws.
