import { PageHeader } from "@/components/layout/page-header";
import { ChatCenter } from "@/components/chat/chat-center";

export default function ChatPage() {
  return (
    <>
      <PageHeader
        title="Chat Center"
        description="Messages from LINE, TikTok, and Facebook"
      />
      <ChatCenter />
    </>
  );
}
