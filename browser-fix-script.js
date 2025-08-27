// Quick fix script to run in browser console
// This will create the user role document for the currently logged-in user

// Run this script in the browser console after logging in
async function createUserDocument() {
  try {
    // Get the current user
    const user = auth.currentUser;
    if (!user) {
      console.error('No user is currently logged in');
      return;
    }
    
    console.log('Creating user document for:', user.email);
    console.log('User UID:', user.uid);
    
    // Determine role based on email
    let role = 'patient';
    let profile = { name: 'Unknown User' };
    
    if (user.email === 'admin@medengine.com') {
      role = 'admin';
      profile = {
        name: 'Dr. Sarah Johnson',
        department: 'Administration',
        phone: '+1-555-0101',
        specialization: 'Hospital Administration'
      };
    } else if (user.email === 'doctor@medengine.com') {
      role = 'doctor';
      profile = {
        name: 'Dr. Michael Chen',
        department: 'Cardiology',
        phone: '+1-555-0102',
        specialization: 'Cardiologist',
        licenseNumber: 'MD-12345'
      };
    } else if (user.email === 'nurse@medengine.com') {
      role = 'nurse';
      profile = {
        name: 'Emily Rodriguez',
        department: 'Emergency',
        phone: '+1-555-0103',
        shift: 'Day Shift',
        licenseNumber: 'RN-67890'
      };
    } else if (user.email === 'patient@medengine.com') {
      role = 'patient';
      profile = {
        name: 'John Smith',
        dateOfBirth: '1985-06-15',
        phone: '+1-555-0104',
        address: '123 Main St, City, State 12345',
        emergencyContact: 'Jane Smith - +1-555-0105'
      };
    }
    
    // Create user document
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      role: role,
      profile: profile,
      createdAt: new Date(),
      lastLogin: new Date(),
      isActive: true
    });
    
    console.log('✅ User document created successfully!');
    console.log('Role:', role);
    console.log('Profile:', profile);
    console.log('You can now refresh the page to access your dashboard');
    
    // Refresh the page to reload with new role
    window.location.reload();
    
  } catch (error) {
    console.error('Error creating user document:', error);
  }
}

// Instructions to use:
console.log('='.repeat(50));
console.log('QUICK FIX FOR USER ROLE PERMISSIONS');
console.log('='.repeat(50));
console.log('1. Log in with patient@medengine.com / medengine123');
console.log('2. Open browser console (F12)');
console.log('3. Run: createUserDocument()');
console.log('4. The page will refresh automatically');
console.log('='.repeat(50));
