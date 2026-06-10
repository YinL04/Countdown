# Beautiful Countdown App

A modern, elegant, multi-record countdown desktop application built with Electron, integrated with a Python weather + LLM travel advice agent.

> [**中文说明 (Chinese Documentation)**](#-中文说明)

## Features

- **Dashboard Layout:** Beautifully arranged grid to track multiple events simultaneously.
- **Glassmorphism UI:** Stunning frosted glass card effects with dynamic gradient starfield backgrounds.
- **Persistent Data:** Active countdowns are securely saved locally so you never lose track of your critical dates.
- **Real-Time Accuracy:** Calculates precisely down to the second with smooth transition animations.
- **Weather Travel Advice:** Associate a city with any countdown event to get real-time weather and LLM-powered travel suggestions.
- **Multi-Theme Support:** Switch between Modern Sci-Fi, Business Office, Retro Phone, and Retro PC themes.

## How to Run Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [Python 3.11+](https://www.python.org/) installed on your machine.

### Quick Start
1. Clone the repository:
   ```bash
   git clone https://github.com/YinL04/Countdown.git
   ```
2. Navigate into the application directory:
   ```bash
   cd Countdown
   ```
3. Install Node.js dependencies:
   ```bash
   npm install
   ```
4. Install Python dependencies (for weather feature):
   ```bash
   pip install -r requirements.txt
   ```
5. (Optional) Configure LLM API for enhanced travel advice:
   ```bash
   cp .env.example .env
   # Edit .env and set your OPENAI_API_KEY
   ```
6. Launch the app:
   ```bash
   npm start
   ```

## Technology Stack
- **Electron**: Desktop framework
- **HTML / CSS / JavaScript**: Core UI & logic
- **Python**: Weather data fetching and LLM travel advice generation
- **wttr.in**: Free weather API (no key required)
- **OpenAI-compatible API**: LLM for travel suggestions (optional)

---

# 中文说明

一个基于 Electron 架构的现代化、优雅的多记录桌面倒计时程序，集成了 Python 天气出行建议 Agent。

## v3.0 新版特性 (最新)
- **天气出行建议系统**：创建倒计时事件时可关联城市，点击卡片上的天气图标即可实时获取该城市的天气概况、出行建议和景点推荐。
- **LLM 智能建议**：配置 OpenAI 兼容 API 后，可获得由大语言模型生成的个性化旅行建议；未配置时自动使用内置规则引擎。
- **卡片式天气面板**：天气概况、出行建议、景点推荐三栏分段展示，清晰直观。

## v2.1 历史特性
- **历史时间追踪引擎**：全面放开了对未来时间的限制，您可以自由输入任何过去的日期。一旦时间越过终点，系统将全自动转换为"正向秒表"，精确记录该事件已经过去了多少天、多少小时。
- **致敬经典的复古电脑皮肤**：新增纯手工代码复原的 `复古电脑` 主题，经典的 #c0c0c0 灰色硬背景、深蓝色拖拽标题栏与复古凹凸立体边框。

## v2.0 历史特性
- **自定义多主题引擎**：支持"现代科幻(默认)"、"商务办公"、"复古手机"、"复古电脑"四种视觉风格一键切换。
- **独立智能日历系统**：倒计时事件自动标记在日历网格上，点击日期即可查看当天事件。
- **事件无缝编辑功能**：卡片支持二次编辑，修改后倒计时自动平滑接管。

## 基础功能亮点

- **控制面板布局**：以美观的网格方式同时追踪您的多项事件进程。
- **毛玻璃 (Glassmorphism) UI**：令人惊艳的玻璃拟物化卡片，搭配动态星空渐变背景特效。
- **本地数据持久化**：进行中的倒计时将安全地保存在本地缓存中，重启不丢失。
- **毫秒级精准追踪**：精确运算倒数至每分每秒，配合丝滑流畅的跳动动画效果。

## 如何在本地运行

### 前置准备
请确保您的电脑已安装 [Node.js](https://nodejs.org/) 和 [Python 3.11+](https://www.python.org/)。

### 快速启动
1. 克隆代码库：
   ```bash
   git clone https://github.com/YinL04/Countdown.git
   ```
2. 进入应用目录：
   ```bash
   cd Countdown
   ```
3. 安装 Node.js 依赖：
   ```bash
   npm install
   ```
4. 安装 Python 依赖（天气功能）：
   ```bash
   pip install -r requirements.txt
   ```
5. （可选）配置 LLM API 以获得增强版出行建议：
   ```bash
   cp .env.example .env
   # 编辑 .env，设置 OPENAI_API_KEY
   ```
6. 启动应用：
   ```bash
   npm start
   ```

## 技术栈
- **Electron**: 桌面框架
- **HTML / CSS / JavaScript**: UI 层构建
- **Python**: 天气数据获取与 LLM 出行建议生成
- **wttr.in**: 免费天气 API（无需密钥）
- **OpenAI 兼容 API**: 大语言模型出行建议（可选）

## 开源协议

本项目基于 [MIT License](LICENSE) 协议开源。
