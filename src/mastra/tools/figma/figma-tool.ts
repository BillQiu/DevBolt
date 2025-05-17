import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { FigmaAPIClient, parseFigmaURL } from "./figma-api";

/**
 * 获取 Figma 文件数据的工具
 * 支持通过 URL 或直接提供 fileKey 获取数据
 */
export const figmaGetFileDataTool = createTool({
  id: "figma-get-file-data",
  description:
    "从Figma URL或fileKey获取设计文件的完整JSON数据。需要提供Figma访问令牌或使用环境变量中的令牌。",
  inputSchema: z.object({
    // 支持URL或fileKey两种输入方式
    input: z.string().describe("Figma设计的URL或fileKey"),
    personalAccessToken: z
      .string()
      .optional()
      .describe("Figma个人访问令牌，如果不提供则使用环境变量中的令牌"),
  }),
  execute: async ({ context }) => {
    try {
      const { input, personalAccessToken } = context;
      const figmaClient = new FigmaAPIClient({ personalAccessToken });

      // 判断输入是URL还是fileKey
      let fileKey = input;

      // 如果输入看起来像URL，则尝试解析它
      if (input.includes("figma.com")) {
        const urlInfo = parseFigmaURL(input);
        if (!urlInfo) {
          return {
            success: false,
            error: {
              message: "无效的Figma URL",
            },
          };
        }
        fileKey = urlInfo.fileKey;
      }

      // 获取文件数据
      const response = await figmaClient.getFile(fileKey);

      if (!response.success) {
        return {
          success: false,
          error: response.error,
        };
      }

      return {
        success: true,
        fileKey,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || "获取Figma文件数据失败",
        },
      };
    }
  },
});

/**
 * 获取 Figma 特定节点数据的工具
 * 支持通过 URL 或直接提供 fileKey 和 nodeId 获取数据
 */
export const figmaGetNodeDataTool = createTool({
  id: "figma-get-node-data",
  description:
    "从Figma获取特定节点的JSON数据。可以通过URL（带node-id参数）或直接提供fileKey和nodeId。需要提供Figma访问令牌或使用环境变量中的令牌。",
  inputSchema: z.object({
    // 支持URL输入或fileKey+nodeId组合
    input: z.string().describe("Figma设计的URL（包含node-id参数）或fileKey"),
    nodeId: z
      .string()
      .optional()
      .describe(
        "节点ID，如果提供了URL且URL中包含node-id参数，则可以省略此字段"
      ),
    personalAccessToken: z
      .string()
      .optional()
      .describe("Figma个人访问令牌，如果不提供则使用环境变量中的令牌"),
  }),
  execute: async ({ context }) => {
    try {
      const { input, nodeId: explicitNodeId, personalAccessToken } = context;
      const figmaClient = new FigmaAPIClient({ personalAccessToken });

      let fileKey: string;
      let nodeId: string | undefined = explicitNodeId;

      // 判断输入是URL还是fileKey
      if (input.includes("figma.com")) {
        const urlInfo = parseFigmaURL(input);
        if (!urlInfo) {
          return {
            success: false,
            error: {
              message: "无效的Figma URL",
            },
          };
        }
        fileKey = urlInfo.fileKey;
        // 如果URL中包含node-id且未提供显式nodeId，则使用URL中的nodeId
        if (urlInfo.nodeId && !explicitNodeId) {
          nodeId = urlInfo.nodeId;
        }
      } else {
        fileKey = input;
      }

      // 确保提供了nodeId
      if (!nodeId) {
        return {
          success: false,
          error: {
            message: "缺少节点ID，请在URL中包含node-id参数或显式提供nodeId",
          },
        };
      }

      // 获取节点数据
      const response = await figmaClient.getNode(fileKey, nodeId);

      if (!response.success) {
        return {
          success: false,
          error: response.error,
        };
      }

      return {
        success: true,
        fileKey,
        nodeId,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || "获取Figma节点数据失败",
        },
      };
    }
  },
});

/**
 * 获取Figma文件信息的工具，返回简化的基本信息
 * 适合在需要文件基本信息但不需要完整设计数据时使用
 */
export const figmaGetFileInfoTool = createTool({
  id: "figma-get-file-info",
  description:
    "获取Figma文件的基本信息，包括标题、版本、缩略图等，返回简化的信息而非完整JSON数据。",
  inputSchema: z.object({
    input: z.string().describe("Figma设计的URL或fileKey"),
    personalAccessToken: z
      .string()
      .optional()
      .describe("Figma个人访问令牌，如果不提供则使用环境变量中的令牌"),
  }),
  execute: async ({ context }) => {
    try {
      const { input, personalAccessToken } = context;
      const figmaClient = new FigmaAPIClient({ personalAccessToken });

      // 判断输入是URL还是fileKey
      let fileKey = input;

      // 如果输入看起来像URL，则尝试解析它
      if (input.includes("figma.com")) {
        const urlInfo = parseFigmaURL(input);
        if (!urlInfo) {
          return {
            success: false,
            error: {
              message: "无效的Figma URL",
            },
          };
        }
        fileKey = urlInfo.fileKey;
      }

      // 获取文件数据
      const response = await figmaClient.getFile(fileKey);

      if (!response.success) {
        return {
          success: false,
          error: response.error,
        };
      }

      // 提取并返回基本信息
      const { name, lastModified, version, thumbnailUrl, document } =
        response.data;

      return {
        success: true,
        fileKey,
        fileInfo: {
          name,
          lastModified,
          version,
          thumbnailUrl,
          // 添加一些基本的文档结构信息，但不包含完整设计数据
          documentInfo: {
            id: document?.id,
            name: document?.name,
            type: document?.type,
            childrenCount: document?.children?.length || 0,
          },
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || "获取Figma文件信息失败",
        },
      };
    }
  },
});
