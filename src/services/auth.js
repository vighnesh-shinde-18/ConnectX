import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    updateProfile,
    signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase.js";

const googleProvider = new GoogleAuthProvider();
 
class AuthServices {

    registerUser = async ({email, password, username}) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: username });
        return result.user;
    }

    loginUser = async ({email, password}) => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    };

    loginWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    };

    logoutUser = async () => {
        await signOut(auth);
    };
};

const authServices = new AuthServices()

export default authServices;
