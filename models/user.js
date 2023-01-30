const mongoose = require('mongoose');
const { Schema } = mongoose;
//passportLocalMongooseはユーザー名とパスワード勝手についてくる
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  }
});

userSchema.plugin(passportLocalMongoose, {
  errorMessages: {
    UserExistsError: 'そのユーザー名はすでに使われています',
    MissingPasswordError: 'パスワードを入力してください',
    AttemptTooSoonError: 'アカウントがロックされています。時間を空けてログインしてください',
    TooManyAttemptsError: 'ログインの失敗が続いたため、アカウントをロックしました',
    NoSaltValueStoredError: '認証ができませんでした',
    IncorrectPasswordError: 'パスワードもしくはユーザー名が間違っています',
    IncorrectUsernameError: 'パスワードもしくはユーザー名が間違っています',
  }
});

module.exports = mongoose.model('User', userSchema);
