# Beautiful Countdown App

A modern, elegant, multi-record countdown desktop application built with Electron.

## ✨ Features

- **Dashboard Layout:** Beautifully arranged grid to track multiple events simultaneously.
- **Glassmorphism UI:** Stunning frosted glass card effects with dynamic gradient starfield backgrounds.
- **Persistent Data:** Active countdowns are securely saved locally so you never lose track of your critical dates.
- **Seamless Desktop Experience:** Deployed as a standalone `.exe` utilizing Electron.
- **Real-Time Accuracy:** Calculates precisely down to the second with smooth transition animations.

## 🚀 How to Run Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Quick Start
1. Clone the repository:
   ```bash
   git clone https://github.com/YinL04/Countdown.git
   ```
2. Navigate into the application directory:
   ```bash
   cd Countdown
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Launch the app in development mode:
   ```bash
   npm start
   ```

### 📦 Building the Executable (Windows)

To generate a standalone `.exe` file tailored for Windows, ensure your terminal has Administrator privileges (to allow `electron-builder` to link files), then run:
```bash
npm run build
```
The compiled executable will be located inside the `dist/win-unpacked/` folder.

## 🛠️ Technology Stack
- **Electron**: Desktop Framework Wrapper
- **HTML / CSS / JavaScript**: Core UI & Logic

## 📄 License
ISC
