const Koa = require('koa');
const path = require('path');
const convert = require('koa-convert');
const KoaLogger = require('koa-logger');
const bodyParse = require('koa-bodyparser');
const app = new Koa();
const routers = require('./routes/index');

app.use(convert(KoaLogger()));

app.use(bodyParse());

app
  .use(routers.routes())
  .use(routers.allowedMethods());

app.listen(3000, () => {
  console.log('This server is port 3000...');
});
