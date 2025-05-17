import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import axios from "axios";

/**
 * 图片URL验证工具
 * 检查提供的URL是否指向有效的图片，并返回图片的base64编码
 */
export const validateImageUrlTool = createTool({
  id: "validate_image_url",
  description: "验证图片URL是否有效，并返回图片内容的base64编码",
  inputSchema: z.object({
    imageUrl: z.string().describe("图片的URL地址"),
  }),
  execute: async ({ context }) => {
    try {
      const { imageUrl } = context;
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });

      // 检查内容类型是否为图片
      const contentType = response.headers["content-type"];
      if (!contentType || !contentType.startsWith("image/")) {
        return {
          success: false,
          error: "提供的URL不是图片",
        };
      }

      // 将图片内容转换为base64
      const base64Image = Buffer.from(response.data).toString("base64");
      const dataUri = `data:${contentType};base64,${base64Image}`;

      return {
        success: true,
        dataUri,
        contentType,
      };
    } catch (error: any) {
      return {
        success: false,
        error: `获取图片失败: ${error.message}`,
      };
    }
  },
});
