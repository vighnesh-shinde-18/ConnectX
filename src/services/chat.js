import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
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

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {

        const chats = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const chat = docSnap.data();

            const otherUserId = chat.members?.find(
              (id) => id !== currentUid
            );

            if (!otherUserId) {
              console.warn("[ChatServices] otherUserId not found");
              return null;
            }

            const otherUser = await getUserById(otherUserId);

            return {
              id: docSnap.id,
              name: otherUser?.displayName || "Unknown",
              email: otherUser?.email,
              lastMessage: chat.lastMessage || "",
              lastMessageAt: chat.lastMessageAt
                ? chat.lastMessageAt.toDate().toLocaleString()
                : "",
            };
          })
        );

        // Remove nulls (safety)
        callback(chats.filter(Boolean));
      },
      (error) => {
        if (error.code === 'failed-precondition') {
          console.error("[ChatServices] You need to create an index. Check the link in the error above.");
        }
        console.error("[ChatServices] Snapshot error:", error);
      }
    );

    return unsubscribe;
  };

  listenChatMessages = (chatId, callback) => {
    if (!chatId) return () => { };

    console.log("[ChatServices] Listening messages for:", chatId);

    const q = query(
      collection(db, "chats", chatId, "messages")
      // orderBy("createdAt", "asc")
    );


    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("[ChatServices] Messages:", messages);
        callback(messages);
      },
      (error) => {
        console.error("[ChatServices] Message listener error:", error);
      }
    );

    return unsubscribe;
  };
}

const chatServices = new ChatServices();
export default chatServices;
