import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { parseFigmaURL } from "../../../tools/figma/figma-api";

/**
 * 输入分析工具
 * 确定用户输入的类型（Figma URL、图片URL、数据URI或普通文本）
 */
export const analyzeInputTool = createTool({
  id: "analyze_input",
  description: "分析用户输入，确定是Figma URL、图片URL还是其他内容",
  inputSchema: z.object({
    input: z.string().describe("用户输入的内容"),
  }),
  execute: async ({ context }) => {
    const { input } = context;

    // 检查是否是Figma URL
    if (input.includes("figma.com")) {
      const figmaInfo = parseFigmaURL(input);
      if (figmaInfo) {
        return {
          type: "figma_url",
          figmaInfo,
        };
      }
    }

    // 检查是否是图片URL
    if (
      input.match(/^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i) ||
      input.match(/^https?:\/\/.*\/image\/.*$/i)
    ) {
      return {
        type: "image_url",
        url: input,
      };
    }

    // 检查是否是data URI
    if (input.startsWith("data:image/")) {
      return {
        type: "image_data",
        dataUri: input,
      };
    }

    // 其他情况
    return {
      type: "text",
      content: input,
    };
  },
});
