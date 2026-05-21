import type {
  ChatConversation,
  DashboardStat,
  Lead,
  PipelineDeal,
  PipelineStage,
} from "./types";

export const dashboardStats: DashboardStat[] = [
  { label: "Total Leads", value: "248", change: "+12%", trend: "up" },
  { label: "Active Deals", value: "36", change: "+4", trend: "up" },
  { label: "Revenue (MTD)", value: "฿1.2M", change: "+8%", trend: "up" },
  { label: "Unread Chats", value: "14", change: "3 urgent", trend: "neutral" },
];

export const leads: Lead[] = [
  {
    id: "1",
    name: "Somchai Prasert",
    company: "GreenTech Solutions",
    email: "somchai@greentech.co.th",
    phone: "+66 81 234 5678",
    status: "qualified",
    stage: "qualified",
    value: 450000,
    source: "Website",
    assignedTo: "Nicha W.",
    createdAt: "2026-05-10",
    lastContact: "2026-05-18",
    notes: "Interested in enterprise plan. Follow up with demo next week.",
  },
  {
    id: "2",
    name: "Pimchanok Srisuk",
    company: "EcoPack Ltd.",
    email: "pim@ecopack.com",
    phone: "+66 92 876 5432",
    status: "proposal",
    stage: "proposal",
    value: 280000,
    source: "LINE",
    assignedTo: "Arthit K.",
    createdAt: "2026-05-08",
    lastContact: "2026-05-17",
    notes: "Sent proposal v2. Waiting for procurement approval.",
  },
  {
    id: "3",
    name: "David Chen",
    company: "Asia Retail Group",
    email: "d.chen@asiaretail.com",
    phone: "+66 63 111 2222",
    status: "new",
    stage: "prospect",
    value: 120000,
    source: "Facebook",
    assignedTo: "Nicha W.",
    createdAt: "2026-05-19",
    lastContact: "2026-05-19",
    notes: "Inbound from Facebook ad campaign. Schedule discovery call.",
  },
  {
    id: "4",
    name: "Wanida Boonma",
    company: "Solar Farm Co.",
    email: "wanida@solarfarm.th",
    phone: "+66 89 555 1234",
    status: "contacted",
    stage: "contacted",
    value: 890000,
    source: "Referral",
    assignedTo: "Mali T.",
    createdAt: "2026-05-05",
    lastContact: "2026-05-16",
    notes: "Large opportunity. Needs custom integration quote.",
  },
  {
    id: "5",
    name: "James Miller",
    company: "LogiChain Asia",
    email: "j.miller@logichain.io",
    phone: "+66 84 999 8877",
    status: "won",
    stage: "closed",
    value: 650000,
    source: "TikTok",
    assignedTo: "Arthit K.",
    createdAt: "2026-04-20",
    lastContact: "2026-05-14",
    notes: "Contract signed. Onboarding scheduled for June.",
  },
  {
    id: "6",
    name: "Kanya Rattana",
    company: "FreshMart",
    email: "kanya@freshmart.co.th",
    phone: "+66 86 333 4455",
    status: "lost",
    stage: "negotiation",
    value: 95000,
    source: "Website",
    assignedTo: "Mali T.",
    createdAt: "2026-04-28",
    lastContact: "2026-05-12",
    notes: "Chose competitor. Revisit in Q3.",
  },
];

export const pipelineStages: { id: PipelineStage; label: string; color: string }[] = [
  { id: "prospect", label: "Prospect", color: "bg-slate-100" },
  { id: "contacted", label: "Contacted", color: "bg-blue-50" },
  { id: "qualified", label: "Qualified", color: "bg-sky-50" },
  { id: "proposal", label: "Proposal", color: "bg-indigo-50" },
  { id: "negotiation", label: "Negotiation", color: "bg-violet-50" },
  { id: "closed", label: "Closed Won", color: "bg-emerald-50" },
];

export const pipelineDeals: PipelineDeal[] = [
  { id: "d1", title: "GreenTech Enterprise", company: "GreenTech Solutions", value: 450000, stage: "qualified", owner: "Nicha W.", probability: 60 },
  { id: "d2", title: "EcoPack Annual", company: "EcoPack Ltd.", value: 280000, stage: "proposal", owner: "Arthit K.", probability: 75 },
  { id: "d3", title: "Asia Retail Pilot", company: "Asia Retail Group", value: 120000, stage: "prospect", owner: "Nicha W.", probability: 25 },
  { id: "d4", title: "Solar Farm Integration", company: "Solar Farm Co.", value: 890000, stage: "contacted", owner: "Mali T.", probability: 40 },
  { id: "d5", title: "LogiChain Platform", company: "LogiChain Asia", value: 650000, stage: "closed", owner: "Arthit K.", probability: 100 },
  { id: "d6", title: "FreshMart Starter", company: "FreshMart", value: 95000, stage: "negotiation", owner: "Mali T.", probability: 30 },
  { id: "d7", title: "Urban Farm SaaS", company: "Urban Farm", value: 175000, stage: "proposal", owner: "Nicha W.", probability: 55 },
  { id: "d8", title: "BioCycle Upgrade", company: "BioCycle", value: 320000, stage: "qualified", owner: "Arthit K.", probability: 50 },
];

export const chatConversations: ChatConversation[] = [
  {
    id: "c1",
    platform: "line",
    customerName: "Pimchanok S.",
    avatar: "PS",
    lastMessage: "Can you send the updated quotation?",
    lastMessageAt: "10:42",
    unread: 2,
    messages: [
      { id: "m1", text: "สวัสดีค่ะ สนใจแพ็กเกจ Enterprise ค่ะ", sender: "customer", timestamp: "10:30" },
      { id: "m2", text: "สวัสดีค่ะคุณพิม ขอบคุณที่สนใจครับ แพ็กเกจ Enterprise รวม 50 users และ API access ค่ะ", sender: "agent", timestamp: "10:32" },
      { id: "m3", text: "Can you send the updated quotation?", sender: "customer", timestamp: "10:42" },
    ],
  },
  {
    id: "c2",
    platform: "facebook",
    customerName: "David Chen",
    avatar: "DC",
    lastMessage: "What is the pricing for 20 seats?",
    lastMessageAt: "09:15",
    unread: 1,
    messages: [
      { id: "m1", text: "Hi, I saw your ad on Facebook.", sender: "customer", timestamp: "09:00" },
      { id: "m2", text: "Hello David! Happy to help. What team size are you looking at?", sender: "agent", timestamp: "09:05" },
      { id: "m3", text: "What is the pricing for 20 seats?", sender: "customer", timestamp: "09:15" },
    ],
  },
  {
    id: "c3",
    platform: "tiktok",
    customerName: "James M.",
    avatar: "JM",
    lastMessage: "Thanks! Looking forward to onboarding.",
    lastMessageAt: "Yesterday",
    unread: 0,
    messages: [
      { id: "m1", text: "Saw your TikTok demo — very cool!", sender: "customer", timestamp: "Yesterday" },
      { id: "m2", text: "Thank you James! Would you like a live walkthrough?", sender: "agent", timestamp: "Yesterday" },
      { id: "m3", text: "Thanks! Looking forward to onboarding.", sender: "customer", timestamp: "Yesterday" },
    ],
  },
  {
    id: "c4",
    platform: "line",
    customerName: "Wanida B.",
    avatar: "WB",
    lastMessage: "พรุ่งนี้โทรกลับได้ไหมคะ ช่วงบ่าย",
    lastMessageAt: "08:50",
    unread: 3,
    messages: [
      { id: "m1", text: "ต้องการข้อมูลเพิ่มเรื่อง integration ค่ะ", sender: "customer", timestamp: "08:40" },
      { id: "m2", text: "ได้เลยค่ะ ส่งเอกสาร technical spec ให้ทางอีเมลแล้วนะคะ", sender: "agent", timestamp: "08:45" },
      { id: "m3", text: "พรุ่งนี้โทรกลับได้ไหมคะ ช่วงบ่าย", sender: "customer", timestamp: "08:50" },
    ],
  },
  {
    id: "c5",
    platform: "facebook",
    customerName: "Kanya R.",
    avatar: "KR",
    lastMessage: "We'll reconsider next quarter.",
    lastMessageAt: "Mon",
    unread: 0,
    messages: [
      { id: "m1", text: "We've decided to go with another vendor for now.", sender: "customer", timestamp: "Mon" },
      { id: "m2", text: "Thank you for letting us know, Kanya. We're here when you're ready.", sender: "agent", timestamp: "Mon" },
      { id: "m3", text: "We'll reconsider next quarter.", sender: "customer", timestamp: "Mon" },
    ],
  },
];

export function getLeadById(id: string): Lead | undefined {
  return leads.find((l) => l.id === id);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const leadSources = [
  "Website",
  "LINE",
  "Facebook",
  "TikTok",
  "Referral",
  "Email",
  "Phone",
  "Event",
] as const;

export const teamMembers = ["Nicha W.", "Arthit K.", "Mali T."] as const;

/** Values match backend BudgetRange enum */
export const budgetRanges = [
  { value: "100,000 ฿ - 300,000 ฿", label: "100,000 ฿ - 300,000 ฿" },
  { value: "400,000 ฿ - 600,000 ฿", label: "400,000 ฿ - 600,000 ฿" },
  { value: "มากกว่า 700,000 ฿", label: "มากกว่า 700,000 ฿" },
] as const;

export const productInterests = [
  "KM Buddy",
  "Supplement",
  "Cosmetic",
  "Other",
] as const;

/** Backend StatusChoices */
export const statusLabels: Record<string, string> = {
  new: "New",
  proposing: "Proposing",
  rd_request: "R&D Request",
  sale_order: "Sale Order",
};

export const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  proposing: "bg-indigo-100 text-indigo-800",
  rd_request: "bg-amber-100 text-amber-800",
  sale_order: "bg-emerald-100 text-emerald-800",
};

export function formatLeadDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export const platformLabels: Record<string, string> = {
  line: "LINE",
  tiktok: "TikTok",
  facebook: "Facebook",
};

export const platformColors: Record<string, string> = {
  line: "bg-[#06C755] text-white",
  tiktok: "bg-black text-white",
  facebook: "bg-[#1877F2] text-white",
};
