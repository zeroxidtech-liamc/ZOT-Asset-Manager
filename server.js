const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: 'zig2023', resave: false, saveUninitialized: true }));

app.use('/static', express.static(path.join(__dirname, 'templates')));

app.get('/', (_, res) => res.sendFile(path.join(__dirname, 'templates/login.html')));
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === USER && password === PASS) {
    req.session.logged = true;
    return res.redirect('/dashboard');
  }
  res.redirect('/?err=1');
});

app.get('/dashboard', (req, res) => {
  if (!req.session.logged) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'templates/dashboard.html'));
});

app.listen(PORT, () => console.log(`[+] ZIG Asset Manager on http://localhost:${PORT}`));
