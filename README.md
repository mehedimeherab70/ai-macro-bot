# 🤖 AI Macro Bot — Android APK

**AI-powered Android automation app** — MacroDroid-এর মতো কিন্তু সম্পূর্ণ AI সাপোর্ট সহ।

## ✨ Features

### 🧠 AI-Powered
- **Natural Language Macro Generation** — বাংলা বা ইংরেজিতে বলে দিন, AI নিজেই macro তৈরি করবে
- **AI Screen Analysis** — স্ক্রিনশট দেখে AI বুঝবে কোন button কোথায়, কীভাবে interact করতে হবে
- **AI Action Steps** — "WhatsApp খুলে Mom-কে Good Morning মেসেজ পাঠাও" — AI নিজেই action sequence তৈরি করবে
- **Macro Optimizer** — AI আপনার existing macro analyze করে improvement suggest করবে

### ⚡ Automation Engine
- **20+ Trigger Types**: Manual, Time Schedule (Cron), App Launch/Close, Notification, Battery, WiFi, Bluetooth, Screen On/Off, Shake, Location, Call, SMS, Webhook
- **20+ Action Types**: Click UI, Long Press, Swipe, Type Text, Launch App, HTTP Request, Wait, Scroll, Toggle WiFi/BT/Flashlight, Set Volume/Brightness, Vibrate, Speak Text, Screenshot, AI Action
- **Constraints**: Time Range, Day of Week, Battery Level, WiFi State, Screen State, App Foreground
- **Humanization**: Persona-based micro-jitter, random delays, human-like typing, misclick simulation

### 🎨 UI
- Dark mode by default
- Bottom tab navigation (Macros, Logs, Settings)
- Visual macro editor with step-by-step configuration
- Execution log with per-step timing
- AI Generator screen with quick suggestions

## 🔧 How to Build APK

### Quick Build with EAS (Cloud)
```bash
npm install
npx eas login
npx eas build:configure
npx eas build --platform android --profile preview
```

### Local Build
```bash
npm install
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
```

## ⚙️ Setup After Install
1. Enable Accessibility Service
2. Grant notification & overlay permissions
3. Configure AI API key in Settings

Built with ❤️ using React Native + Expo + AI
