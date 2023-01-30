//キャンプモデル作成
const mongoose = require('mongoose');
const Review = require('./review');
const { Schema } = mongoose;

//画像の大きさを調整する...virtualプロパティ
//サムネイルプロパティがあるかのように設定される
const imageSchema = new Schema({
    url: String,
    filename: String
});
imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

//By default, Mongoose does not include virtuals when you convert a document to JSON
//含まれないからオプション設定する必要がある
const opts = { toJSON: { virtuals: true } };

//スキーマ作成
//リレーションとして今回は親に子の要素を渡すようにする
const campgroundSchema = new Schema({
    title: String,
    images: [imageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],

},opts);

// properties: {
//     popupMarkup
// }
campgroundSchema.virtual('properties.popupMarkup').get(function () {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0,20)}...</p>`;
});

//ミドルウエアの定義
campgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

//モデル作成
module.exports = mongoose.model('Campground', campgroundSchema);
