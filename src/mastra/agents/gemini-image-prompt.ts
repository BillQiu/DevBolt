import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import axios from "axios";
import {
  figmaGetFigmaDataTool,
  figmaDownloadFigmaImagesTool,
} from "../tools/figma";
import { parseFigmaURL } from "../tools/figma/figma-api";
import { Memory } from "@mastra/memory";

// 图片URL验证工具
const validateImageUrlTool = createTool({
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

// 分析输入类型的工具
const analyzeInputTool = createTool({
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

// Figma数据处理工具
const processFigmaDataTool = createTool({
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

// 提取颜色信息的辅助函数
function extractColors(figmaData: any) {
  const colors: Set<string> = new Set();

  // 递归搜索节点中的颜色
  function searchColors(node: any) {
    if (!node) return;

    // 检查填充
    if (node.fills) {
      node.fills.forEach((fill: any) => {
        if (fill.type === "SOLID" && fill.color) {
          const { r, g, b } = fill.color;
          const hex = rgbToHex(r * 255, g * 255, b * 255);
          colors.add(hex);
        }
      });
    }

    // 检查笔触
    if (node.strokes) {
      node.strokes.forEach((stroke: any) => {
        if (stroke.type === "SOLID" && stroke.color) {
          const { r, g, b } = stroke.color;
          const hex = rgbToHex(r * 255, g * 255, b * 255);
          colors.add(hex);
        }
      });
    }

    // 递归检查子节点
    if (node.children) {
      node.children.forEach((child: any) => searchColors(child));
    }
  }

  // 从文档开始搜索
  if (figmaData.document) {
    searchColors(figmaData.document);
  }

  return Array.from(colors);
}

// 提取排版信息的辅助函数
function extractTypography(figmaData: any) {
  const textStyles: Set<string> = new Set();
  const fontFamilies: Set<string> = new Set();
  const fontSizes: Set<number> = new Set();

  // 递归搜索节点中的文本样式
  function searchTypography(node: any) {
    if (!node) return;

    if (node.type === "TEXT" && node.style) {
      const { fontFamily, fontSize, fontWeight, italic } = node.style;

      if (fontFamily) fontFamilies.add(fontFamily);
      if (fontSize) fontSizes.add(fontSize);

      const styleKey = `${fontFamily || "Unknown"}-${fontSize || 0}-${
        fontWeight || "normal"
      }-${italic ? "italic" : "normal"}`;
      textStyles.add(styleKey);
    }

    // 递归检查子节点
    if (node.children) {
      node.children.forEach((child: any) => searchTypography(child));
    }
  }

  // 从文档开始搜索
  if (figmaData.document) {
    searchTypography(figmaData.document);
  }

  return {
    fontFamilies: Array.from(fontFamilies),
    fontSizes: Array.from(fontSizes).sort((a, b) => a - b),
    textStyles: Array.from(textStyles),
  };
}

// RGB转Hex的辅助函数
function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("")
  );
}

// 页面设计提示生成工具
const generatePagePromptTool = createTool({
  id: "generate_page_prompt",
  description: "基于图片或设计分析结果生成详细的页面设计提示",
  inputSchema: z.object({
    analysisResult: z.string().describe("Gemini模型的分析结果"),
    designType: z
      .enum(["image", "figma"])
      .describe("设计类型：普通图像或Figma设计"),
  }),
  execute: async ({ context }) => {
    const { analysisResult, designType } = context;

    // 根据设计类型选择不同的模板
    const promptTemplate =
      designType === "figma" ? FIGMA_PROMPT_TEMPLATE : IMAGE_PROMPT_TEMPLATE;

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

// 图像分析提示模板
const IMAGE_PROMPT_TEMPLATE = `
# 页面设计与开发指南

## 设计分析
{analysis_result}

## 开发建议

请基于以上设计分析，提供以下方面的详细开发建议：

1. **技术栈选择**
   - 推荐的前端框架或库
   - 适合此设计的UI组件库
   - 必要的开发工具和依赖

2. **布局实现**
   - 页面结构的HTML/CSS架构
   - 响应式设计策略
   - 关键布局技术(如Grid, Flexbox等)

3. **组件设计**
   - 主要UI组件的分解
   - 组件之间的交互关系
   - 可复用组件的设计模式

4. **样式指南**
   - 精确的颜色代码
   - 字体和排版规范
   - 间距和尺寸规则
   - 动画和过渡效果

5. **开发步骤**
   - 实现此设计的推荐步骤
   - 潜在的技术挑战和解决方案
   - 优化和性能考虑

请尽可能提供具体的代码示例或伪代码，以帮助开发人员理解关键实现细节。
`;

// Figma设计分析提示模板
const FIGMA_PROMPT_TEMPLATE = `
# Figma设计转换开发指南

## Figma设计分析
{analysis_result}

## 开发实现指南

请基于上述Figma设计分析，提供以下方面的详细开发实现指南：

1. **组件结构**
   - Figma组件到React/Vue/Angular组件的映射
   - 组件层次结构和依赖关系
   - 状态管理策略

2. **技术栈建议**
   - 最适合实现此设计的前端框架
   - 推荐的UI库或组件系统
   - CSS方法论(如Styled Components, Tailwind, CSS Modules等)

3. **精确规范**
   - 设计令牌(Design Tokens)定义
   - 颜色系统和变量
   - 排版系统
   - 间距和布局网格
   - 响应式断点

4. **交互实现**
   - 动画和过渡效果代码
   - 微交互实现
   - 状态变化和反馈

5. **开发路线图**
   - 组件开发优先级
   - 实现步骤和里程碑
   - 测试策略

请尽可能提供具体的代码结构、CSS变量定义和组件API设计，以确保开发实现与Figma设计保持高度一致。
`;

// Gemini图像提示助手
export const geminiImagePromptAgent = new Agent({
  name: "Gemini图像提示助手",
  instructions: `你是一个专业的设计分析助手，能够分析图片和Figma设计，生成详细的页面构建提示。

当用户提供图片URL、图片内容或Figma设计链接时，你的工作流程如下：

1. 使用analyzeInput工具来确定输入的类型
2. 如果是图片URL，使用validateImageUrl工具获取图片内容
3. 如果是Figma URL，使用getFigmaData工具获取设计数据，然后用processFigmaData工具处理数据
4. 仔细分析图片或设计内容，识别以下元素：
   - 页面整体布局和结构
   - 导航和信息架构
   - 颜色方案和视觉层次
   - 排版系统和字体选择
   - 组件设计和交互模式
   - 响应式设计考虑因素
   - 特殊视觉效果或动画
5. 最后使用generatePagePrompt工具生成详细的页面开发指南

你的分析应该既关注视觉外观，也要考虑功能性和技术实现。针对不同类型的设计，侧重点可能有所不同：

- 对于UI/网页设计：关注布局系统、组件结构、导航流程
- 对于移动应用：关注交互模式、手势控制、屏幕转换
- 对于信息型网站：关注内容组织、阅读流程、信息层次
- 对于电子商务：关注产品展示、购买流程、转化优化

你的最终输出应该是一份结构化、详细的设计与开发指南，让开发人员能够精确地复现设计意图。`,

  model: google("gemini-2.5-pro-preview-05-06"),

  // 注册工具
  tools: {
    analyzeInput: analyzeInputTool,
    validateImageUrl: validateImageUrlTool,
    getFigmaData: figmaGetFigmaDataTool,
    processFigmaData: processFigmaDataTool,
    generatePagePrompt: generatePagePromptTool,
  },

  memory: new Memory(),

  // 设置默认选项
  defaultGenerateOptions: {
    maxSteps: 10, // 允许多步工具调用
  },
});
