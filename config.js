exports.DATABASE_URL = process.env.DATABASE_URL || global.DATABASE_URL || 'mongodb://admin:password1@ds059125.mlab.com:59125/blog-mongoose-challenge';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://admin:password1@ds059125.mlab.com:59125/blog-mongoose-challenge';
exports.PORT = process.env.PORT || 8080;