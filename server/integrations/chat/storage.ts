/**
 * In-memory chat persistence (dev / optional feature stub).
 * No Postgres tables — keeps `tsc` clean and avoids shipping dead schema.
 * Replace with Drizzle-backed storage if/when conversations are productized.
 */
export interface ChatConversation {
  id: number;
  title: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: number;
  conversationId: number;
  role: string;
  content: string;
  createdAt: Date;
}

export interface IChatStorage {
  getConversation(id: number): Promise<ChatConversation | undefined>;
  getAllConversations(): Promise<ChatConversation[]>;
  createConversation(title: string): Promise<ChatConversation>;
  deleteConversation(id: number): Promise<void>;
  getMessagesByConversation(conversationId: number): Promise<ChatMessage[]>;
  createMessage(conversationId: number, role: string, content: string): Promise<ChatMessage>;
}

let nextConversationId = 1;
let nextMessageId = 1;
const conversations = new Map<number, ChatConversation>();
const messagesByConversation = new Map<number, ChatMessage[]>();

export const chatStorage: IChatStorage = {
  async getConversation(id: number) {
    return conversations.get(id);
  },

  async getAllConversations() {
    return Array.from(conversations.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  async createConversation(title: string) {
    const row: ChatConversation = { id: nextConversationId++, title, createdAt: new Date() };
    conversations.set(row.id, row);
    messagesByConversation.set(row.id, []);
    return row;
  },

  async deleteConversation(id: number) {
    messagesByConversation.delete(id);
    conversations.delete(id);
  },

  async getMessagesByConversation(conversationId: number) {
    return [...(messagesByConversation.get(conversationId) ?? [])].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
  },

  async createMessage(conversationId: number, role: string, content: string) {
    const msg: ChatMessage = {
      id: nextMessageId++,
      conversationId,
      role,
      content,
      createdAt: new Date(),
    };
    const list = messagesByConversation.get(conversationId) ?? [];
    list.push(msg);
    messagesByConversation.set(conversationId, list);
    return msg;
  },
};
