import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";

import { db } from "../lib/firebase.js";

export const saveUserProfile = async (user) => {

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL || null,
      isOnline: true,
      lastSeen: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
  } else {
    await setDoc(
      userRef,
      {
        isOnline: true,
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    );
  }
};


export const setUserOffline = async (uid) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    isOnline: false,
    lastSeen: serverTimestamp(),
  });
};


export const getUserById = async (uid) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};