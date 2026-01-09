module.exports = async function handler(req, res) {
  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: '只允许 GET 请求' 
    });
  }

  const { url } = req.query;

  // 验证 url 参数
  if (!url) {
    return res.status(400).json({ 
      success: false, 
      error: '缺少 url 参数' 
    });
  }

  console.log(`[解析请求] URL: ${url}`);

  try {
    // 获取视频直链
    const videoUrl = await getDirectVideoUrl(url);

    console.log(`[解析成功] 直链: ${videoUrl}`);

    return res.json({
      success: true,
      url: videoUrl,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error(`[解析失败] ${error.message}`);

    return res.json({
      success: false,
      error: error.message,
      timestamp: Date.now()
    });
  }
};

// 获取视频直链
async function getDirectVideoUrl(url) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    },
    redirect: 'manual'
  });

  const location = response.headers.get('location');

  if (!location) {
    throw new Error('无法获取视频链接，可能链接已失效或平台限制');
  }

  return location;
}
