# Figma 集成工具

这个目录包含了与 Figma 设计平台集成的 Mastra 工具。

## 设置

使用这些工具前，你需要从 Figma 获取一个个人访问令牌（Personal Access Token）。

1. 登录 [Figma](https://www.figma.com/)
2. 点击右上角头像，选择 "Settings" (设置)
3. 点击 "Account" 标签页
4. 滚动到 "Personal access tokens" 部分
5. 输入一个名称并点击 "Generate token"
6. 复制生成的令牌（注意：令牌只会显示一次）

然后，你可以通过以下两种方式提供令牌：

1. 在环境变量中设置 `FIGMA_ACCESS_TOKEN`：

```bash
# Linux/Mac
export FIGMA_ACCESS_TOKEN=your_token_here

# Windows (CMD)
set FIGMA_ACCESS_TOKEN=your_token_here

# Windows (PowerShell)
$env:FIGMA_ACCESS_TOKEN="your_token_here"
```

2. 在调用工具时直接提供令牌。

## 可用工具

### 1. 获取 Figma 文件数据

```typescript
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { figmaGetFileDataTool } from "../tools";

const agent = new Agent({
  name: "Figma 助手",
  instructions: "你是 Figma 设计助手，可以获取和分析 Figma 设计文件。",
  model: openai("gpt-4o-mini"),
  tools: {
    figmaGetFileData: figmaGetFileDataTool
  }
});

// 使用 agent
const response = await agent.generate("获取这个 Figma 设计的数据: https://www.figma.com/file/abcdefg123456/DesignName");
```

### 2. 获取 Figma 节点数据

```typescript
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { figmaGetNodeDataTool } from "../tools";

const agent = new Agent({
  name: "Figma 组件分析器",
  instructions: "你是 Figma 组件分析助手，可以获取特定节点的详细信息。",
  model: openai("gpt-4o-mini"),
  tools: {
    figmaGetNodeData: figmaGetNodeDataTool
  }
});

// 示例：分析特定节点
const response = await agent.generate(
  "分析这个 Figma 按钮组件: https://www.figma.com/file/abcdefg123456/DesignName?node-id=123:456"
);
```

### 3. 获取 Figma 文件基本信息

```typescript
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { figmaGetFileInfoTool } from "../tools";

const agent = new Agent({
  name: "Figma 文件信息助手",
  instructions: "你是 Figma 文件信息助手，可以获取设计文件的基本信息。",
  model: openai("gpt-4o-mini"),
  tools: {
    figmaGetFileInfo: figmaGetFileInfoTool
  }
});

// 获取文件信息
const response = await agent.generate("获取这个 Figma 文件的基本信息: https://www.figma.com/file/abcdefg123456/DesignName");
```

## MCP 工具

如果你想通过 MCP (Model Context Protocol) 使用这些工具，可以使用以下 MCP 版本的工具：

### 获取 Figma 设计数据

```typescript
import { MCPServer } from "@mastra/mcp";
import { figmaGetFigmaDataTool, figmaDownloadFigmaImagesTool } from "../tools";

const server = new MCPServer({
  name: "Figma MCP 服务",
  version: "1.0.0",
  tools: { 
    figmaGetFigmaData: figmaGetFigmaDataTool,
    figmaDownloadFigmaImages: figmaDownloadFigmaImagesTool
  }
});

// 启动 MCP 服务器
await server.startStdio();
```

## URL 解析

库还提供了一个解析 Figma URL 的工具函数：

```typescript
import { parseFigmaURL } from "../tools";

const urlInfo = parseFigmaURL("https://www.figma.com/file/abcdefg123456/DesignName?node-id=123:456");
// 返回 { fileKey: "abcdefg123456", nodeId: "123:456" }
```

## API 客户端

如果你需要直接使用 Figma API 客户端：

```typescript
import { FigmaAPIClient } from "../tools";

const client = new FigmaAPIClient({ personalAccessToken: "your_token" });
const response = await client.getFile("abcdefg123456");
``` 