const express       = require('express');
const path          = require('path');
const session       = require('express-session');
const fs            = require('fs');
const RateLimit     = require('express-rate-limit');

const app           = express();
const PORT          = process.env.PORT || 3000;
const config        = require('./config');

// ----------  MIDDLEWARES  ----------
if (!fs.existsSync('logs')) fs.mkdirSync('logs');
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: config.sessionSecret, resave: false, saveUninitialized: true }));
app.use('/static', express.static(path.join(__dirname, 'templates')));

// Rate-limit login
const loginLimiter = RateLimit({ windowMs: 5 * 60 * 1000, max: 10, message: 'Too many attempts' });
app.use('/login', loginLimiter);

// Logger simple
app.use((req, res, next) => {
  const line = `[${new Date().toISOString()}] ${req.method} ${req.url} ${req.ip}\n`;
  fs.appendFileSync(config.logFile, line);
  next();
});

let ASSETS = [
  { id: 'PLC-01', type: 'PLC', location: 'Línea 1', status: 'OK' },
  { id: 'HMI-20', type: 'SCADA',     location: 'Control', status: 'OK' },
  { id: 'VSD-07', type: 'Variador',        location: 'Motor-3', status: 'OK' }
];

// ----------  RUTAS  ----------
app.get('/', (_, res) => res.sendFile(path.join(__dirname, 'templates/login.html')));

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Verificar contra credenciales en config.js
  if (username === config.credentials.username && password === config.credentials.password) {
    req.session.logged = true;
    return res.redirect('/dashboard');
  }
  res.redirect('/?err=1');
});

app.get('/dashboard', (req, res) => {
  if (!req.session.logged) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'templates/dashboard.html'));
});

// API REST assets
app.get('/api/assets', (req, res) => {
  if (!req.session.logged) return res.status(401).json({ error: 'Unauthorized' });
  res.json(ASSETS);
});

app.post('/api/assets', (req, res) => {
  if (!req.session.logged) return res.status(401).json({ error: 'Unauthorized' });
  const { id, type, location, status } = req.body;
  if (!id || !type) return res.status(400).json({ error: 'Missing fields' });
  ASSETS.push({ id, type, location, status });
  res.json({ message: 'Asset added' });
});

// Descarga de logs
app.get('/logs', (req, res) => {
  if (!req.session.logged) return res.redirect('/');
  res.download(LOG_FILE);
});

// Mini-console (solo comandos whitelist)
const COMMANDS = {
  help:    () => 'Available: help, date, plc, wifi',
  date:    () => new Date().toISOString(),
  plc:     () => 'P2',
  wifi:    () => 'ZerOxid_Internal'
};
app.get('/console', (req, res) => {
  if (!req.session.logged) return res.status(401).send('Unauthorized');
  const cmd = req.query.cmd;
  if (!cmd) return res.send('ZIG console – use ?cmd=COMMAND');
  if (!COMMANDS[cmd]) return res.send('Unknown command');
  res.send(COMMANDS[cmd]());
});

// ----------  START  ----------
app.listen(PORT, () => console.log(`[+] ZIG Asset Manager on http://localhost:${PORT}`));
