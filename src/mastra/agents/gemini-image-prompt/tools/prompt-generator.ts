import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import {
  IMAGE_PROMPT_TEMPLATE,
  FIGMA_PROMPT_TEMPLATE,
  MIXED_PROMPT_TEMPLATE,
} from "../templates/prompt-templates";

/**
 * 页面设计提示生成工具
 * 基于分析结果生成结构化的开发提示
 */
export const generatePagePromptTool = createTool({
  id: "generate_page_prompt",
  description: "基于图片或设计分析结果生成详细的页面设计提示",
  inputSchema: z.object({
    analysisResult: z.string().describe("Gemini模型的分析结果"),
    designType: z
      .enum(["image", "figma", "mixed"])
      .describe("设计类型：普通图像、Figma设计或两者混合"),
  }),
  execute: async ({ context }) => {
    const { analysisResult, designType } = context;

    // 根据设计类型选择不同的模板
    let promptTemplate;

    switch (designType) {
      case "figma":
        promptTemplate = FIGMA_PROMPT_TEMPLATE;
        break;
      case "image":
        promptTemplate = IMAGE_PROMPT_TEMPLATE;
        break;
      case "mixed":
        promptTemplate = MIXED_PROMPT_TEMPLATE;
        break;
      default:
        promptTemplate = IMAGE_PROMPT_TEMPLATE;
    }

    // 将分析结果嵌入到模板中
    const fullPrompt = promptTemplate.replace(
      "{analysis_result}",
      analysisResult
    );

    return {
      prompt: fullPrompt,
    };
  },
});
