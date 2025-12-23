import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  serverTimestamp,
  updateDoc,
  getDocs
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getUserById } from "./user.js";

class ChatServices {

  listenUserChats = (currentUid, callback) => {
    if (!currentUid) return () => { };

    const q = query(
      collection(db, "chats"),
      where("members", "array-contains", currentUid),
      orderBy("lastMessageAt", "desc")
    );

    return onSnapshot(q, async (snapshot) => {
      const chats = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const chat = docSnap.data();
          const chatId = docSnap.id;

          const otherUserId = chat.members.find(id => id !== currentUid);
          if (!otherUserId) return null;

          const otherUser = await getUserById(otherUserId);

          // Count unread
          const unreadQuery = query(
            collection(db, "chats", chatId, "messages"),
            where("seen", "==", false),
            where("senderId", "!=", currentUid)
          );

          const unreadSnap = await getDocs(unreadQuery);

          return {
            id: chatId,
            name: otherUser?.displayName || "Unknown",
            email: otherUser?.email,
            lastMessage: chat.lastMessage || "",
            lastMessageAt: chat.lastMessageAt
              ? chat.lastMessageAt.toDate().toLocaleString()
              : "",
            unreadCount: unreadSnap.size,
          };
        })
      );

      callback(chats.filter(Boolean));
    });
  };


  listenChatMessages = (chatId, callback) => {
    if (!chatId) return () => { };

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(msg => msg.createdAt); // avoid null timestamp issue

      callback(messages);
    });
  };

  sendMessage = async ({ chatId, senderId, text }) => {
    if (!chatId || !senderId || !text?.trim()) return;

    await addDoc(collection(db, "chats", chatId, "messages"), {
      text: text.trim(),
      senderId,
      createdAt: serverTimestamp(),
      seen: false,
      imageUrl: "",
    });

    await updateDoc(doc(db, "chats", chatId), {
      lastMessage: text.trim(),
      lastMessageAt: serverTimestamp(),
    });
  };

  markMessagesAsSeen = async ({ chatId, currentUid }) => {
    if (!chatId || !currentUid) return;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      where("seen", "==", false),
      where("senderId", "!=", currentUid)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) return;

    await Promise.all(
      snapshot.docs.map(docSnap =>
        updateDoc(doc(db, "chats", chatId, "messages", docSnap.id), {
          seen: true,
        })
      )
    );
  };

}

const chatServices = new ChatServices();
export default chatServices;
