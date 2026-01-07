const express = require('express');
const cors = require('cors');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// 解析函数
async function parseVideo(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      },
      redirect: 'manual'
    });

    const location = response.headers.get('location');
    if (location) {
      return {
        success: true,
        url: location
      };
    }

    throw new Error('无法获取视频链接');
  } catch (error) {
    throw error;
  }
}

// 主路由：解析视频
app.get('/api/video', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      success: false,
      error: '缺少url参数'
    });
  }

  console.log(`解析请求: ${url}`);

  try {
    const result = await parseVideo(url);
    console.log(`解析成功: ${result.url}`);
    res.json(result);
  } catch (error) {
    console.error('解析失败:', error);
    res.json({
      success: false,
      error: error.message
    });
  }
});

module.exports = app;
