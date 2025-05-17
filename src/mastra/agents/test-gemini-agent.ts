import { geminiImagePromptAgent } from "./gemini-image-prompt";

/**
 * 测试Gemini图像提示Agent
 *
 * 可以使用以下类型的输入进行测试：
 * 1. 图片URL: 例如 https://example.com/image.jpg
 * 2. Figma URL: 例如 https://www.figma.com/file/abcdef123456/DesignFile
 * 3. 图像数据URI: 以 "data:image/" 开头的Base64编码图像
 *
 * 运行方式:
 * 1. 确保已设置环境变量:
 *    - GOOGLE_API_KEY: 用于访问Google Gemini API
 *    - FIGMA_ACCESS_TOKEN: 用于访问Figma API (如果测试Figma功能)
 *
 * 2. 运行测试:
 *    npx tsx src/mastra/agents/test-gemini-agent.ts
 */

async function testAgent() {
  // 可以替换为任意测试输入
  const testInput =
    "请分析这个图片并生成页面构建提示: https://example.com/image.jpg";

  try {
    console.log("开始测试Gemini图像提示Agent...");
    console.log(`输入: "${testInput}"`);

    const response = await geminiImagePromptAgent.generate(testInput, {
      maxSteps: 10,
      onStepFinish: ({ text, toolCalls }) => {
        if (toolCalls?.length) {
          console.log(`执行工具: ${toolCalls[0].toolName}`);
        }
      },
    });

    console.log("\n=== 生成结果 ===\n");
    console.log(response.text);

    console.log("\n测试完成!");
  } catch (error) {
    console.error("测试失败:", error);
  }
}

// 仅当直接运行此文件时执行测试
if (require.main === module) {
  testAgent().catch(console.error);
}

export { testAgent };
