import {
  appendMessage,
  createThread,
  deleteThread,
  listThreads,
  loadMessages,
  renameThread,
} from "@/lib/chat-db";
import {
  RuntimeAdapterProvider,
  useAui,
  type RemoteThreadListAdapter,
  type ThreadHistoryAdapter,
} from "@assistant-ui/react-native";
import { createAssistantStream } from "assistant-stream";
import { useMemo, type ReactNode } from "react";

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const threadListAdapter: RemoteThreadListAdapter = {
  async list() {
    const rows = listThreads();
    return {
      threads: rows.map((t) => ({
        remoteId: t.id,
        status: "regular" as const,
        title: t.title ?? undefined,
      })),
    };
  },

  async initialize() {
    const id = generateId();
    createThread(id);
    return { remoteId: id, externalId: undefined };
  },

  async rename(remoteId, title) {
    renameThread(remoteId, title);
  },

  async archive(remoteId) {
    deleteThread(remoteId);
  },

  async unarchive() {
    // no-op for local storage
  },

  async delete(remoteId) {
    deleteThread(remoteId);
  },

  async fetch(remoteId) {
    const rows = listThreads();
    const t = rows.find((r) => r.id === remoteId);
    if (!t) return { remoteId, status: "regular" as const, title: undefined };
    return {
      remoteId: t.id,
      status: "regular" as const,
      title: t.title ?? undefined,
    };
  },

  async generateTitle(remoteId, messages) {
    return createAssistantStream(async (controller) => {
      const firstUserMsg = (messages as any[]).find((m) => m.role === "user");
      if (!firstUserMsg) return;
      const textPart = firstUserMsg.content?.find(
        (p: any) => p.type === "text",
      );
      if (textPart && "text" in textPart) {
        const title =
          textPart.text.length > 40
            ? textPart.text.slice(0, 40) + "…"
            : textPart.text;
        renameThread(remoteId, title);
        controller.appendText(title);
      }
    });
  },

  unstable_Provider({ children }: { children?: ReactNode }) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const aui = useAui();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const history = useMemo<ThreadHistoryAdapter>(
      () => ({
        async load() {
          return { messages: [] };
        },
        async append() {},
        withFormat: (fmt) => ({
          async load() {
            const { remoteId } = aui.threadListItem().getState();
            if (!remoteId) return { messages: [] };
            const rows = loadMessages(remoteId);
            return {
              messages: rows.map((row) =>
                fmt.decode({
                  id: row.id,
                  parent_id: row.parent_id,
                  format: row.format,
                  content: JSON.parse(row.content),
                }),
              ),
            };
          },
          async append(item) {
            const { remoteId } = await aui.threadListItem().initialize();
            if (!remoteId) return;
            appendMessage(
              fmt.getId(item.message),
              remoteId,
              item.parentId,
              fmt.format,
              JSON.stringify(fmt.encode(item)),
            );

            // Set thread title from first user message
            const msg = item.message as any;
            if (msg.role === "user") {
              const state = aui.threadListItem().getState();
              if (!state.title) {
                const textPart = msg.content?.find(
                  (p: any) => p.type === "text",
                );
                if (textPart && "text" in textPart && textPart.text) {
                  const title =
                    textPart.text.length > 40
                      ? textPart.text.slice(0, 40) + "…"
                      : textPart.text;
                  renameThread(remoteId, title);
                  aui.threadListItem().rename(title);
                }
              }
            }
          },
        }),
      }),
      [aui],
    );

    return (
      <RuntimeAdapterProvider adapters={{ history }}>
        {children}
      </RuntimeAdapterProvider>
    );
  },
};
