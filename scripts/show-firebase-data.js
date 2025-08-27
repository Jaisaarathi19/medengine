const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const { getAuth, listUsers } = require('firebase-admin/auth');
const admin = require('firebase-admin');

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAP_hmHCz5MvtljNvXFTlBd7j5Cpt2MhCk",
  authDomain: "medengineai-7755c.firebaseapp.com",
  projectId: "medengineai-7755c",
  storageBucket: "medengineai-7755c.firebasestorage.app",
  messagingSenderId: "665693476108",
  appId: "1:665693476108:web:3f3e2dbde7c1b24a0e0c63",
  measurementId: "G-M5CNQV1N77"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function showFirebaseData() {
  console.log('🔍 FIREBASE DATA OVERVIEW');
  console.log('=' .repeat(60));
  console.log(`📍 Project: medengineai-7755c`);
  console.log(`🌐 Console: https://console.firebase.google.com/project/medengineai-7755c/firestore/data`);
  console.log('=' .repeat(60));

  try {
    // Show Users Collection
    console.log('\n👤 USERS COLLECTION:');
    console.log('-'.repeat(40));
    const usersSnapshot = await getDocs(collection(db, 'users'));
    
    if (usersSnapshot.empty) {
      console.log('   📭 No users found in Firestore');
    } else {
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`   ✅ User ID: ${doc.id}`);
        console.log(`      Email: ${data.email}`);
        console.log(`      Role: ${data.role}`);
        console.log(`      Name: ${data.profile?.name || 'N/A'}`);
        console.log('');
      });
    }

    // Show Patients Collection
    console.log('\n🏥 PATIENTS COLLECTION:');
    console.log('-'.repeat(40));
    const patientsSnapshot = await getDocs(collection(db, 'patients'));
    
    if (patientsSnapshot.empty) {
      console.log('   📭 No patients found');
      console.log('   💡 Create a patient at: http://localhost:3001/create-patient');
    } else {
      patientsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`   🏥 Patient ID: ${data.patientId || doc.id}`);
        console.log(`      Name: ${data.profile?.name}`);
        console.log(`      Email: ${data.email}`);
        console.log(`      Blood Type: ${data.profile?.medical?.bloodType || 'N/A'}`);
        console.log('');
      });
    }

    // Show Appointments Collection
    console.log('\n📅 APPOINTMENTS COLLECTION:');
    console.log('-'.repeat(40));
    const appointmentsSnapshot = await getDocs(collection(db, 'appointments'));
    
    if (appointmentsSnapshot.empty) {
      console.log('   📭 No appointments found');
      console.log('   💡 Book an appointment at: http://localhost:3001/book-appointment');
    } else {
      appointmentsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`   📅 Appointment: ${data.appointmentId}`);
        console.log(`      Patient: ${data.patient?.name}`);
        console.log(`      Doctor: ${data.doctor?.name}`);
        console.log(`      Date: ${data.schedule?.date} at ${data.schedule?.time}`);
        console.log(`      Status: ${data.status}`);
        console.log('');
      });
    }

    // Show Notifications Collection
    console.log('\n🔔 NOTIFICATIONS COLLECTION:');
    console.log('-'.repeat(40));
    const notificationsSnapshot = await getDocs(collection(db, 'notifications'));
    
    if (notificationsSnapshot.empty) {
      console.log('   📭 No notifications found');
    } else {
      notificationsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`   🔔 Notification: ${doc.id}`);
        console.log(`      Type: ${data.type}`);
        console.log(`      Title: ${data.title}`);
        console.log(`      Read: ${data.read ? 'Yes' : 'No'}`);
        console.log('');
      });
    }

    console.log('\n🎯 FIREBASE CONSOLE ACCESS:');
    console.log('-'.repeat(40));
    console.log('   1. Go to: https://console.firebase.google.com/');
    console.log('   2. Select project: medengineai-7755c');
    console.log('   3. Click: Firestore Database → Data');
    console.log('   4. Browse collections: users, patients, appointments');
    console.log('');
    console.log('🔐 If you see "unknown error", try:');
    console.log('   - Use correct Google account');
    console.log('   - Try incognito/private browsing');  
    console.log('   - Clear browser cache');

  } catch (error) {
    console.error('❌ Error fetching data:', error.message);
    console.log('\n💡 This might mean:');
    console.log('   - Network connection issue');
    console.log('   - Firestore security rules blocking access');
    console.log('   - Invalid configuration');
  }
}

showFirebaseData().then(() => {
  console.log('\n✅ Data overview completed!');
  process.exit(0);
}).catch(console.error);
