# Beautiful Countdown App

一个基于 Electron 的多事件倒计时桌面应用，支持本地持久化、日历视图、多主题、提醒、分类筛选、ICS 日历互通，并集成 Python 天气与出行建议 Agent。

## 功能

- 多倒计时卡片：同时跟踪多个事件，精确到秒。
- 首页概览：展示今日事件和近期重点事件。
- 分类管理：支持生日、项目、考试、旅行、纪念日和其他分类。
- 搜索与筛选：按名称、城市、备注、分类、状态和时间排序。
- 桌面提醒：可设置提前 1 天、1 小时、10 分钟提醒。
- 完整日历：支持月 / 周 / 日视图、事件筛选、点击日期快速新建。
- 过期管理：过期事件可归档、恢复、删除或重新设置。
- 多主题：现代科幻、商务办公、复古手机、复古电脑。
- 本地保存：倒计时数据保存在 Electron 用户数据目录下的 JSON 文件中。
- 导入导出：支持 JSON 备份和 ICS 日历文件导入导出。
- 天气建议：为带城市的事件生成天气、出行建议和景点推荐。
- 可选 LLM 增强：配置 OpenAI 兼容接口后，天气建议优先使用大模型生成；未配置时使用内置规则。
- 小窗与托盘：支持将主窗口切换为小窗，并通过系统托盘快速显示。

## 项目结构

```text
.
├── src/
│   ├── main/              # Electron 主进程、IPC、存储和系统能力
│   └── renderer/          # 页面、样式和渲染层逻辑
│       ├── css/
│       ├── js/
│       ├── index.html
│       ├── script.js
│       └── style.css
├── weather_agent/         # Python 天气与出行建议 Agent
├── package.json           # Electron 启动与打包配置
├── requirements.txt       # Python 依赖
├── .env.example           # 可选 LLM / 天气配置示例
└── README.md
```

`dist/`、`node_modules/`、`__pycache__/` 等生成产物不属于源码结构，已通过 `.gitignore` 忽略。

## 本地运行

安装 Node.js 依赖：

```bash
npm install
```

安装 Python 依赖：

```bash
pip install -r requirements.txt
```

可选：配置 LLM API。

```bash
cp .env.example .env
```

启动应用：

```bash
npm start
```

检查 JavaScript 语法：

```bash
npm run check
```

Windows PowerShell 如果禁止执行 `npm.ps1`，可以使用：

```bash
npm.cmd run check
```

## 天气 Agent

渲染层通过主进程调用天气 Agent：

```bash
python -m weather_agent <city> --json
```

如果系统中没有 `python` 命令，天气功能会提示 Python 环境缺失。主倒计时功能不依赖 Python。

## 打包

```bash
npm run build
```
