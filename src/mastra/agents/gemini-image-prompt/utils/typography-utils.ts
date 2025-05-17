/**
 * 排版相关的工具函数
 */

/**
 * 从Figma数据中提取排版信息
 * @param figmaData - Figma API返回的数据对象
 * @returns 提取的排版信息，包括字体系列、字体大小和文本样式
 */
export function extractTypography(figmaData: any) {
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
