module.exports = function handler(req, res) {
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>视频去水印 API - 测试页面</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    h1 {
      color: #333;
      text-align: center;
      margin-bottom: 10px;
    }
    .subtitle {
      text-align: center;
      color: #666;
      margin-bottom: 30px;
      font-size: 14px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      color: #333;
      font-weight: 500;
      margin-bottom: 8px;
    }
    input[type="url"] {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.3s;
    }
    input[type="url"]:focus {
      outline: none;
      border-color: #667eea;
    }
    button {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
    }
    button:active {
      transform: translateY(0);
    }
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    .result {
      margin-top: 20px;
      padding: 16px;
      border-radius: 8px;
      display: none;
    }
    .result.success {
      background: #e8f5e9;
      border: 1px solid #4caf50;
    }
    .result.error {
      background: #ffebee;
      border: 1px solid #f44336;
    }
    .result h3 {
      margin-bottom: 10px;
      color: #333;
    }
    .result .url {
      word-break: break-all;
      font-family: monospace;
      font-size: 13px;
      margin-bottom: 10px;
    }
    .result a {
      color: #667eea;
      text-decoration: none;
    }
    .result a:hover {
      text-decoration: underline;
    }
    .copy-btn {
      padding: 6px 12px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      margin-top: 8px;
    }
    .endpoints {
      margin-top: 30px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }
    .endpoints h3 {
      color: #333;
      margin-bottom: 12px;
      font-size: 16px;
    }
    .endpoint {
      font-family: monospace;
      font-size: 13px;
      padding: 8px;
      background: white;
      border-radius: 4px;
      margin-bottom: 8px;
    }
    .loading {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 0.8s linear infinite;
      margin-right: 8px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎥 视频去水印 API</h1>
    <p class="subtitle">支持抖音、快手等平台视频解析</p>
    
    <div class="form-group">
      <label for="url">视频链接</label>
      <input 
        type="url" 
        id="url" 
        placeholder="粘贴视频链接，例如：https://v.douyin.com/xxx/"
        autocomplete="off"
      >
    </div>
    
    <button id="submitBtn" onclick="parseVideo()">
      解析视频
    </button>
    
    <div id="result" class="result"></div>
    
    <div class="endpoints">
      <h3>📡 API 接口</h3>
      <div class="endpoint">
        <strong>GET</strong> /api/health<br>
        <small style="color: #666;">健康检查</small>
      </div>
      <div class="endpoint">
        <strong>GET</strong> /api/video?url=&lt;视频链接&gt;<br>
        <small style="color: #666;">解析视频，返回直链</small>
      </div>
      <div class="endpoint">
        <strong>GET</strong> /api/test<br>
        <small style="color: #666;">本测试页面</small>
      </div>
    </div>
  </div>

  <script>
    async function parseVideo() {
      const urlInput = document.getElementById('url');
      const submitBtn = document.getElementById('submitBtn');
      const resultDiv = document.getElementById('result');
      
      const url = urlInput.value.trim();
      
      if (!url) {
        showResult('error', '请输入视频链接');
        return;
      }
      
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="loading"></span>解析中...';
      resultDiv.style.display = 'none';
      
      try {
        const response = await fetch(\`/api/video?url=\${encodeURIComponent(url)}\`);
        const data = await response.json();
        
        if (data.success) {
          showResult('success', '解析成功', data.url);
        } else {
          showResult('error', data.error || '解析失败');
        }
      } catch (error) {
        showResult('error', \`请求失败: \${error.message}\`);
      }
      
      submitBtn.disabled = false;
      submitBtn.innerHTML = '解析视频';
    }
    
    function showResult(type, title, url = '') {
      const resultDiv = document.getElementById('result');
      resultDiv.className = \`result \${type}\`;
      resultDiv.style.display = 'block';
      
      if (type === 'success' && url) {
        resultDiv.innerHTML = \`
          <h3>✅ \${title}</h3>
          <div class="url">\${url}</div>
          <button class="copy-btn" onclick="copyUrl('\${url.replace(/'/g, "\\\\'")}')">复制链接</button>
          <br><br>
          <a href="\${url}" target="_blank">▶️ 打开视频</a>
        \`;
      } else {
        resultDiv.innerHTML = \`<h3>❌ \${title}</h3>\`;
      }
    }
    
    async function copyUrl(url) {
      try {
        await navigator.clipboard.writeText(url);
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '已复制！';
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
      } catch (error) {
        alert('复制失败，请手动复制');
      }
    }
    
    // 支持回车键提交
    document.getElementById('url').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        parseVideo();
      }
    });
  </script>
</body>
</html>
  `;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
};
