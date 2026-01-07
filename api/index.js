// Vercel Serverless Function 入口文件
const app = require('../server');

// Vercel 会自动导出这个函数
module.exports = (req, res) => {
  app(req, res);
};
