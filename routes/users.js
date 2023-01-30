const express = require('express');
const router = express.Router();
const passport = require('passport');
const users = require('../controllers/users');

router.route('/register')
  //ユーザーフォーム画面
  .get(users.renderRegister)
  //ユーザー登録、リクエスト
  .post(users.register);

router.route('/login')
  //ログインフォーム
  .get(users.renderLogin)
  //ログイン、リクエスト
  .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);

//ログアウト
router.get('/logout', users.logout);

module.exports = router;
