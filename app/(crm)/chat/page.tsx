import { PageHeader } from "@/components/layout/page-header";
import { LineSetupBanner } from "@/components/chat/line-setup-banner";
import { ChatCenter } from "@/components/chat/chat-center";

export default function ChatPage() {
  return (
    <>
      <PageHeader
        title="Chat Center"
        description="LINE connected to this app · TikTok & Facebook mock"
      />
      <LineSetupBanner />
      <ChatCenter />
    </>
  );
}
