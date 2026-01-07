const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

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
    // 尝试多个解析方法
    const methods = [
      parseLiuMingye,
      parseDouyinDirect,
      parseKuaishouDirect
    ];

    for (const method of methods) {
      try {
        const result = await method(url);
        if (result.success) {
          console.log(`解析成功: ${method.name}`);
          return res.json(result);
        }
      } catch (error) {
        console.log(`${method.name} 失败: ${error.message}`);
        continue;
      }
    }

    // 所有方法都失败
    res.json({
      success: false,
      error: '所有解析方法都失败，请检查链接或稍后重试'
    });

  } catch (error) {
    console.error('解析失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 方法1: LiuMingye 解析
async function parseLiuMingye(url) {
  const apiUrl = `https://tool.liumingye.cn/video/?url=${encodeURIComponent(url)}`;

  const response = await fetch(apiUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  const html = await response.text();
  const $ = cheerio.load(html);

  // 尝试多个可能的视频URL位置
  let videoUrl = $('video').attr('src');
  if (!videoUrl) {
    videoUrl = $('video source').attr('src');
  }
  if (!videoUrl) {
    videoUrl = $('#video-player video').attr('src');
  }
  if (!videoUrl) {
    const match = html.match(/data-url=["']([^"']+)["']/);
    videoUrl = match ? match[1] : null;
  }

  if (videoUrl) {
    return {
      success: true,
      url: videoUrl,
      api: 'LiuMingye'
    };
  }

  throw new Error('未找到视频链接');
}

// 方法3: 抖音直链解析
async function parseDouyinDirect(url) {
  // 提取视频ID
  const idMatch = url.match(/\/video\/(\w+)/);
  if (!idMatch) {
    throw new Error('无法提取抖音视频ID');
  }

  const videoId = idMatch[1];

  // 访问抖音页面获取真实链接
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
    },
    redirect: 'manual'
  });

  // 从响应头或重定向URL中提取
  const location = response.headers.get('location');
  if (location) {
    return {
      success: true,
      url: location,
      api: 'DouyinDirect'
    };
  }

  throw new Error('无法获取抖音直链');
}

// 方法4: 快手直链解析
async function parseKuaishouDirect(url) {
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
      url: location,
      api: 'KuaishouDirect'
    };
  }

  throw new Error('无法获取快手直链');
}

// 启动服务器
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 去水印代理服务器已启动');
  console.log('='.repeat(50));
  console.log(`📡 监听端口: ${PORT}`);
  console.log(`🔗 API地址: http://localhost:${PORT}/api/video?url=视频链接`);
  console.log('='.repeat(50));
  console.log('\n✨ 免费使用，无需付费！\n');
});

module.exports = app;
