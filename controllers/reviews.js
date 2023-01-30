// コントローラー作成
const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  //レビュー作成
  const review = new Review(req.body.review);
  //review.authorに、リクエストできたユーザーのIDを代入
  review.author = req.user._id;
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash('success', 'レビューを登録しました');
  res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  //$pullを使うことで、IdのcampgroundからreviewsのreviewIdを引っ張り出すイメージ
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'レビューを削除しました');
  res.redirect(`/campgrounds/${id}`);
}
