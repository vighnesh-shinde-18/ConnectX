import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ChatListItem({ chat }) {
    const { otherUser, lastMessage, lastMessageAt } = chat;

    const time = lastMessageAt?.toDate().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer border-b">
            <Avatar>
                <AvatarImage src={otherUser?.photoURL || ""} />
                <AvatarFallback>
                    {otherUser?.displayName?.[0]}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1">
                <div className="flex justify-between">
                    <p className="font-medium">
                        {otherUser?.displayName}
                    </p>
                    <span className="text-xs text-muted-foreground">
                        {time}
                    </span>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-1">
                    {lastMessage || "No messages yet"}
                </p>

                <p className="text-[10px] text-muted-foreground">
                    {otherUser?.isOnline ? "Online" : "Offline"}
                </p>
            </div>
        </div>
    );
}
