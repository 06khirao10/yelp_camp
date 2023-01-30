//app.js内のasync関数に対してエラー処理を定義するために、関数を受け取るcatchAsync関数を作成する(try catch全部記述は大変)
// func の中にasyncな関数を入れるようにする
// catchで受け取ったエラーをnextに渡してあげる
module.exports = func => {
  return (req, res, next) => {
    func(req, res, next).catch(e => next(e));
  }
}
