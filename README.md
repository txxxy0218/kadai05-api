# ①課題番号-プロダクト名

世界の危険情報集約マップ

## ②課題内容（どんな作品か）

- Google Map API, Place API, Geometry APIを使って、危険エリアの入力を補助し、コメントともに保存できるアプリ
- 保存された情報はマップ上のピンで確認できる

## ③DEMO

https://txxxy0218.github.io/kadai05-api/
※API Key保護のためローカル環境でのみ動作確認済み

## ④作ったアプリケーション用のIDまたはPasswordがある場合

- ID: なし
- PW: なし

## ⑤工夫した点・こだわった点

- 危険エリアを簡単に入力できるようにPlace APIで入力補完させた
- 集約された情報はマップ上でピンが立つので場所がわかりやすい
- 既にあるエリアの情報にコメントを足すこともできるようにした

## ⑥難しかった点・次回トライしたいこと(又は機能)

- ログイン機能の実装と、コメント者のデータ取得・表示
- コメントした人だけがコメントの削除と編集を行える機能
- 危険情報以外に宿えらびに役立つ情報を別の色のピンなどで集約する

## ⑦次回ミニ講義で聞きたいこと

- APIの勉強の仕方について（API関連のドキュメントの読み方がわからず大変苦労しました、、）
- ChatGPIとの付き合い方について（今回はコード自体はかなりGPT様に助けていただきました）
- apiでできることとできないことをどのように調べればよいか？

## ⑧フリー項目（感想、シェアしたいこと等なんでも）

- [感想]
  - 今までで一番自分でコードを書くのが難しく、手が止まってはChatGPTに聞き、ドキュメントを調べ（難解すぎてわからず）、の繰り返しでした
  - やりたことはたくさんあるのに半分くらいしか実装できず悔しかったです😭
- [参考記事]
  - 1. Place Autocompleteのサンプルコード：(https://developers.google.com/maps/documentation/javascript/examples/place-autocomplete-map?_gl=1*wygkdm*_up*MQ..*_ga*NDgxNTE2NjY1LjE3MjU1NjYxODE.*_ga_NRWSTWS78N*MTcyNTU2NjE4MC4xLjAuMTcyNTU2NjE4MC4wLjAuMA..#maps_place_autocomplete_map-html)
