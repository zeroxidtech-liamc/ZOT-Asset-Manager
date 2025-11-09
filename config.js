module.exports = {
  sessionSecret: process.env.SESS_SECRET || 'supersecreenv_zeroxid_googoggoo',

  logFile: process.env.LOG_FILE || 'logs/server.log',

  credentials: {
    username: process.env.APP_USER || 'liam.carter@zeroxid.eus',
    password: process.env.APP_PASS || 'l1@mc@rt3r2025!'
  }
};
