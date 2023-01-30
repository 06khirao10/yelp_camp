// コントローラー作成
const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
//地図の設定
// 1:Create a client. 2:Create a request.3:Send the request.
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
// envファイルで設定したものを定義
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken }); //1:Create a client.の部分

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
  res.render('campgrounds/new');
}

module.exports.showCampground = async (req, res) => {
  //reviewの中のauthorをユーザーごとに区別したい mongooseではオブジェクトとして渡す
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: 'reviews',
      populate: {
        path: 'author'
      }
    }).populate('author');
  //キャンプ場がなければフラッシュメッセージと共に、詳細ページへリダイレクト
  if (!campground) {
    req.flash('error', 'キャンプ場は見つかりませんでした。');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/show', { campground });
}

module.exports.createCampground = async (req, res) => {
  const geoDate = await geocoder.forwardGeocode({
    query: req.body.campground.location,
    limit: 1
  }).send();
  //サーバーサイド側で簡単にエラー確認
  const campground = new Campground(req.body.campground);
  //DBに地理情報を登録する 緯度経度を取得
  campground.geometry = geoDate.body.features[0].geometry;
  campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
  //campground.authorに、リクエストできたユーザーのIDを代入
  campground.author = req.user._id;
  await campground.save();
  req.flash('success', '新しいキャンプ場を登録しました');
  res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  //キャンプ場がなければフラッシュメッセージと共に、詳細ページへリダイレクト
  if (!campground) {
    req.flash('error', 'キャンプ場は見つかりませんでした。');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  //スプレット構文にすることでcampgroundの中身全てを更新できるようにする
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  //画像の追加更新
  const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
  campground.images.push(...imgs);
  await campground.save();
  //選択した画像だけ削除したい(mongDB側)
  if (req.body.deleteImages) {
    //cloudinaryからも画像を削除する
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    //$pullで取り除く、何の画像、ファイルネームに$in: req.body.deleteImagesが含まれている画像
    await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
  }
  req.flash('success', '新しいキャンプ場を更新しました');
  res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash('success', 'キャンプ場を削除しました');
  res.redirect('/campgrounds');
}
