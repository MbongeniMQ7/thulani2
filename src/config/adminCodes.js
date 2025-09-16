// Utility functions for admin code generation and management
import { ref, set, get } from 'firebase/database';
import { database } from './firebase';

// Generate a random admin code
export const generateAdminCode = (role) => {
  const currentYear = new Date().getFullYear();
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
  const rolePrefix = role.toUpperCase();
  return `AFMA${currentYear}${rolePrefix}${randomString}`;
};

// Store admin codes in Firebase
export const storeAdminCodes = async () => {
  try {
    const overseerCode = generateAdminCode('OVERSEER');
    const pastorCode = generateAdminCode('PASTOR');
    
    const adminCodesRef = ref(database, 'adminCodes');
    await set(adminCodesRef, {
      overseer: overseerCode,
      pastor: pastorCode,
      lastUpdated: new Date().toISOString()
    });
    
    return { overseer: overseerCode, pastor: pastorCode };
  } catch (error) {
    console.error('Error storing admin codes:', error);
    throw error;
  }
};

// Get current admin codes from Firebase
export const getAdminCodes = async () => {
  try {
    const adminCodesRef = ref(database, 'adminCodes');
    const snapshot = await get(adminCodesRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      // If no codes exist, generate new ones
      return await storeAdminCodes();
    }
  } catch (error) {
    console.error('Error getting admin codes:', error);
    throw error;
  }
};

// Initialize admin codes (call this when app starts)
export const initializeAdminCodes = async () => {
  try {
    const codes = await getAdminCodes();
    return codes;
  } catch (error) {
    console.error('Error initializing admin codes:', error);
    // Fallback to default codes if Firebase fails
    return {
      overseer: 'AFMA2024OVERSEER',
      pastor: 'AFMA2024PASTOR'
    };
  }
};