# DevBolt 系统模式

## 代码组织模式

### Agent模式
所有AI代理都遵循Mastra框架的Agent模式，包含以下组件：
- **agent.ts**: 定义Agent的核心功能和处理逻辑
- **index.ts**: 导出Agent和相关功能
- **tools/**: Agent专用工具
- **utils/**: 辅助函数和通用工具
- **templates/**: 提示模板和格式化工具

### 工具集成模式
外部API和服务的集成遵循以下模式：
- **[service]-api.ts**: 直接与外部API交互的底层函数
- **[service]-tool.ts**: 面向Agent的工具封装
- **[service]-mcp-tool.ts**: MCP控制面板专用工具
- **index.ts**: 导出所有相关功能

## 设计模式

### 依赖注入
Mastra框架使用依赖注入模式初始化和组织Agent：
```typescript
export const mastra = new Mastra({
  agents: {
    geminiImagePrompt: geminiImagePromptAgent,
  },
});
```

### 工厂模式
Agent及工具的创建通常使用工厂模式，确保配置一致性：
```typescript
export const geminiImagePromptAgent = createGeminiAgent({
  // 配置参数
});
```

## 命名约定

### 文件命名
- 使用短横线分隔（kebab-case）: `figma-api.ts`
- Agent命名描述功能: `gemini-image-prompt`
- 通用工具使用单一词汇: `utils`, `tools`

### 类与函数命名
- 类使用大驼峰命名法（PascalCase）: `FigmaApiClient`
- 函数使用小驼峰命名法（camelCase）: `getFigmaDesign`
- 常量使用下划线分隔的大写（UPPER_SNAKE_CASE）: `DEFAULT_API_URL`
