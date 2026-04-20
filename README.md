# \# 🍎 Smart Freshness Detection System (Frontend)

# 

# \## 📌 Overview

# 

# This is the \*\*frontend application\*\* for the Smart Freshness Detection System.

# 

# It provides a user-friendly interface to:

# 

# \* 📊 View sensor data (temperature, humidity, gas levels)

# \* 🤖 Monitor AI-based freshness detection (fresh / rotten)

# \* 📱 Track devices assigned to users

# \* 📈 Analyze historical data from Supabase

# 

# \---

# 

# \## 🧠 Architecture

# 

# ```id="d7z4kx"

# \[React Frontend]

# &#x20;       ↓

# \[Supabase API]

# &#x20;       ↓

# \[Database (readings table)]

# &#x20;       ↑

# \[Raspberry Pi / Simulator Backend]

# ```

# 

# \---

# 

# \## ⚙️ Features

# 

# \* 🔐 User authentication (Supabase Auth)

# \* 📊 Real-time sensor data display

# \* 🍌 Freshness detection results (AI output)

# \* 📈 Historical data charts

# \* 📱 Multi-device support (user-specific devices)

# \* ⚡ Live updates using Supabase subscriptions (optional)

# 

# \---

# 

# \## 🧩 Tech Stack

# 

# \* ⚛️ React.js (or Next.js)

# \* 🎨 Tailwind CSS (optional)

# \* ☁️ Supabase (Auth + Database + Realtime)

# \* 📊 Chart library (Recharts / Chart.js)

# 

# \---

# 

# \## 📁 Project Structure

# 

# ```id="2nl8pu"

# frontend/

# │

# ├── src/

# │   ├── components/     # UI components

# │   ├── pages/          # Pages / routes

# │   ├── services/       # Supabase client

# │   ├── hooks/          # Custom hooks

# │   └── App.jsx

# │

# ├── .env.example

# ├── package.json

# └── README.md

# ```

# 

# \---

# 

# \## 🔐 Environment Variables

# 

# Create a `.env` file:

# 

# ```env id="9q3c1v"

# VITE\_SUPABASE\_URL=your\_supabase\_url

# VITE\_SUPABASE\_ANON\_KEY=your\_anon\_key

# ```

# 

# > ⚠️ Never commit your real `.env` file

# 

# \---

# 

# \## 📦 Installation

# 

# ```bash id="u4z0nd"

# \# Clone repository

# git clone <your-repo-url>

# cd frontend

# 

# \# Install dependencies

# npm install

# ```

# 

# \---

# 

# \## 🚀 Run Development Server

# 

# ```bash id="2xwshc"

# npm run dev

# ```

# 

# App will run on:

# 

# ```id="gl5h8q"

# http://localhost:5173

# ```

# 

# \---

# 

# \## 🔗 Supabase Setup

# 

# Create a Supabase client:

# 

# ```javascript id="2a9qyz"

# import { createClient } from '@supabase/supabase-js'

# 

# const supabase = createClient(

# &#x20; import.meta.env.VITE\_SUPABASE\_URL,

# &#x20; import.meta.env.VITE\_SUPABASE\_ANON\_KEY

# )

# 

# export default supabase

# ```

# 

# \---

# 

# \## 📊 Fetch Data Example

# 

# ```javascript id="2ybp6h"

# const { data, error } = await supabase

# &#x20; .from('readings')

# &#x20; .select('\*')

# &#x20; .order('timestamp', { ascending: false })

# ```

# 

# \---

# 

# \## 📡 Real-time Subscription (Optional)

# 

# ```javascript id="i2v2zo"

# supabase

# &#x20; .channel('realtime-readings')

# &#x20; .on(

# &#x20;   'postgres\_changes',

# &#x20;   { event: 'INSERT', schema: 'public', table: 'readings' },

# &#x20;   (payload) => {

# &#x20;     console.log('New data:', payload.new)

# &#x20;   }

# &#x20; )

# &#x20; .subscribe()

# ```

# 

# \---

# 

# \## 📊 Example UI Features

# 

# \### Dashboard

# 

# \* Latest sensor readings

# \* Current freshness status

# 

# \### Device View

# 

# \* Device-specific data

# \* User-linked devices

# 

# \### Analytics

# 

# \* Temperature trends

# \* Gas level patterns

# \* Fresh vs rotten distribution

# 

# \---

# 

# \## 🧪 Sample Data Format

# 

# ```json id="c5p1qk"

# {

# &#x20; "device\_id": "device\_001",

# &#x20; "user\_id": "user\_123",

# &#x20; "temperature": 30.5,

# &#x20; "humidity": 65.2,

# &#x20; "mq135": 420,

# &#x20; "mq3": 120,

# &#x20; "item": "banana",

# &#x20; "status": "fresh",

# &#x20; "timestamp": "2026-04-19T10:00:00Z"

# }

# ```

# 

# \---

# 

# \## 🔐 Security Best Practices

# 

# \* Use \*\*Row Level Security (RLS)\*\* in Supabase

# \* Only allow users to access their own data

# \* Never expose service role keys in frontend

# 

# \---

# 

# \## 📈 Future Improvements

# 

# \* 🔔 Real-time alerts (rotten detection)

# \* 📱 Mobile responsive UI

# \* 📊 Advanced analytics dashboard

# \* 🧠 AI insights panel (via MCP agent)

# \* 🗺️ Device location tracking

# 

# \---

# 

# \## 🧠 AI Integration (Optional)

# 

# Integrate AI agent via MCP to:

# 

# \* Analyze patterns

# \* Predict spoilage

# \* Generate insights

# 

# \---

# 

# \## 🏁 Summary

# 

# This frontend provides a complete interface for:

# 

# \* Monitoring IoT sensor data

# \* Viewing AI-based freshness detection

# \* Managing devices and users

# \* Visualizing real-time and historical data

# 

# \---

# 

# \## 👨‍💻 Author

# 

# Your Team / Project Name

# 

# \---



