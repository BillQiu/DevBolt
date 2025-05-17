import { Mastra } from "@mastra/core";
import { geminiImagePromptAgent } from "./agents";

export const mastra = new Mastra({
  agents: {
    geminiImagePrompt: geminiImagePromptAgent,
  },
});
