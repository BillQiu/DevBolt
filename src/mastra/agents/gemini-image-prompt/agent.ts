import { Agent } from "@mastra/core/agent";
import { google } from "@ai-sdk/google";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { createLogger } from "@mastra/core/logger";

import { figmaMcp } from "../../mcp";

// 导入自定义工具
import {
  validateImageUrlTool,
  analyzeInputTool,
  processFigmaDataTool,
  generatePagePromptTool,
} from "./tools";

/**
 * Gemini图像提示助手
 * 分析图片和Figma设计，生成详细的页面构建提示
 */
export const geminiImagePromptAgent = new Agent({
  name: "Gemini图像提示助手",
  instructions: `你是一个专业的设计分析助手，能够分析图片和Figma设计，生成详细的页面构建提示。

当用户提供输入时，你可以同时处理图片URL和Figma设计链接，这样能够提高识别的可靠性。你的工作流程如下：

1. 使用analyzeInput工具分析用户输入，同时识别图片URL和Figma设计URL
2. 对于图片URL，使用validateImageUrl工具验证图片有效性
3. 对于Figma URL，使用get_figma_data工具获取设计数据，调用方式为:
   {
     "fileKey": "xxx",
     "nodeId": "xxxx",
     "depth": 100
   }
4. 如果用户同时提供了图片和Figma设计，应当结合两种输入进行更全面的分析
5. 仔细分析图片或设计内容，识别以下元素：
   - 页面整体布局和结构
   - 导航和信息架构
   - 颜色方案和视觉层次 
   - 排版系统和字体选择
   - 组件设计和交互模式
   - 响应式设计考虑因素
   - 特殊视觉效果或动画
6. 使用processFigmaData工具处理Figma数据（如果有）
7. 最后使用generatePagePrompt工具生成详细的页面开发指南

你的分析应该既关注视觉外观，也要考虑功能性和技术实现。针对不同类型的设计，侧重点可能有所不同：

- 对于UI/网页设计：关注布局系统、组件结构、导航流程
- 对于移动应用：关注交互模式、手势控制、屏幕转换
- 对于信息型网站：关注内容组织、阅读流程、信息层次
- 对于电子商务：关注产品展示、购买流程、转化优化

当同时分析图片和Figma设计时，你应当：
- 交叉验证两种输入中的信息
- 识别可能的不一致之处
- 提供更全面的设计解析
- 结合两种输入的优势生成更准确的实现指南

你的最终输出应该是一份结构化、详细的设计与开发指南，让开发人员能够精确地复现设计意图。`,

  model: google("gemini-2.5-pro-preview-05-06"),

  // 注册工具
  tools: {
    ...(await figmaMcp.getTools()),
    analyzeInput: analyzeInputTool,
    validateImageUrl: validateImageUrlTool,
    // processFigmaData: processFigmaDataTool,
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
