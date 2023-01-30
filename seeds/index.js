//seed用のindexファイル
const mongoose = require('mongoose');
//都道府県
const cities = require('./cities');
//キャンプ場の名前
const { descriptors, places } = require('./seedHelpers');
//モデルを使用してキャンプグランドを作成
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp',
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => {
        console.log('MongoDBコネクションOK！！');
    })
    .catch(err => {
        console.log('MongoDBコネクションエラー！！！');
        console.log(err);
    });

//キャンプ場の名称をランダムに配列の数分取得する
const sample = array => array[Math.floor(Math.random() * array.length)];

//古いデータを削除し、新しいデータをループで挿入していく
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const randomCityIndex = Math.floor(Math.random() * cities.length);
        const price = Math.floor(Math.random() * 2000) + 1000;
        const camp = new Campground({
            author: '637dace69babff58d1189a67',
            //○○県○○市のような表記になるように
            location: `${cities[randomCityIndex].prefecture}${cities[randomCityIndex].city} `,
            //キャンプ場名称作成
            title: `${sample(descriptors)}・${sample(places)}`,
            //画像の設定
            description: '木曾路はすべて山の中である。あるところは岨づたいに行く崖の道であり、あるところは数十間の深さに臨む木曾川の岸であり、あるところは山の尾をめぐる谷の入り口である。一筋の街道はこの深い森林地帯を貫いていた。東ざかいの桜沢から、西の十曲峠まで、木曾十一宿はこの街道に添うて、二十二里余にわたる長い谿谷の間に散在していた。道路の位置も幾たびか改まったもので、古道はいつのまにか深い山間に埋もれた。',
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[randomCityIndex].longitude,
                    cities[randomCityIndex].latitude
                ]
            },
            price,
            images: [
                {
                    url: 'https://res.cloudinary.com/dd55haovr/image/upload/v1671716086/YelpCamp/blggd81afvdvsf25epez.jpg',
                    filename: 'YelpCamp/blggd81afvdvsf25epez'
                }
            ]
        });
        await camp.save();
    }
}

//コネクションを閉じるようにする
seedDB().then(() => {
    mongoose.connection.close();
});
