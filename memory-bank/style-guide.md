# DevBolt 风格指南

## 代码风格

### TypeScript
- 使用严格模式 (`"strict": true`)
- 使用类型定义而非推断
- 函数参数和返回值都应有明确类型
- 使用接口定义复杂对象结构
- 使用可选链操作符 (`?.`) 和空值合并操作符 (`??`)

### 格式化
- 使用2空格缩进
- 行长度最大限制为100字符
- 使用分号作为语句结束符
- 字符串优先使用单引号
- 对象和数组最后一项添加尾随逗号

## 命名约定

### 文件命名
- 使用短横线分隔（kebab-case）: `figma-api.ts`
- 测试文件命名为 `[name].test.ts` 或 `[name].spec.ts`
- 索引文件使用 `index.ts`

### 代码命名
- **类**: 使用大驼峰命名法（PascalCase）: `FigmaApiClient`
- **接口**: 使用大驼峰命名法，不使用前缀I: `UserOptions`
- **类型**: 使用大驼峰命名法: `ResponseType`
- **函数**: 使用小驼峰命名法（camelCase）: `getFigmaDesign`
- **变量**: 使用小驼峰命名法: `designData`
- **常量**: 使用下划线分隔的大写: `DEFAULT_API_URL`
- **私有属性**: 使用下划线前缀: `_privateField`

## 注释规范

### 文件头注释
```typescript
/**
 * Figma API客户端
 * 提供与Figma设计平台API交互的方法
 * 
 * @module tools/figma
 */
```

### 函数注释
```typescript
/**
 * 获取Figma设计文件
 * 
 * @param fileId Figma文件ID
 * @returns Figma设计文件数据
 * @throws 如果API请求失败
 */
```

### 内联注释
- 使用 `// 注释内容` 格式
- 避免无意义的注释
- 解释复杂逻辑和非显而易见的代码

## 文档规范

### README文件
- 每个主要模块和Agent都应有README.md文件
- 包含功能概述、使用示例和注意事项
- 使用清晰的章节和小标题

### API文档
- 使用JSDoc注释生成API文档
- 所有公开API都应有完整文档
- 包含参数说明、返回值和异常信息

### 变更日志
- 使用语义化版本控制
- 记录所有API变更、功能添加和错误修复
- 按版本号和日期组织
