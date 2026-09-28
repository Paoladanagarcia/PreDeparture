export type ChatMessage =
  | { role: "user"; content: string }
  | {
      role: "assistant";
      content: string;
      sources?: { title: string; url: string }[];
      incomplete?: boolean;
    };
// Memory only: survives route navigation, never written to browser storage or a server.
let owner = "guest";
let conversation: ChatMessage[] = [];
export function selectConversationOwner(next: string) {
  if (owner !== next) {
    owner = next;
    conversation = [];
  }
}
export function readConversation() {
  return conversation;
}
export function saveConversation(key: string, messages: ChatMessage[]) {
  if (owner === key) conversation = messages;
}
