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
import { uploadToCloudinary } from "../lib/cloudinaryUpload.js";

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

          const unreadQuery = query(
            collection(db, "chats", chatId, "messages"),
            where("seen", "==", false),
            where("senderId", "!=", currentUid)
          );

          const unreadSnap = await getDocs(unreadQuery);

          return {
            id: chatId,
            otherUserId: otherUserId,
            name: otherUser?.displayName || "Unknown",
            email: otherUser?.email,
            lastMessage: chat.lastMessage || "",
            lastMessageAt: chat.lastMessageAt
              ? chat.lastMessageAt.toDate().toLocaleString()
              : "",
            lastMessageSender: chat.lastMessageSender || null,
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
        .filter(msg => msg.createdAt);

      callback(messages);
    });
  };

  sendMessage = async ({ chatId, senderId, text, files = [] }) => {
    if (!chatId || !senderId) return;

    let attachments = [];

    if (files.length > 0) {
      for (const fileItem of files) {

        // 1. Get the raw file for upload
        // We prioritize '.file' because that's where the raw binary lives in your UI library
        const fileToUpload = fileItem.file || fileItem.url || fileItem;

        // 2. Upload to Cloudinary
        const uploaded = await uploadToCloudinary(fileToUpload);

        // 3. Determine Type
        let fileType = "raw";

        if (uploaded.format === "pdf") {
          fileType = "pdf"; // Trust Cloudinary if it detects PDF
        } else if (uploaded.resource_type === "video") {
          fileType = "video";
        } else if (uploaded.resource_type === "image") {
          fileType = "image";
        }

        // 4. Determine Name (Fix for missing names)
        // Prioritize the filename from your UI wrapper (Shadcn/PromptInput)
        // fileItem.filename = "my-cv.pdf"
        // uploaded.original_filename = "my-cv" (Cloudinary often drops extension)

      

        const finalName = fileItem.filename || "Document";


        attachments.push({
          url: uploaded.secure_url,
          type: fileType,
          name: finalName,
        });
      }
    }

    // Save to Firestore
    await addDoc(collection(db, "chats", chatId, "messages"), {
      text: (text || "").trim(),
      senderId,
      createdAt: serverTimestamp(),
      seen: false,
      attachments
    });

    // Update Chat List (Last Message Preview)
    const attachmentLabel = attachments.length > 0
      ? (attachments[0].type === "image" ? "📷 Image" : "📄 File")
      : "📎 Attachment";

    await updateDoc(doc(db, "chats", chatId), {
      lastMessage: (text || "").trim() || attachmentLabel,
      lastMessageAt: serverTimestamp(),
      lastMessageSender: senderId,
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

  getUnchattedUsers = async ({ currentUid, currentChats }) => {
    if (!currentUid) return [];

    const chattedUserIds = new Set();
    currentChats.forEach(chat => {
      chat.members?.forEach(id => {
        if (id !== currentUid) chattedUserIds.add(id);
      });
    });

    const usersSnap = await getDocs(collection(db, "users"));

    const unchattedUsers = usersSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(user =>
        user.id !== currentUid &&
        !chattedUserIds.has(user.id)
      );

    return unchattedUsers;
  };

  createChat = async ({ currentUid, otherUserId }) => {
    if (!currentUid || !otherUserId) return null;

    const q = query(
      collection(db, "chats"),
      where("members", "array-contains", currentUid)
    );

    const snap = await getDocs(q);

    for (const docSnap of snap.docs) {
      const members = docSnap.data().members;
      if (members.includes(otherUserId)) {
        return { id: docSnap.id, ...docSnap.data() };
      }
    }

    const chatRef = await addDoc(collection(db, "chats"), {
      members: [currentUid, otherUserId],
      createdAt: serverTimestamp(),
      lastMessage: "",
      lastMessageAt: null,
      lastMessageSender: null,
    });

    return {
      id: chatRef.id,
      members: [currentUid, otherUserId],
    };
  };

  listenLatestMessage = (chatId, callback) => {
    if (!chatId) return () => { };

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    return onSnapshot(q, (snapshot) => {
      const doc = snapshot.docs[0];
      if (!doc) return;
      callback({ id: doc.id, ...doc.data() });
    });
  };

}

const chatServices = new ChatServices();
export default chatServices;