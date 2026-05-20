import { io, Socket } from "socket.io-client";
import { BACKEND_URL, API_BASE_URL } from "@/config/api";

const API_URL = API_BASE_URL;
const SOCKET_URL = BACKEND_URL;

class ChatService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return;
    
    const url = new URL(SOCKET_URL);
    const pathPrefix = url.pathname === '/' ? '' : url.pathname;

    this.socket = io(url.origin, {
      path: `${pathPrefix}/socket.io`,
      transports: ["websocket"],
      reconnection: true,
    });

    this.socket.on("connect", () => {
      console.log("Connected to Chat Gateway");
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinConversation(conversationId: string) {
    this.socket?.emit("joinConversation", { conversationId });
  }

  sendMessage(
    conversationId: string, 
    senderId: string, 
    text?: string, 
    type: string = 'text',
    location?: { lat: number; lng: number; address?: string },
    imageUrl?: string
  ) {
    this.socket?.emit("sendMessage", { conversationId, senderId, text, type, location, imageUrl });
  }

  onNewMessage(callback: (message: any) => void) {
    this.socket?.on("newMessage", callback);
  }

  onConversationUpdated(callback: (data: any) => void) {
    this.socket?.on("conversationUpdated", callback);
  }

  // REST API methods
  async getConversations(userId: string) {
    const response = await fetch(`${API_URL}/chat/conversations/${userId}`);
    if (!response.ok) throw new Error("Failed to fetch conversations");
    return response.json();
  }

  async getMessages(conversationId: string) {
    const response = await fetch(`${API_URL}/chat/messages/${conversationId}`);
    if (!response.ok) throw new Error("Failed to fetch messages");
    return response.json();
  }

  async startConversation(participantIds: string[]) {
    const response = await fetch(`${API_URL}/chat/conversation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantIds }),
    });
    if (!response.ok) throw new Error("Failed to start conversation");
    return response.json();
  }
}

export const chatService = new ChatService();
