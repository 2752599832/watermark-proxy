const express = require('express');
const cors = require('cors');
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

// 方法3: 抖音直链解析
async function parseDouyinDirect(url) {
  const idMatch = url.match(/\/video\/(\w+)/);
  if (!idMatch) {
    throw new Error('无法提取抖音视频ID');
  }

  const videoId = idMatch[1];

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

// 启动服务器（仅本地运行时）
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// 导出 Express app（Vercel 需要）
module.exports = app;
