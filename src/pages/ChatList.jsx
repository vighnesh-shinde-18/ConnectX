import { useState } from "react";
import Layout from "./Layout.jsx";
import ConversationPage from "./Conversation.jsx";
import MessageInput from "./InputMessage.jsx";

export default function ChatList() {
  const [selectedChat, setSelectedChat] = useState({
    name: "",
    email: "",
    id:""
  });

  return (
    <Layout selectedChat={selectedChat} setSelectedChat={setSelectedChat}>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <ConversationPage selectedChat={selectedChat} />
        </div>
        <div className="shrink-0 border-t bg-background">
         <MessageInput selectedChat={selectedChat} />
        </div>
      </div>
    </Layout>
  );
}

