import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Send, ArrowLeft, Search as SearchIcon, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useConversations, useMessages, useSendMessage, useMarkMessagesRead, useGetOrCreateConversation } from "@/hooks/useMessages";
import { useProfileById } from "@/hooks/useProfiles";
import { useProduct } from "@/hooks/useProducts";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { MESSAGE_SHORTCUTS } from "@/lib/mockData";
import { cn } from "@/lib/utils";

function ConversationItem({ convo, userId, onClick }: { convo: any; userId: string; onClick: () => void }) {
  const otherId = convo.participant_one === userId ? convo.participant_two : convo.participant_one;
  const { data: otherProfile } = useProfileById(otherId);

  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left">
      <UserAvatar icon={otherProfile?.avatar_icon || "User"} avatar={otherProfile?.avatar_url} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm truncate">{otherProfile?.name || "User"}</span>
          <span className="text-[10px] text-muted-foreground">
            {convo.last_message_time ? new Date(convo.last_message_time).toLocaleDateString() : ""}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{convo.last_message || "No messages yet"}</p>
      </div>
    </button>
  );
}

function ChatView({ conversationId, userId, onBack }: { conversationId: string; userId: string; onBack: () => void }) {
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState("");
  const { data: messages, isLoading } = useMessages(conversationId);
  const sendMessage = useSendMessage();
  const markRead = useMarkMessagesRead();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markRead.mutate({ conversationId, userId });
  }, [conversationId, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMessage.mutate({ conversationId, senderId: userId, text: newMessage.trim() });
    setNewMessage("");
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-fade-in">
      <div className="flex items-center gap-3 px-4 h-14 border-b border-border bg-card shrink-0">
        <button onClick={onBack} className="p-1"><ArrowLeft className="h-5 w-5" /></button>
        <span className="font-semibold text-sm">Chat</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading && <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
        {messages?.map(msg => {
          const isMine = msg.sender_id === userId;
          const m = msg.text.match(/^\[PRODUCT:([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^\]]*)\](?:\n([\s\S]*))?$/);
          return (
            <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[80%] rounded-2xl text-sm overflow-hidden", isMine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm")}>
                {m && (
                  <button
                    onClick={() => navigate(`/product/${m[1]}`)}
                    className={cn("flex items-center gap-2 p-2 w-full text-left border-b active:scale-[0.98] transition-transform", isMine ? "border-primary-foreground/20 bg-primary-foreground/10" : "border-border bg-card")}
                  >
                    {m[5] ? (
                      <img src={m[5]} alt="" className="w-12 h-12 rounded-md object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-background/50 flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-xs font-semibold truncate", isMine ? "text-primary-foreground" : "text-foreground")}>{m[2]}</p>
                      <p className={cn("text-[11px] font-bold", isMine ? "text-primary-foreground/90" : "text-primary")}>{m[4]} {Number(m[3]).toLocaleString()}</p>
                    </div>
                  </button>
                )}
                <div className="px-3 py-2">
                  {m ? (m[6] || "Hi, is this still available?") : msg.text}
                  <p className={cn("text-[10px] mt-1", isMine ? "text-primary-foreground/60" : "text-muted-foreground")}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-2 overflow-x-auto scrollbar-hide shrink-0">
        <div className="flex gap-2 min-w-max">
          {MESSAGE_SHORTCUTS.map(s => (
            <button key={s} onClick={() => setNewMessage(s)} className="text-[11px] bg-accent text-accent-foreground px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-primary hover:text-primary-foreground transition-colors">{s}</button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-3 border-t border-border bg-card shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <input
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none"
        />
        <button onClick={handleSend} disabled={!newMessage.trim()} className="p-2.5 bg-primary rounded-xl text-primary-foreground disabled:opacity-50">
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default function InboxPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { data: conversations, isLoading } = useConversations(user?.id);
  const getOrCreateConvo = useGetOrCreateConversation();
  const toUserId = searchParams.get("to");

  // Auto-open or create conversation when ?to= is present
  useEffect(() => {
    if (!toUserId || !user || !conversations) return;
    
    // Find existing conversation with this user
    const existing = conversations.find(
      c => c.participant_one === toUserId || c.participant_two === toUserId
    );
    
    if (existing) {
      setSelectedConvo(existing.id);
      setSearchParams({}, { replace: true });
    } else {
      // Create new conversation
      getOrCreateConvo.mutate(
        { userId: user.id, otherUserId: toUserId },
        {
          onSuccess: (convo) => {
            setSelectedConvo(convo.id);
            setSearchParams({}, { replace: true });
          },
        }
      );
    }
  }, [toUserId, user, conversations]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6">
        <p className="text-sm text-muted-foreground">Sign in to see your messages.</p>
        <button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold text-sm">Sign In</button>
      </div>
    );
  }

  if (selectedConvo && user) {
    return <ChatView conversationId={selectedConvo} userId={user.id} onBack={() => setSelectedConvo(null)} />;
  }

  return (
    <div className="animate-fade-in pb-4">
      <div className="px-4 py-3">
        <h1 className="text-xl font-bold">Inbox</h1>
      </div>
      <div className="px-4 pb-3">
        <div className="flex items-center bg-muted rounded-xl px-3 py-2 gap-2">
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search conversations..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm outline-none w-full" />
        </div>
      </div>
      {(isLoading || getOrCreateConvo.isPending) && <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
      <div className="pb-4">
        {conversations?.map(c => (
          <ConversationItem key={c.id} convo={c} userId={user!.id} onClick={() => setSelectedConvo(c.id)} />
        ))}
        {!isLoading && conversations?.length === 0 && !toUserId && (
          <p className="text-center text-sm text-muted-foreground py-12">No conversations yet. Message a seller to start!</p>
        )}
      </div>
    </div>
  );
}
