var express = require('express');
var router = express.Router();
const mongoose = require('mongoose')
const auth = require('../auth')

/* GET home page. */
router.get('/', function(req, res, next) {
  const user = auth.getUser(req)
  if (user) return res.render('index', { logout: true });
  else return res.render('index', { register: true, login: true });
});

router.post('/register', async function(req, res, next) {
  await mongoose.model('User').create(req.body)
  res.render('index', { login: true, register: false });
});

router.post('/login', async function(req, res, next) {
  const [user] = await mongoose.model('User').find({email: req.body.email, password: req.body.password})
  if (!user) {
    return res.render('index', { login: true, register: false });
  }
  auth.authorize(user.id, res)
  res.redirect('/projects?leader=true&archive=false');
});

router.get('/logout', async function(req, res, next) {
  auth.logout(req, res)
  res.redirect('/');
});

module.exports = router;
