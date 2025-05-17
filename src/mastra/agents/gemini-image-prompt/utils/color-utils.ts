/**
 * 颜色处理相关的工具函数
 */

/**
 * 将RGB值转换为十六进制颜色代码
 * @param r - 红色通道值 (0-255)
 * @param g - 绿色通道值 (0-255)
 * @param b - 蓝色通道值 (0-255)
 * @returns 十六进制颜色代码，格式为 #RRGGBB
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("")
  );
}

/**
 * 从Figma数据中提取颜色信息
 * @param figmaData - Figma API返回的数据对象
 * @returns 提取的颜色列表（十六进制格式）
 */
export function extractColors(figmaData: any): string[] {
  const colors: Set<string> = new Set();

  // 递归搜索节点中的颜色
  function searchColors(node: any) {
    if (!node) return;

    // 检查填充
    if (node.fills) {
      node.fills.forEach((fill: any) => {
        if (fill.type === "SOLID" && fill.color) {
          const { r, g, b } = fill.color;
          const hex = rgbToHex(r * 255, g * 255, b * 255);
          colors.add(hex);
        }
      });
    }

    // 检查笔触
    if (node.strokes) {
      node.strokes.forEach((stroke: any) => {
        if (stroke.type === "SOLID" && stroke.color) {
          const { r, g, b } = stroke.color;
          const hex = rgbToHex(r * 255, g * 255, b * 255);
          colors.add(hex);
        }
      });
    }

    // 递归检查子节点
    if (node.children) {
      node.children.forEach((child: any) => searchColors(child));
    }
  }

  // 从文档开始搜索
  if (figmaData.document) {
    searchColors(figmaData.document);
  }

  return Array.from(colors);
}
