import { Agent } from "@mastra/core/agent";
import { google } from "@ai-sdk/google";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { createLogger } from "@mastra/core/logger";
import {
  figmaGetFigmaDataTool,
  figmaDownloadFigmaImagesTool,
} from "../../tools/figma";

// 导入自定义工具
import {
  validateImageUrlTool,
  analyzeInputTool,
  processFigmaDataTool,
  generatePagePromptTool,
} from "./tools";

// 创建日志记录器
const consoleLogger = createLogger({ name: "Mastra", level: "debug" });
consoleLogger.info("App started");

/**
 * Gemini图像提示助手
 * 分析图片和Figma设计，生成详细的页面构建提示
 */
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

  model: google("gemini-2.5-pro-exp-03-25"),

  // 注册工具
  tools: {
    analyzeInput: analyzeInputTool,
    validateImageUrl: validateImageUrlTool,
    getFigmaData: figmaGetFigmaDataTool,
    processFigmaData: processFigmaDataTool,
    generatePagePrompt: generatePagePromptTool,
  },

  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../../memory.db", // relative path from bundled .mastra/output dir
    }),
  }),

  // 设置默认选项
  defaultGenerateOptions: {
    maxSteps: 10, // 允许多步工具调用
  },
});
