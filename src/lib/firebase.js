import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // 1. Import Firestore
import { getStorage } from "firebase/storage";     // 2. Import Storage (for images)
import FirebaseInitConfig from "@/config/config.js";

const firebaseConfig = {
    apiKey: FirebaseInitConfig.apiKey,
    authDomain: FirebaseInitConfig.authDomain,
    projectId: FirebaseInitConfig.projectId,
    storageBucket: FirebaseInitConfig.storageBucket,
    messagingSenderId: FirebaseInitConfig.messagingSenderId,
    appId: FirebaseInitConfig.appId
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);   // 3. Initialize and Export DB
export const storage = getStorage(app); // 4. Initialize and Export Storage