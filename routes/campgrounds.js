//ルーティングをまとめ、必要なものをrequireしておく
const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
//ミドルウェア　
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
//コントローラー
const campgrounds = require('../controllers/campgrounds');
//multipart/form-dataを扱うためのミドルウェア ファイルのアップロードを行う目的
const multer = require('multer')
const { storage } = require('../cloudinary');
const upload = multer({ storage });

//ルーティングのグループ化
router.route('/')
  //キャンプ場一覧取得
  .get(catchAsync(campgrounds.index))
  //キャンプ場の新規登録のフォームのリクエスト先
  .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));

//キャンプ場新規登録のフォーム
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
  //キャンプ場詳細ページ
  .get(catchAsync(campgrounds.showCampground))
  //キャンプ場の更新・編集
  .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
  //キャンプ場削除
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

//キャンプ場編集フォーム
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;
