/** Backend LINE API schemas */

export interface LineUserOut {
  id: number;
  user_id: string;
  display_name?: string | null;
  picture_url?: string | null;
  status_message?: string | null;
  last_typing?: string | null;
}

export interface LineMessageOut {
  id: number;
  user_id: string;
  message_text: string;
  message_type?: string | null;
  sticker_id?: string | null;
  sticker_url?: string | null;
  reply_token?: string | null;
  is_read?: boolean | null;
  provider?: string | null;
  timestamp: string;
}

export interface LineSendMessageResponse {
  status?: string;
  user_id?: string;
  message?: string;
}

/** UI conversation shape (aligned with existing Chat types) */
export interface LineChatMessage {
  id: string;
  text: string;
  sender: "customer" | "agent";
  timestamp: string;
}

export interface LineConversation {
  id: string;
  lineUserId: string;
  customerName: string;
  avatar: string;
  pictureUrl?: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
  messages: LineChatMessage[];
}
