import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { FigmaAPIClient, parseFigmaURL } from "./figma-api";

/**
 * MCP 版本的 Figma 获取文件数据工具
 *
 * 请先在环境变量或参数中提供 FIGMA_ACCESS_TOKEN
 */
export const figmaGetFigmaDataTool = createTool({
  id: "mcp_figma_get_figma_data",
  description:
    "从 Figma 获取设计文件的 JSON 数据。在没有 nodeId 时获取整个文件信息。",
  inputSchema: z.object({
    fileKey: z
      .string()
      .describe(
        "Figma 文件的 key，通常从 URL 中提取，形如 figma.com/(file|design)/<fileKey>/..."
      ),
    nodeId: z
      .string()
      .optional()
      .describe(
        "要获取的节点 ID，通常作为 URL 参数 node-id=<nodeId> 出现，如果提供了则只获取该节点数据"
      ),
    depth: z
      .number()
      .optional()
      .describe("遍历节点树的深度，仅在用户明确请求时使用"),
  }),
  execute: async ({ context }) => {
    try {
      const { fileKey, nodeId, depth } = context;

      // 从环境变量获取访问令牌
      const accessToken = process.env.FIGMA_ACCESS_TOKEN;
      const figmaClient = new FigmaAPIClient({
        personalAccessToken: accessToken,
      });

      let response;

      // 根据是否提供 nodeId 决定获取整个文件还是特定节点
      if (nodeId) {
        response = await figmaClient.getNode(fileKey, nodeId);
      } else {
        response = await figmaClient.getFile(fileKey);
      }

      if (!response.success) {
        return {
          error: `Error fetching file: ${JSON.stringify(response.error)}`,
        };
      }

      // 如果指定了深度，可以在此处进行数据处理
      // 这里仅作为示例，实际上 Figma API 没有直接支持深度参数
      // 你可以在这里添加自定义的深度筛选逻辑

      return response.data;
    } catch (error: any) {
      return {
        error: `Error: ${error.message}`,
      };
    }
  },
});

/**
 * MCP 版本的 Figma 图片下载工具
 *
 * 下载 Figma 文件中的 SVG 和 PNG 图像
 */
export const figmaDownloadFigmaImagesTool = createTool({
  id: "mcp_figma_download_figma_images",
  description:
    "根据图像或图标节点的 ID 下载 Figma 文件中使用的 SVG 和 PNG 图像",
  inputSchema: z.object({
    fileKey: z.string().describe("包含节点的 Figma 文件的 key"),
    nodes: z
      .array(
        z.object({
          nodeId: z
            .string()
            .describe("要获取的 Figma 图像节点的 ID，格式为 1234:5678"),
          fileName: z.string().describe("用于保存获取文件的本地名称"),
          imageRef: z
            .string()
            .optional()
            .describe(
              "如果节点有 imageRef 填充，则必须包含此变量。下载矢量 SVG 图像时留空。"
            ),
        })
      )
      .describe("要获取为图像的节点"),
    localPath: z
      .string()
      .describe(
        "项目中存储图像的目录的绝对路径。如果目录不存在，将创建它。此路径的格式应尊重您正在运行的操作系统的目录格式。路径名中也不要使用任何特殊字符转义。"
      ),
  }),
  execute: async ({ context }) => {
    try {
      const { fileKey, nodes, localPath } = context;

      // 从环境变量获取访问令牌
      const accessToken = process.env.FIGMA_ACCESS_TOKEN;

      if (!accessToken) {
        return {
          error: "Missing FIGMA_ACCESS_TOKEN in environment variables",
        };
      }

      // 创建保存目录
      const fs = await import("fs/promises");
      try {
        await fs.mkdir(localPath, { recursive: true });
      } catch (err: any) {
        return {
          error: `Failed to create directory: ${err.message}`,
        };
      }

      // 获取图像URL
      const figmaClient = new FigmaAPIClient({
        personalAccessToken: accessToken,
      });
      const nodeIds = nodes.map((node) => node.nodeId);

      // 获取图像URL
      const imageUrlsResponse = await figmaClient.getImageUrls(
        fileKey,
        nodeIds
      );

      if (!imageUrlsResponse.success) {
        return {
          error: `Failed to get image URLs: ${JSON.stringify(
            imageUrlsResponse.error
          )}`,
        };
      }

      const images = imageUrlsResponse.data.images || {};
      const downloadResults = [];

      // 下载所有图像
      for (const node of nodes) {
        const imageUrl = images[node.nodeId];

        if (!imageUrl) {
          downloadResults.push({
            nodeId: node.nodeId,
            fileName: node.fileName,
            success: false,
            error: "No image URL found for this node",
          });
          continue;
        }

        const filePath = `${localPath}/${node.fileName}`;
        const downloadResponse = await figmaClient.downloadImage(
          imageUrl,
          filePath
        );

        downloadResults.push({
          nodeId: node.nodeId,
          fileName: node.fileName,
          success: downloadResponse.success,
          path: downloadResponse.success ? filePath : undefined,
          error: downloadResponse.error
            ? downloadResponse.error.message
            : undefined,
        });
      }

      return {
        success: true,
        message: `Downloaded ${
          downloadResults.filter((r) => r.success).length
        } of ${nodes.length} images`,
        downloads: downloadResults,
      };
    } catch (error: any) {
      return {
        error: `Error downloading images: ${error}`,
      };
    }
  },
});
