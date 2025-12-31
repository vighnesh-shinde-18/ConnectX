import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    updateProfile,
    signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase.js";
import { setUserOffline } from "@/lib/firebasePresence.js";
import { toast } from "sonner";

const googleProvider = new GoogleAuthProvider();

class AuthServices {
    registerUser = async ({ email, password, username }) => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(result.user, { displayName: username });
            return result.user;
        } catch (error) {
            console.error("Registration Error:", error);
            throw error; // Re-throw to handle it in the UI/Component
        }
    }

    loginUser = async ({ email, password }) => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            return result.user;
        } catch (error) {
            console.error("Login Error:", error);
            throw error;
        }
    };

    loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            return result.user;
        } catch (error) {
            console.error("Google Login Error:", error);
            throw error;
        }
    };

    logoutUser = async () => {
        try {
            const currentUid = auth.currentUser?.uid;

            if (currentUid) {
                // 1. Mark as offline in RTDB first (Presence System)
                // Use a try-catch specifically for presence to ensure logout still happens
                try {
                    await setUserOffline(currentUid); 
                } catch (presenceError) {
                    console.warn("Presence Cleanup Failed:", presenceError);
                }
            }

            // 2. Then sign out from Auth
            await signOut(auth);
            toast.success("Logout successful");
        } catch (error) {
            console.error("Logout Error:", error);
            // Even if something fails, try to force sign out
            await signOut(auth);
            throw error;
        }
    };
}

const authServices = new AuthServices();

export default authServices;