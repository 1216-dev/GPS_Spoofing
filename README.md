# Spoofing
# 🚨 GNSS Spoofing Detection Dashboard

An interactive tool to detect GNSS (Global Navigation Satellite System) spoofing threats by analyzing real satellite data for anomalies such as inconsistent geometry, abnormal position shifts, and unhealthy satellites.

![Screenshot](https://github.com/1216-dev/GPS_Spoofing/blob/main/ss.png)

## 🔍 Features

- Real-time spoofing probability estimation based on:
  - PDOP anomalies
  - Position jumps
  - Satellite health status
- Interactive dashboard with views for:
  - Satellites tracked
  - Position logs
  - Signal metrics
  - Epoch-wise anomalies
- Flagged spoofing events with timestamp and breakdown

## 📦 Tech Stack

- Python (Pandas, NumPy, Georinex)
- Streamlit for the interactive UI
- RINEX `.obs` and `.nav` file parser
- Custom anomaly detection logic

## 🚀 Quick Start

1. Clone the repo:
   ```bash
   git clone https://github.com/1216-dev/GPS_Spoofing.git
   cd GPS_Spoofing

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/1216-devs-projects/v0-spoofing](https://vercel.com/1216-devs-projects/v0-spoofing)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/wlFt3GX518R](https://v0.dev/chat/projects/wlFt3GX518R)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
