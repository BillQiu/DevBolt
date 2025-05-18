import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { parseFigmaURL } from "../../../tools/figma/figma-api";

/**
 * 增强版输入分析工具
 * 可以同时处理图片URL和Figma URL
 * 支持从单个文本中提取多个URL
 */
export const analyzeInputTool = createTool({
  id: "analyze_input",
  description: "分析用户输入，同时检测图片URL和Figma URL，提高识别可靠性",
  inputSchema: z.object({
    input: z
      .string()
      .describe("用户输入的内容，可能包含图片URL和Figma设计地址"),
  }),
  execute: async ({ context }) => {
    const { input } = context;
    const result = {
      figmaUrls: [] as Array<{
        url: string;
        figmaInfo: { fileKey: string; nodeId?: string };
      }>,
      imageUrls: [] as Array<{ url: string }>,
      hasDataUri: false,
      dataUri: "",
      originalText: input,
    };

    // 提取所有URL
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = input.match(urlRegex) || [];

    for (const url of urls) {
      // 检查是否是Figma URL
      if (url.includes("figma.com")) {
        const figmaInfo = parseFigmaURL(url);
        if (figmaInfo) {
          result.figmaUrls.push({ url, figmaInfo });
          continue;
        }
      }

      // 检查是否是图片URL
      if (
        url.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i) ||
        url.match(/\/image\/.*$/i) ||
        url.match(/\/images\/.*$/i) ||
        url.includes("imgur.com") ||
        url.includes("ibb.co")
      ) {
        result.imageUrls.push({ url });
      }
    }

    // 检查是否包含data URI
    const dataUriMatch = input.match(
      /data:image\/[^;]+;base64,[a-zA-Z0-9+/]+=*/
    );
    if (dataUriMatch) {
      result.hasDataUri = true;
      result.dataUri = dataUriMatch[0];
    }

    // 设置输入类型
    const types = [];
    if (result.figmaUrls.length > 0) types.push("figma_url");
    if (result.imageUrls.length > 0) types.push("image_url");
    if (result.hasDataUri) types.push("image_data");

    return {
      ...result,
      types,
      // 检测输入是否包含多种类型
      isMultiTypeInput: types.length > 1,
      // 如果没有检测到URL，则将整个输入视为文本
      isPlainText: types.length === 0,
    };
  },
});
