import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { extractColors } from "../utils/color-utils";
import { extractTypography } from "../utils/typography-utils";

/**
 * Figma数据处理工具
 * 处理Figma API返回的原始数据，提取关键设计信息
 */
export const processFigmaDataTool = createTool({
  id: "process_figma_data",
  description: "处理Figma API返回的数据，提取关键设计信息并生成结构化描述",
  inputSchema: z.object({
    figmaData: z.any().describe("Figma API返回的原始设计数据"),
  }),
  execute: async ({ context }) => {
    const { figmaData } = context;

    try {
      // 提取文档信息
      const documentInfo = {
        name: figmaData.name || "未命名设计",
        lastModified: figmaData.lastModified || "",
        version: figmaData.version || "",
        documentType: figmaData.document?.type || "DOCUMENT",
      };

      // 提取页面信息
      const pages = figmaData.document?.children || [];
      const pagesInfo = pages.map((page: any) => ({
        id: page.id,
        name: page.name,
        type: page.type,
        childCount: page.children?.length || 0,
      }));

      // 提取视觉样式信息
      const styles = figmaData.styles || {};

      // 提取主题信息
      const theme = {
        colors: extractColors(figmaData),
        typography: extractTypography(figmaData),
      };

      return {
        success: true,
        documentInfo,
        pagesInfo,
        styles,
        theme,
        rawData: figmaData, // 保留原始数据供后续分析
      };
    } catch (error: any) {
      return {
        success: false,
        error: `处理Figma数据失败: ${error.message}`,
      };
    }
  },
});
