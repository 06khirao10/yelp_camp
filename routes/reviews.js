//ルーティングをまとめ、必要なものをrequireしておく
const express = require('express');
//レビューに関しては親のidを子でも使えるようにマージしてと、{mergeParams: true} をルーターのところにオプションとして渡す必要がある
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');
//コントローラー
const reviews = require('../controllers/reviews');

//レビューの登録、リクエスト先
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

//レビュー削除
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
