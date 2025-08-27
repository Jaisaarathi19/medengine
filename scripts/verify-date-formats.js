// Verify date formats in Firestore collections
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAP_h7PbUsW6e1OGXnrG-L6aMnU8BpKKhs",
  authDomain: "medengine-ai.firebaseapp.com",
  projectId: "medengine-ai",
  storageBucket: "medengine-ai.firebasestorage.app",
  messagingSenderId: "850330897754",
  appId: "1:850330897754:web:5a7b4bbded60e3bb5f8bc9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Utility function to safely parse dates from Firestore (same as utils.ts)
function safeParseDate(date) {
  if (!date) return null;
  
  if (date instanceof Date) return date;
  
  // Handle Firestore Timestamp objects
  if (date && typeof date.toDate === 'function') {
    return date.toDate();
  }
  
  // Handle Firestore Timestamp-like objects with seconds and nanoseconds
  if (date && typeof date.seconds === 'number') {
    return new Date(date.seconds * 1000 + (date.nanoseconds || 0) / 1000000);
  }
  
  // Handle strings and numbers
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? null : parsed;
}

async function verifyDateFormats() {
  console.log('🔍 Verifying date formats in Firestore collections...\n');

  const collectionsToCheck = ['vitals', 'vital_signs', 'medications', 'prescriptions', 'appointments', 'labResults'];

  for (const collectionName of collectionsToCheck) {
    console.log(`\n📄 Checking ${collectionName} collection:`);
    
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      
      if (querySnapshot.empty) {
        console.log('  ⚪ Collection is empty');
        continue;
      }

      let validDates = 0;
      let invalidDates = 0;
      let totalDocs = querySnapshot.docs.length;

      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        
        // Check common date fields
        const dateFields = ['createdAt', 'date', 'measurementTime', 'updatedAt'];
        
        dateFields.forEach(field => {
          if (data[field]) {
            const parsedDate = safeParseDate(data[field]);
            if (!parsedDate) {
              console.log(`  ❌ Invalid date in doc ${doc.id}, field ${field}: ${data[field]}`);
              invalidDates++;
            } else {
              validDates++;
            }
          }
        });

        // Check nested date fields
        if (data.metadata && data.metadata.createdAt) {
          const parsedDate = safeParseDate(data.metadata.createdAt);
          if (!parsedDate) {
            console.log(`  ❌ Invalid date in doc ${doc.id}, field metadata.createdAt: ${data.metadata.createdAt}`);
            invalidDates++;
          } else {
            validDates++;
          }
        }

        if (data.metadata && data.metadata.measurementTime) {
          const parsedDate = safeParseDate(data.metadata.measurementTime);
          if (!parsedDate) {
            console.log(`  ❌ Invalid date in doc ${doc.id}, field metadata.measurementTime: ${data.metadata.measurementTime}`);
            invalidDates++;
          } else {
            validDates++;
          }
        }
      });

      console.log(`  📊 Total documents: ${totalDocs}`);
      console.log(`  ✅ Valid dates: ${validDates}`);
      console.log(`  ❌ Invalid dates: ${invalidDates}`);
      
      if (invalidDates === 0) {
        console.log(`  🎉 All dates are valid!`);
      } else {
        console.log(`  ⚠️  Found ${invalidDates} invalid dates`);
      }

    } catch (error) {
      console.log(`  🔥 Error checking collection: ${error.message}`);
    }
  }

  console.log('\n✅ Date verification complete!');
}

verifyDateFormats();
