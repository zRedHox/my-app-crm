export type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";

export type ChatPlatform = "line" | "tiktok" | "facebook";

export type PipelineStage =
  | "prospect"
  | "contacted"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "closed";

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: LeadStatus;
  stage: PipelineStage;
  value: number;
  source: string;
  assignedTo: string;
  createdAt: string;
  lastContact: string;
  notes: string;
}

export interface PipelineDeal {
  id: string;
  title: string;
  company: string;
  value: number;
  stage: PipelineStage;
  owner: string;
  probability: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: "customer" | "agent";
  timestamp: string;
}

export interface ChatConversation {
  id: string;
  platform: ChatPlatform;
  customerName: string;
  avatar: string;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
  messages: ChatMessage[];
}

export interface DashboardStat {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
}
