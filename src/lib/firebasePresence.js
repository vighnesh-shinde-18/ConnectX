// src/lib/firebasePresence.js
import { getDatabase, ref, onDisconnect, set, serverTimestamp, onValue } from "firebase/database";
import  {app}  from "./firebase.js"; // your initialized firebase app

const rtdb = getDatabase(app);

export const setUserOnline = (uid) => {
  if (!uid) return;
 const userStatusRef = ref(rtdb, "status/" + uid);
  const connectedRef = ref(rtdb, ".info/connected");

  onValue(connectedRef, (snap) => {
    
    if (snap.val() === false) return;

    // When connection lost, mark offline & record lastSeen
    onDisconnect(userStatusRef).set({
      isOnline: false,
      lastSeen: serverTimestamp(),
    }).then(() => console.log("✅ onDisconnect is ready"));

    // When connected, mark online
    set(userStatusRef, {
      isOnline: true,
      lastSeen: serverTimestamp(),
    }).then(() => console.log("🚀 Data sent to Firebase successfully!"));
  });
};

export const setUserOffline = async (uid) => {
  if (!uid) return;
  const userStatusRef = ref(rtdb, "status/" + uid);
  
  // Manually set status to offline before logging out
  return set(userStatusRef, {
    isOnline: false,
    lastSeen: serverTimestamp(),
  });
};

export const setTyping = (chatId, userId, isTyping) => {
  if (!chatId || !userId) return;
  return set(ref(rtdb, `typing/${chatId}/${userId}`), isTyping);
};

export const listenTyping = (chatId, otherUserId, callback) => {
  if (!chatId || !otherUserId) return () => {};

  const typingRef = ref(rtdb, `typing/${chatId}/${otherUserId}`);
  const unsub = onValue(typingRef, snap => {
    callback(snap.val() === true);
  });

  return () => unsub();
};

// Listen to a user's online status
export const listenUserStatus = (uid, callback) => {
  if (!uid) return () => {};
  const refStatus = ref(rtdb, `status/${uid}`);
  return onValue(refStatus, (snap) => callback(snap.val()));
};
