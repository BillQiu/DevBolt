# Gemini 图像提示 Agent

这个 Agent 使用 Google Gemini 2.5 Pro 模型分析图片和 Figma 设计，生成详细的页面构建提示。

## 功能

- 分析图片 URL 或直接传入的图片内容
- 处理 Figma 设计 URL，获取设计数据
- 识别设计元素、布局、颜色方案和组件结构
- 生成详细的页面开发指南

## 环境准备

使用前需设置以下环境变量：

```bash
# 创建 .env 文件并添加以下内容
GOOGLE_API_KEY=your_google_api_key_here
FIGMA_ACCESS_TOKEN=your_figma_access_token_here
```

## 使用方法

### 在代码中调用

```typescript
import { mastra } from "../path/to/mastra";

// 通过 mastra 访问注册的 agent
const agent = mastra.getAgent("geminiImagePrompt");

// 使用图片 URL
const response = await agent.generate("请分析这张图片: https://example.com/image.jpg");

// 使用 Figma URL
const figmaResponse = await agent.generate("请分析这个设计: https://www.figma.com/file/abc123/Design");

// 使用 Data URI
const dataUriResponse = await agent.generate("请分析这张图片: data:image/png;base64,iVBORw0KGg...");

// 获取结果
console.log(response.text);
```

### 通过 API 访问

运行服务器后，可以通过 HTTP API 访问：

```bash
# 启动服务器
npm run dev

# 发送请求
curl -X POST http://localhost:4111/api/agents/geminiImagePrompt/generate \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "请分析这张图片: https://example.com/image.jpg"}]}'
```

## 注意事项

1. Gemini 2.5 Pro 模型需要有效的 Google API 密钥
2. 使用 Figma 功能需要有效的 Figma 访问令牌
3. 分析大型 Figma 设计文件可能需要较长时间和更多资源
4. 图片 URL 必须可公开访问 