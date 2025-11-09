module.exports = {
  sessionSecret: process.env.SESS_SECRET || '',

  logFile: process.env.LOG_FILE || 'logs/server.log',

  credentials: {
    username: process.env.APP_USER || '',
    password: process.env.APP_PASS || ''
  }
};
