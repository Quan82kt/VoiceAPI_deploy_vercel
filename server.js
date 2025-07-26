const express = require('express');
const cors = require('cors');
const speakRoutes = require('./routes/speak');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// Enable CORS for all origins
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
}));

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Speak Proxy Server is running' });
});

// Routes
app.use('/speak', speakRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested endpoint does not exist',
        availableEndpoints: ['/speak', '/health']
    });
});

// Error handling middleware
app.use(errorHandler);

// Export app for Vercel
module.exports = app;

// Only start server if running directly (not in serverless environment)
if (require.main === module) {
    app.listen(PORT, HOST, () => {
        console.log(`🎤 Speak Proxy Server running on http://${HOST}:${PORT}`);
        console.log(`📡 Available endpoints:`);
        console.log(`   GET  /health - Health check`);
        console.log(`   GET  /speak  - Text-to-Speech proxy`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('🛑 SIGTERM received, shutting down gracefully');
        process.exit(0);
    });

    process.on('SIGINT', () => {
        console.log('🛑 SIGINT received, shutting down gracefully');
        process.exit(0);
    });
}
