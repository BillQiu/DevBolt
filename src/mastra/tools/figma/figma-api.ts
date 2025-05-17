import axios from "axios";
import { z } from "zod";

// 定义 Figma API 类型
export interface FigmaAPIOptions {
  personalAccessToken?: string;
  // 如果有需要可以添加更多配置选项
}

// Figma URL信息接口
export interface FigmaURLInfo {
  fileKey: string;
  nodeId?: string;
}

// Figma API 错误接口
export interface FigmaAPIError {
  status: number;
  message: string;
  reason?: string;
}

// Figma API 响应接口
export interface FigmaAPIResponse {
  success: boolean;
  data?: any;
  error?: FigmaAPIError;
}

/**
 * Figma API客户端类
 */
export class FigmaAPIClient {
  private baseURL = "https://api.figma.com/v1";
  private token: string;

  constructor(options: FigmaAPIOptions = {}) {
    // 优先使用传入的token，其次使用环境变量
    this.token =
      options.personalAccessToken || process.env.FIGMA_ACCESS_TOKEN || "";

    if (!this.token) {
      console.warn("没有提供Figma访问令牌，API请求可能会失败");
    }
  }

  /**
   * 获取Figma文件数据
   */
  async getFile(fileKey: string): Promise<FigmaAPIResponse> {
    try {
      if (!this.token) {
        return {
          success: false,
          error: {
            status: 401,
            message: "未提供Figma访问令牌",
          },
        };
      }

      const response = await axios.get(`${this.baseURL}/files/${fileKey}`, {
        headers: {
          "X-Figma-Token": this.token,
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          status: error.response?.status || 500,
          message: error.message,
          reason: error.response?.data?.message,
        },
      };
    }
  }

  /**
   * 获取Figma节点数据
   */
  async getNode(fileKey: string, nodeId: string): Promise<FigmaAPIResponse> {
    try {
      if (!this.token) {
        return {
          success: false,
          error: {
            status: 401,
            message: "未提供Figma访问令牌",
          },
        };
      }

      const response = await axios.get(
        `${this.baseURL}/files/${fileKey}/nodes?ids=${nodeId}`,
        {
          headers: {
            "X-Figma-Token": this.token,
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          status: error.response?.status || 500,
          message: error.message,
          reason: error.response?.data?.message,
        },
      };
    }
  }

  /**
   * 获取Figma图像链接
   */
  async getImageUrls(
    fileKey: string,
    nodeIds: string[]
  ): Promise<FigmaAPIResponse> {
    try {
      if (!this.token) {
        return {
          success: false,
          error: {
            status: 401,
            message: "未提供Figma访问令牌",
          },
        };
      }

      const response = await axios.get(`${this.baseURL}/images/${fileKey}`, {
        params: {
          ids: nodeIds.join(","),
          format: "svg",
        },
        headers: {
          "X-Figma-Token": this.token,
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          status: error.response?.status || 500,
          message: error.message,
          reason: error.response?.data?.message,
        },
      };
    }
  }

  /**
   * 下载图像
   */
  async downloadImage(url: string, path: string): Promise<FigmaAPIResponse> {
    try {
      const fs = await import("fs");
      const { finished } = await import("stream/promises");

      const response = await axios({
        method: "GET",
        url: url,
        responseType: "stream",
      });

      const writer = fs.createWriteStream(path);
      response.data.pipe(writer);

      await finished(writer);

      return {
        success: true,
        data: { path },
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          status: error.response?.status || 500,
          message: error.message,
          reason: "Failed to download image",
        },
      };
    }
  }
}

/**
 * 解析Figma URL获取fileKey和nodeId
 */
export function parseFigmaURL(url: string): FigmaURLInfo | null {
  try {
    const figmaUrl = new URL(url);

    // 检查是否是Figma URL
    if (!figmaUrl.hostname.includes("figma.com")) {
      return null;
    }

    // 解析路径部分获取fileKey
    const pathParts = figmaUrl.pathname.split("/");
    let fileKey = "";

    // 常见Figma URL模式：
    // https://www.figma.com/file/abcdefg123456/FileName
    // https://www.figma.com/proto/abcdefg123456/FileName
    // 通常文件ID在路径的第三部分
    if (pathParts.length >= 3) {
      fileKey = pathParts[2];
    }

    // 从URL参数中获取nodeId
    const nodeId = figmaUrl.searchParams.get("node-id") || undefined;

    if (!fileKey) {
      return null;
    }

    return { fileKey, nodeId };
  } catch (error) {
    return null;
  }
}
