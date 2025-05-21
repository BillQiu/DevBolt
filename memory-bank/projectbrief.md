# DevBolt 项目简介

## 项目概述
DevBolt是一个基于mastra框架的AI应用开发平台，专注于集成先进的AI能力来提升开发效率。项目旨在提供易用的工具和代理（Agent），让开发者能够快速构建、测试和部署AI增强的应用程序。

## 主要功能
1. **Gemini图像提示Agent** - 使用Google Gemini 2.5 Pro模型分析图片和Figma设计，生成详细的页面构建指南
2. **Figma工具集** - 与Figma API交互，获取和处理设计文件
3. **Contact Operations Agent** - 处理联系人相关操作（功能待详细说明）

## 技术栈
- **框架**: Mastra (@mastra/core及相关库)
- **AI模型**: Google Gemini 2.5 Pro (@ai-sdk/google)
- **数据存储**: LibSQL (@mastra/libsql)
- **开发语言**: TypeScript
- **包管理**: pnpm

## 项目目标
1. 创建直观的界面，让开发者能够轻松利用AI能力
2. 简化设计到代码的转换过程
3. 提供高度可定制的Agent框架
4. 保持代码质量和可维护性
5. 支持多种集成场景

## 主要用例
1. 开发者上传UI设计或图片，获取详细的实现建议
2. 从Figma设计直接生成可用的前端组件结构
3. 自动分析设计元素、布局、颜色方案和组件关系
4. 提供智能辅助，加速开发流程

## 当前状态
项目处于早期开发阶段，基础框架已搭建，核心Agent正在开发中。
