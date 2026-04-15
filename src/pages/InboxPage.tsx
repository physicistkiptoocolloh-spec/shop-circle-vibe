import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, ArrowLeft, Search as SearchIcon } from "lucide-react";
import { MOCK_CONVERSATIONS, MESSAGE_SHORTCUTS } from "@/lib/mockData";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { cn } from "@/lib/utils";

export default function InboxPage() {
  const navigate = useNavigate();
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [conversations] = useState(MOCK_CONVERSATIONS);
  const [search, setSearch] = useState("");

  const convo = conversations.find(c => c.id === selectedConvo);

  const filteredConvos = conversations.filter(c =>
    c.participantName.toLowerCase().includes(search.toLowerCase())
  );

  // Chat view (fullscreen like WhatsApp)
  if (convo) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col animate-fade-in">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-border bg-card">
          <button onClick={() => setSelectedConvo(null)} className="p-1"><ArrowLeft className="h-5 w-5" /></button>
          <UserAvatar icon={convo.participantAvatarIcon} avatar={convo.participantAvatar} size="sm" onClick={() => navigate(`/profile/${convo.participantId}`)} />
          <button onClick={() => navigate(`/profile/${convo.participantId}`)} className="font-semibold text-sm">{convo.participantName}</button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {convo.messages.map(msg => (
            <div key={msg.id} className={cn("flex", msg.senderId === "me" ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[75%] px-3 py-2 rounded-2xl text-sm", msg.senderId === "me" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm")}>
                {msg.text}
                <p className={cn("text-[10px] mt-1", msg.senderId === "me" ? "text-primary-foreground/60" : "text-muted-foreground")}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Shortcuts */}
        <div className="px-4 py-2 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {MESSAGE_SHORTCUTS.map(s => (
              <button key={s} onClick={() => setNewMessage(s)} className="text-[11px] bg-accent text-accent-foreground px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-primary hover:text-primary-foreground transition-colors">
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-border bg-card safe-area-bottom">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none"
          />
          <button className="p-2.5 bg-primary rounded-xl text-primary-foreground">
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  // Conversation list
  return (
    <div className="animate-fade-in">
      <div className="px-4 py-3">
        <h1 className="text-xl font-bold">Inbox</h1>
      </div>
      <div className="px-4 pb-3">
        <div className="flex items-center bg-muted rounded-xl px-3 py-2 gap-2">
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search conversations..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm outline-none w-full" />
        </div>
      </div>
      <div>
        {filteredConvos.map(c => (
          <button key={c.id} onClick={() => setSelectedConvo(c.id)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left">
            <UserAvatar icon={c.participantAvatarIcon} avatar={c.participantAvatar} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm truncate">{c.participantName}</span>
                <span className="text-[10px] text-muted-foreground">{new Date(c.lastMessageTime).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{c.lastMessage}</p>
            </div>
            {c.unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full px-1.5">{c.unreadCount}</span>
            )}
          </button>
        ))}
        {filteredConvos.length === 0 && <p className="text-center text-sm text-muted-foreground py-12">No conversations</p>}
      </div>
    </div>
  );
}
