# SmartGuard — AI Accident Detection & Emergency Response System

SmartGuard is a full-stack dashboard portal built to monitor, analyze, and simulate traffic accident telemetry identified via edge-based AI camera detection networks.

---

## 🚀 Key Features

1. **Analytical Telemetry Dashboard**: Monitors real-time statistics including total accidents, confidence percentages, unique feeds, and daily frequencies using Recharts components.
2. **Dynamic Incident Ledger**: A searchable and filterable ledger containing all recorded incidents, offering category filtering, date filters, confidence slides, and client-side CSV downloads.
3. **Inference Bounding Box Overlay**: Interactive incident files showing the exact bounding coordinates generated during YOLOv11 inferences.
4. **Simulation Sandbox**: Allows operators to upload custom camera feeds to simulate YOLOv11 and OpenCV processing logic.
5. **Decoupled 4-Layer Architecture**: Robust routing utilizing Next.js 14 App Router, MongoDB Atlas, and Tailwind CSS.

---

## 🛠️ Technology Stack

* **Front-end / APIs**: Next.js 14 (App Router, React, TypeScript)
* **Styling**: Tailwind CSS
* **Database**: MongoDB Atlas / Local MongoDB Server (via Mongoose)
* **Data Visualization**: Recharts
* **Script Runner**: tsx (TypeScript Executor)
* **Icons**: Lucide React

---

## 📋 System Requirements

* Node.js v18.17.0 or higher
* npm or pnpm
* MongoDB Instance (local running server or a cloud MongoDB Atlas account)

---

## 🔧 Installation & Environment Configuration

### 1. Clone the project and install dependencies:
```bash
npm install
```

### 2. Configure Environment Variables:
Create or edit `.env.local` in the root of the workspace. Add the following variables:

```env
# MongoDB Connection URI (Replace with your actual MongoDB Atlas connection string)
MONGODB_URI=mongodb://127.0.0.1:27017/smartguard

# Application Settings
NEXT_PUBLIC_APP_NAME=SmartGuard
```

#### Connecting to MongoDB Atlas (Cloud)
To connect to a cloud Atlas cluster instead of a local MongoDB server:
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create or navigate to your database cluster.
3. Click **Connect** -> **Drivers** and copy the connection string.
4. Paste the connection string into `.env.local` as `MONGODB_URI`, replacing `<username>` and `<password>` with your database user credentials. Example:
   ```env
   MONGODB_URI=mongodb+srv://admin:securepassword@cluster0.abcde.mongodb.net/smartguard?retryWrites=true&w=majority
   ```

---

## 🗄️ Database Seeding

To populate the database with mock telemetry data spanning the last 14 days (25 records containing randomized confidence scores, categorizations, bounding boxes, and video sources):

```bash
npx tsx scripts/seed.ts
```

This script will automatically load connection strings from `.env.local`, flush existing incidents in the database, and write new seeded records.

---

## 💻 Running the Application

### Start Development Server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser to explore. The dashboard will auto-refresh database statistics every 30 seconds.

### Build and Run for Production:
```bash
npm run build
npm start
```

---

## 📁 Key File Structure

* `src/lib/mongodb.ts` - Singleton database connection client preventing hot-reload leaks.
* `src/models/Incident.ts` - Mongoose schema and schema model.
* `src/app/api/incidents/route.ts` - Main endpoints handling paginated query filters (GET) and simulated writes (POST).
* `src/app/api/incidents/[id]/route.ts` - Endpoint to fetch details for individual incident records.
* `src/app/api/stats/route.ts` - Endpoint delivering aggregated telemetry and charts counts.
* `src/app/page.tsx` - Systems landing portal page.
* `src/app/dashboard/page.tsx` - Real-time statistics portal page.
* `src/app/incidents/page.tsx` - Ledger list showing incidents with export capabilities.
* `src/app/incidents/[id]/page.tsx` - Interactive details page overlaying bounding frames.
* `src/app/upload/page.tsx` - Drag-and-drop YOLOv11 sandbox simulator.
* `src/app/about/page.tsx` - System architecture and validation statistics.

## 10. Expected Outcomes

The proposed system is expected to:

- Detect accidents automatically from surveillance videos.
- Reduce dependence on manual monitoring.
- Improve emergency response efficiency.
- Maintain searchable accident records.
- Provide real-time traffic safety analytics.
- Support future accident prevention research.

