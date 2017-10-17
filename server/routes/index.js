const router = require('koa-router')();

const home = require('./upload');

router.use('/upload', login.routes(), login.allowedMethods());

module.exports = router;
