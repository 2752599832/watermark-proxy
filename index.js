export default function handler(req, res) {
  res.status(200).json({
    message: 'Watermark Proxy API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      video: '/api/video?url=<video_url>'
    }
  });
}
