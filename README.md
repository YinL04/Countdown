# Beautiful Countdown App

一个基于 Electron 的多事件倒计时桌面应用，支持本地持久化、日历视图、多主题切换，并集成 Python 天气与出行建议 Agent。

## 功能

- 多倒计时卡片：同时追踪多个事件，精确到秒。
- 完整日历：支持月 / 周 / 日视图、事件筛选、点日期新建、点事件编辑。
- 多主题：现代科幻、商务办公、复古手机、复古电脑。
- 本地保存：倒计时数据保存在 Electron 用户数据目录下的 JSON 文件中，并支持导入导出。
- 天气建议：为事件填写城市后，可调用 Python Agent 获取天气、出行建议和景点推荐，渲染层通过 preload API 调用主进程。
- 可选 LLM 增强：配置 OpenAI 兼容接口后，天气建议会优先使用大模型生成；未配置时使用内置规则。

## 项目结构

```text
.
├── src/
│   ├── main/              # Electron 主进程
│   │   └── main.js
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

## 天气 Agent

渲染层通过以下命令调用天气 Agent：

```bash
python -m weather_agent <city>
```

如果系统中没有 `python` 命令，天气功能会提示 Python 环境缺失。主倒计时功能不依赖 Python。

## 打包

```bash
npm run build
```
