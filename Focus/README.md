# 🌌 Focus Dashboard

**Focus** is an advanced, privacy-first, locally-hosted productivity dashboard designed to be your all-in-one digital hub. It replaces your messy browser tabs with a single, sleek, glassmorphic command center.

Everything you do in Focus—your notes, your layouts, your tabs, your settings—is saved entirely in your browser's local storage. This means **zero accounts, zero cloud databases, and 100% privacy.**

---

## ✨ Core Features

### 📦 Infinite Workspaces (Tabs)
Focus uses a powerful Workspace Engine. You can create as many "Tabs" as you want (e.g., "Work", "Crypto", "Chill"). Each tab remembers its own unique widgets and layout perfectly.

### 🧩 Drag-and-Drop Grid System
Every widget on your dashboard can be dragged, resized, and snapped perfectly into place. Build your ideal layout!

### 🛸 Teleporting Widgets
Want to move a widget to a different tab? Every widget has an arrow icon in its header. Click it, select your destination tab, and the widget will instantly teleport to the new workspace while preserving all of its internal data.

### 🌐 Global Header Zone
The top header of the dashboard is "Global." If you add a supported Music widget (like Spotify), it pins itself to the top header instead of your grid. Because the header sits outside of the tab system, your music will **never** stop playing or skip a beat, even as you navigate freely between your workspaces!

---

## 🛠️ The Widget Library (17+ Modules)

1. **📝 Notes & To-Do**: Full rich-text notepad and checklist system that auto-saves your progress.
2. **🌧️ Ambient Weather**: A vivid digital window that connects to live meteorological data. If it's raining in your city, animated rain will fall across the glass.
3. **⚡ Live Blockchain**: A true "Whale Tracker". It connects directly to the raw Bitcoin network, tracking live USD values of real-time transactions dropping down the screen like Matrix code.
4. **📈 Crypto Heatmap & Markets**: Live financial data showing market caps, percentage gains, and top 30 crypto performance visually.
5. **📰 Live News**: Custom news feeds that pull the latest headlines for Topics like AI, Crypto, or Politics.
6. **🎧 Spotify Ambient**: A compact, glass-pill global music player.
7. **🎩 Chill With Hatty**: A custom integration of the Hatty Music website.
8. **🌐 Embed Website**: A generic web-browser widget. Paste *any* URL into it to turn that website into a dashboard widget!
9. **⏲️ Pomodoro & World Clock**: Advanced time-tracking and productivity timers to keep you focused.
10. **📖 Dictionary & Word Counter**: Tools for writers, providing live definitions and character metrics.
11. **🖼️ Vision Board**: Keeps your goals right in front of you.

---

## 🚀 How to Run Locally

If you want to run Focus on your own computer:
1. Ensure you have **Node.js** installed.
2. Open your terminal and navigate to this folder.
3. Run `npm install` to download dependencies.
4. Run `npm run dev` to start the dashboard.
5. Open your browser and go to `http://localhost:3000`

---

## 🌍 How to Publish / Deploy

Because Focus is built using **Next.js**, the easiest and best way to deploy it to the internet is using **Vercel** (the company that created Next.js). 

**Why not GitHub Pages?**
GitHub Pages is fantastic for "Static Sites" (like your Chill With Hatty site). However, Focus uses powerful **Server-Side APIs** to bypass security blocks to fetch live Crypto prices and News articles. GitHub Pages does not support server-side APIs, so if you publish there, your News and Crypto widgets will break!

### Publishing with Vercel or Netlify (Recommended, Free, Takes 2 Minutes):
You can use either **Vercel** or **Netlify**—both are completely free, support Next.js server APIs perfectly, and use the exact same process:
1. Create a free account at [Vercel.com](https://vercel.com) or [Netlify.com](https://netlify.com).
2. Upload this entire `Focus` folder to a new **GitHub Repository**.
3. On Vercel/Netlify, click "Add New Project" and link it to your new GitHub Repository.
4. The platform will automatically detect that it's a Next.js app and build it perfectly.
5. In 60 seconds, you will be given a live URL! Every time you push an update to your code on GitHub in the future, your live site will update automatically.
