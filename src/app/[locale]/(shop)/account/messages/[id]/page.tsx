import { MessagesView } from "@/components/account/messages-view";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MessagesView activeId={id} />;
}
