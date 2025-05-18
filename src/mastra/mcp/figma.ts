import { MCPClient } from "@mastra/mcp";

export const figmaMcp = new MCPClient({
  servers: {
    figma: {
      command: "npx",
      args: [
        "-y",
        "figma-developer-mcp",
        `--figma-api-key=${process.env.FIGMA_ACCESS_TOKEN || ""}`,
        "--stdio",
      ],
    },
  },
});
