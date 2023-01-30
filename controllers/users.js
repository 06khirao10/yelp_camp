// コントローラー作成
const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
  res.render('users/register');
}

module.exports.register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err => {
      if (err) return next(err);
      req.flash('success', 'Yelp Campへようこそ!!');
      res.redirect('/campgrounds');
    })
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/register');
  }
}
module.exports.renderLogin = (req, res) => {
  res.render('users/login');
}

module.exports.login = (req, res) => {
  req.flash('success', 'おかえりなさい');
  const redirectUrl = req.session.returnTo || '/campgrounds';
  delete req.session.returnTo;
  res.redirect(redirectUrl);
}

//req.logout()だけではコールバックがないとエラーになる・・・バージョンの問題
//https://stackoverflow.com/questions/72336177/error-reqlogout-requires-a-callback-function 参照
module.exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    req.flash('success', 'ログアウトしました');
    res.redirect('/campgrounds');
  });
}
