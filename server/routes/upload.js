const router  = require('koa-router')();

const routers =  router
          .get('/', async (ctx) => {
            ctx.response = '上传文件请求已接受。';
          });

module.exports = routers;
