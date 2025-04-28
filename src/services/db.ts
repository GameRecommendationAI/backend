import { ChatCompletionMessageParam } from "openai/resources";

export interface Conversation {
  id: string;
  messages: ChatCompletionMessageParam[];
}

export interface Message {
  role: string;
  content: string;
}

const conversations: Conversation[] = [];

export const getConversations = () => {
  return conversations;
};

export const addConversation = (conversation: Conversation) => {
  conversations.push(conversation);
};

export const getConversationById = (id: string): Conversation => {
  const c = conversations.find((conversation) => conversation.id === id);
  if (!c) {
    throw new Error("Conversation not found");
  }
  return c;
};

export const addMessageToConversation = (
  id: string,
  ...messages: ChatCompletionMessageParam[]
) => {
  const conversation = getConversationById(id);
  if (conversation) {
    conversation.messages.push(...messages);
  }
};
