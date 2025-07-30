## 二手房数据可视化项目

本项目旨在使用 Bun, TypeScript, Vue3 和 Echarts 实现二手房数据的 2D 可视化和数据分析。

**技术栈:**

- 构建/包管理/运行时: Bun
- 语言: TypeScript
- 前端框架: Vue3
- 2D 可视化: Echarts
- 数据分析展示

**数据来源:**

本项目的数据源预期来自本地 Excel 文件 `D:\链家二手房爬虫\py_crawler\spider_project\爬取的数据\house_cleared_8.xlsx`。

**重要提示: 数据访问**

由于浏览器安全限制，前端项目无法直接读取本地文件系统中的 Excel 文件。您需要将数据转换为 웹 友好的格式（如 JSON），并将 JSON 文件放置在项目的 `public` 目录下。这样，开发服务器会将其作为静态资源提供，前端可以通过 `/house_data.json` (或其他相对路径) 来访问。

本项目已通过 `py_crawler/rendering/util/xlsx转json.ts` 脚本将 `house_cleared_8.xlsx` 转换为 `house_data.json`。请将 `house_data.json` 文件移动到 `py_crawler/rendering/public/` 目录下。

在数据可访问后，您可以在 `src/App.vue` 或其他组件中编写代码来加载并使用数据绘制图表和展示分析结果。

**项目设置:**

1.  确保您已安装 Bun: `curl -fsSL https://bun.sh/install | bash`
2.  在项目根目录 (`py_crawler/rendering`) 下打开终端。
3.  运行 `bun install` 安装依赖。
4.  运行 `bun run dev` 启动开发服务器。

**下一步:**

1.  确定数据访问方式，并将数据转换为前端可用的格式。
2.  在 `src/App.vue` 或创建新的组件中，编写代码加载数据并集成 Echarts 来绘制 2D 图表。
3.  在数据分析区域填充实际的分析内容（已添加结构和初步文本）。 