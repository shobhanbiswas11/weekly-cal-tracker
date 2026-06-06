import { listThreads, type ThreadRow as ThreadRowData } from "@/lib/chat-db";
import { useAui, useAuiState } from "@assistant-ui/react-native";
import { useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { Modal, ModalContent, ModalTrigger } from "../ui";

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

function ThreadRow({
  thread,
  isActive,
  onSelect,
}: {
  thread: ThreadRowData;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable
      onPress={onSelect}
      className={`px-4 py-3.5 border-b border-border ${isActive ? "bg-primary/10" : ""}`}
    >
      <View className="flex-row items-center justify-between">
        <Text
          className={`text-base flex-1 mr-3 ${isActive ? "text-primary font-semibold" : "text-foreground"}`}
          numberOfLines={1}
        >
          {thread.title || "New conversation"}
        </Text>
        <Text className="text-xs text-muted-foreground">
          {formatRelativeTime(thread.updated_at)}
        </Text>
      </View>
    </Pressable>
  );
}

export function ThreadListModal({ children }: { children: React.ReactNode }) {
  const aui = useAui();
  const mainThreadId = useAuiState((s) => s.threads.mainThreadId);
  const [threads, setThreads] = useState<ThreadRowData[]>([]);
  const [open, setOpen] = useState(false);

  // Refresh thread list from SQLite when modal becomes visible
  useEffect(() => {
    if (open) setThreads(listThreads());
  }, [open]);

  const handleNewChat = () => {
    aui.threads().switchToNewThread();
    setOpen(false);
  };

  const handleSelectThread = (remoteId: string) => {
    aui.threads().switchToThread(remoteId);
    setOpen(false);
  };

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger>{children}</ModalTrigger>
      <ModalContent height={420}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-4 pb-3 border-b border-border">
          <Text className="text-lg font-semibold text-foreground">
            Conversations
          </Text>
          <Pressable onPress={handleNewChat} hitSlop={8}>
            <Text className="text-base text-primary font-medium">New Chat</Text>
          </Pressable>
        </View>

        {/* Thread list */}
        {threads.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Text className="text-muted-foreground text-base">
              No conversations yet
            </Text>
          </View>
        ) : (
          <FlatList
            data={threads}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ThreadRow
                thread={item}
                isActive={item.id === mainThreadId}
                onSelect={() => handleSelectThread(item.id)}
              />
            )}
            className="flex-1"
          />
        )}
      </ModalContent>
    </Modal>
  );
}
