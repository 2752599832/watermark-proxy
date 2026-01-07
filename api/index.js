// Vercel Serverless Function 入口文件
const app = require('../server');

// Vercel 会自动导出这个函数
module.exports = (req, res) => {
  app(req, res);
};
// ... 之前的所有代码 ...

// 启动服务器（仅本地运行时）
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// 导出 Express app（Vercel 需要）
module.exports = app;
