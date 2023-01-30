//ログインしているユーザーのみ更新・登録・削除などができるようにミドルウェアで定義
const ExpressError = require('./utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('./schemas');
const Campground = require('./models/campground');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    //元々リクエストした場所を保存しておく(ログイン前の)
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'ログインしてください');
    return res.redirect('/login');
  }
  next();
}

//バリデーションのミドルウェア作成（一回ずつスキーマ定義は面倒）・・・新規登録や更新時のみ
//ミドルウェアでスキーマを使ってvalidateを呼んでいる
module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(detail => detail.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
}

//キャンプ場作成した人しか更新・削除できないようにミドルウェア作成
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  //キャンプ場作成者のみ。更新や削除の権限があるように設定
  //findByIdAndUpdateで見つけて更新の前にまずはIDで確認する
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash('error', 'そのアクションの権限がありません');
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
}

//レビュー削除のミドルウェア作成
// /campgrounds/:id/reviews/:reviewIdになるので、{ id, reviewId } が欲しい
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash('error', 'そのアクションの権限がありません');
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
}

//レビューのバリデーションのミドルウェア作成
//ミドルウェアでスキーマを使ってvalidateを呼んでいる
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(detail => detail.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
}
