import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/authRoutes.js';
import priceRoutes from './routes/priceRoutes.js';
import basicNecessitiesRoutes from './routes/basicNecessitiesRoutes.js';
import primeCommoditiesRoutes from './routes/primeCommoditiesRoutes.js';
import constructionMaterialsRoutes from './routes/constructionMaterialsRoutes.js';
import printedLetterRoutes from './routes/printedLetterRoutes.js';
import utilRoutes from './routes/utilRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dti-price-monitoring';
const DB_NAME = process.env.DB_NAME || 'dtiApp';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: DB_NAME,
}).then(() => {
  console.log('✅ Connected to MongoDB');
  console.log(`📚 Using database: ${mongoose.connection.name}`);
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/basic-necessities', basicNecessitiesRoutes);
app.use('/api/prime-commodities', primeCommoditiesRoutes);
app.use('/api/construction-materials', constructionMaterialsRoutes);
app.use('/api/printed-letters', printedLetterRoutes);
app.use('/api', utilRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

