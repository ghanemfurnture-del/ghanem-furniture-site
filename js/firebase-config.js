/**
 * GHANEM FURNITURE
 * Firebase Client Web SDK (Modular v10+) Initialization & Config
 * 
 * Note: Firebase client config values are public identifiers, NOT secrets.
 * Private keys and Admin privileges remain strictly on serverless endpoints (/api/).
 * Storage & Analytics SDKs are intentionally not imported (Cloudinary & existing GA4 are used).
 */

const FIREBASE_CONFIG = window.FIREBASE_CONFIG || {
  apiKey: "AIzaSyAbfXIYHDWJ0kxmySXfZkYC8HXgPRAVBoc",
  authDomain: "ghanem-furniture.firebaseapp.com",
  projectId: "ghanem-furniture",
  storageBucket: "ghanem-furniture.firebasestorage.app",
  messagingSenderId: "598710757808",
  appId: "1:598710757808:web:b423752b9e1d1b39048e75",
  measurementId: "G-Z5ZY30NV9W"
};

// Expose configuration globally for static script usage
window.GHANEM_FIREBASE_CONFIG = FIREBASE_CONFIG;

/**
 * Helper to dynamically load Firebase Web SDK Modular modules when needed
 * Imports Auth & Firestore only.
 */
export async function getFirebaseServices() {
  if (window.__firebaseServices) {
    return window.__firebaseServices;
  }

  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
    const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

    const app = initializeApp(FIREBASE_CONFIG);
    const auth = getAuth(app);
    const db = getFirestore(app);

    window.__firebaseServices = { app, auth, db };
    return window.__firebaseServices;
  } catch (err) {
    console.warn('[firebase-config] Failed to initialize Firebase Modular Web SDK:', err);
    return null;
  }
}

// Make accessible to standard scripts
window.getFirebaseServices = getFirebaseServices;
