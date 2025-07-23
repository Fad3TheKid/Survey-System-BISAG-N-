const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../server/.env') });

// Connect to MongoDB
connectDB();

const app = express();

// Middleware: log incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.headers.origin}`);
  next();
});

// Middleware: request body logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = ['http://localhost:3000', 'http://localhost:4000', 'https://your-frontend-domain.com', 'https://sc.ecombullet.com'];

app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Serve static files from React build
const clientBuildPath = path.join(__dirname, '../../client/build');
app.use(express.static(clientBuildPath));

/* ----------------------- API ROUTES ----------------------- */
app.use('/api/forms', require('./routes/forms'));
app.use('/api/responses', require('./routes/responses'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/masterdata', require('./routes/masterData'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/employee', require('./routes/employee'));
app.use('/api/external', require('./routes/externalApiProxy'));

/* -------------------- REACT FALLBACK --------------------- */
// Catch-all to serve React frontend for non-API routes
app.get('*', (req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

/* --------------------- ERROR HANDLERS --------------------- */
// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// OPTIONAL: 404 for invalid API routes only (React routes still work)
// Removed this as handled in catch-all above

/* ------------------------ START SERVER ------------------------ */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
