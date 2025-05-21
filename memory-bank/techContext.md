# DevBolt 技术上下文

## 技术架构

### 框架和库
- **Mastra**: 核心AI Agent框架 (@mastra/core)
- **LibSQL**: 数据存储解决方案 (@mastra/libsql)
- **MCP**: Mastra控制面板 (@mastra/mcp)
- **Memory**: Mastra内存管理 (@mastra/memory)
- **Google AI SDK**: 提供Gemini AI模型访问 (@ai-sdk/google)
- **Axios**: HTTP客户端
- **Figma API**: Figma设计平台API
- **Zod**: 类型验证库

### 项目结构
- **src/mastra/**: 主要源代码目录
  - **agents/**: 各类AI代理实现
    - **gemini-image-prompt/**: Gemini图像分析Agent
    - **contact-operations/**: 联系人操作Agent
  - **tools/**: 工具实现
    - **figma/**: Figma相关工具
  - **mcp/**: Mastra控制面板相关功能
  - **workflows/**: 工作流定义
- **.mastra/**: Mastra框架数据和构建输出
- **memory.db**: 内存数据库

### 环境需求
- **Node.js**: >=20.9.0
- **环境变量**:
  - `GOOGLE_API_KEY`: Google API密钥
  - `FIGMA_ACCESS_TOKEN`: Figma访问令牌

### 构建和开发
- **开发模式**: `npm run dev` 或 `pnpm dev`
- **构建**: `npm run build` 或 `pnpm build`

### 技术挑战
- AI模型调用的稳定性和错误处理
- Figma API集成的完整性
- 数据持久化和状态管理
- 性能优化特别是图像处理
