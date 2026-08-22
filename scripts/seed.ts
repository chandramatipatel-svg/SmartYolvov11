import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import Incident from '../src/models/Incident';

// Simple manual .env.local loader
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  for (const line of envConfig.split('\n')) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;
    const match = trimmedLine.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      process.env[key] = value.trim();
    }
  }
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

const videoSources = [
  'highway_cam_01.mp4',
  'intersection_feed_3.mp4',
  'expressway_feed_east.mp4',
  'tunnel_camera_04.mp4',
  'city_center_junction.mp4',
  'roundabout_south_feed.mp4',
  'flyover_cam_02.mp4'
];

function getRandomDateWithinLastNDays(n: number) {
  const now = new Date();
  const diffInMs = n * 24 * 60 * 60 * 1000;
  const randomTimeDiff = Math.random() * diffInMs;
  return new Date(now.getTime() - randomTimeDiff);
}

function getRandomFloat(min: number, max: number, decimals: number) {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);
  return parseFloat(str);
}

async function seed() {
  try {
    console.log('Connecting to database at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI!);
    console.log('Connected to MongoDB.');

    // Clear existing incidents
    const deleteResult = await Incident.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing incidents.`);

    const mockIncidents = [];

    for (let i = 0; i < 25; i++) {
      const confidence = getRandomFloat(0.70, 0.99, 2);
      const category = confidence > 0.85 ? 'Accident' : 'Non-Accident';
      const videoSource = videoSources[Math.floor(Math.random() * videoSources.length)];
      const timestamp = getRandomDateWithinLastNDays(14);
      const frameNumber = Math.floor(Math.random() * 401) + 100; // 100-500

      // Slightly randomize bounding boxes
      const boundingBox = {
        x: Math.floor(Math.random() * 100) + 100, // 100-200
        y: Math.floor(Math.random() * 80) + 60,    // 60-140
        width: Math.floor(Math.random() * 100) + 150, // 150-250
        height: Math.floor(Math.random() * 80) + 100  // 100-180
      };

      // Set snapshot path for about half the entries
      const frameSnapshotPath = Math.random() > 0.5 ? `/snapshots/frame_${i + 1}.jpg` : undefined;

      mockIncidents.push({
        videoSource,
        frameNumber,
        confidence,
        category,
        boundingBox,
        frameSnapshotPath,
        timestamp,
        status: 'Detected',
        createdAt: timestamp
      });
    }

    // Sort mock incidents by timestamp descending
    mockIncidents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Write to DB
    const createdIncidents = await Incident.insertMany(mockIncidents);
    console.log(`Successfully seeded ${createdIncidents.length} incidents into database.`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
