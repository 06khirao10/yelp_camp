//NODE_ENVという環境変数　node.jsがどのような環境で動いているかを確認する変数
//本番環境ではなく、開発環境では'dotenv'を使って行うの意味(.env)
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
};

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
//ejsでレイアウトを使うツール
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
//method-overrideの宣言　インストール：npm i method-override
const methodOverride = require('method-override');
//エラー関数を使えるようにする
const ExpressError = require('./utils/ExpressError');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');
//MongoDBインジェクション
const mongoSanitize = require('express-mongo-sanitize');

//各々のルーター定義
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
// const dbUrl = process.env.DB_URL;dbUrl
//'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(() => {
        console.log('MongoDBコネクションOK！！');
    })
    .catch(err => {
        console.log('MongoDBコネクションエラー！！！');
        console.log(err);
    });

const app = express();

app.engine('ejs', ejsMate);
//viewディレクトリのパスをセット
//ejsというテンプレートエンジンを使えるように設定,これを使うとhtmlのなかで変数やfor文を使えるようになる
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//リクエストはpostかgetのみなのでPUT, DELETEを使えるようにオーバーライドしておく
app.use(methodOverride('_method'))
//フォームからデータを受け取れるようにする
app.use(express.urlencoded({ extended: true }));
//自分のサーバーから、javascriptやcssを提供できるようにする
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_',
}));

const secret = process.env.SECRET || 'mysecret';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret
    },
    touchAfter: 24 * 3600
});
store.on('error', e => {
    console.log('セッションストアーエラ〜', e);
})

//express-sessionのドキュメントにある
const sessionConfig = {
    store,
    name:'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure:true,
        //cookieの有効期限 下記は1週間
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));
//passportの設定　
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate())); //どのように認証するか
passport.serializeUser(User.serializeUser());         //ユーザー情報をsessionに入れる
passport.deserializeUser(User.deserializeUser());     //ユーザー情報をsessionから取り出す

app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    'https://api.mapbox.com',
    'https://cdn.jsdelivr.net'
];
const styleSrcUrls = [
    'https://api.mapbox.com',
    'https://cdn.jsdelivr.net'
];
const connectSrcUrls = [
    'https://api.mapbox.com',
    'https://*.tiles.mapbox.com',
    'https://events.mapbox.com'
];
const fontSrcUrls = [];
const imgSrcUrls = [
    `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
    'https://images.unsplash.com'
];

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        childSrc: ["blob:"],
        objectSrc: [],
        imgSrc: ["'self'", 'blob:', 'data:', ...imgSrcUrls],
        fontSrc: ["'self'", ...fontSrcUrls]
    }
}));

app.use((req, res, next) => {
    //ログインしている時としていない時で、ナビバーの表示を変えるようにする navbar.ejs へ
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/', (req, res) => {
    res.render('home');
})

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
//このままの定義では下記idはルーターでは使えない、expressの仕様になっている
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.all('*', (req, res, next) => {
    next(new ExpressError('ページが見つかりません', 404));
})

//エラーハンドリング
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = '問題が発生しました';
    }
    res.status(statusCode).render('error', { err });
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`ポート${port}で待機中`);
});
