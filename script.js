//=========================================
// Firebase設定
//=========================================
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, get, push, set, update, remove, onChildAdded, onChildRemoved, onChildChanged } 
from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "*****",
    authDomain: "*****",
    projectId: "*****",
    storageBucket: "*****",
    messagingSenderId: "*****",
    appId: "*****",
    measurementId: "*****"
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app); //RealtimeDBに接続


//=========================================
// Google Map API連携
//=========================================

let map;
let autocomplete;
let currentPlace;  // 現在選択されている場所を保存する変数
// マップ全体で共有する1つのinfoWindowを作成
let infoWindow = new google.maps.InfoWindow();

//関数1:initAutocomplete(オートコンプリートに入力されたデータを取得する)
function initAutocomplete() {
  autocomplete = new google.maps.places.Autocomplete(
    document.getElementById("autocomplete-input"),
    { fields: ["place_id", "name", "formatted_address", "geometry"] }
  );

  autocomplete.addListener("place_changed", () => {
    currentPlace = autocomplete.getPlace(); // 現在の場所情報を保存
    if (!currentPlace.geometry) {
      console.error("No details available for input: '" + currentPlace.name + "'");
      return;
    }
  });
}

//関数2:savePlaceToFirebase(位置情報をコメントとともにFirebaseに送信する)
function savePlaceToFirebase(placeId, name, formattedAddress, lat, lng, newComment) {
  const placeRef = ref(db, 'places/' + placeId);
  
  // Firebaseから既存のコメントを取得
  return get(placeRef).then(snapshot => {  // return を追加してPromiseを返す
    let comments = []; // commentsを空配列として初期化

    if (snapshot.exists()) {
      const placeData = snapshot.val();
      comments = placeData.comments || []; // 既存のコメントがあれば取得、なければ空配列
    }

    comments.push(newComment); // 新しいコメントを追加

    // データを保存してPromiseを返す
    return set(placeRef, {
      placeId: placeId,
      name: name,
      formattedAddress: formattedAddress,
      latitude: lat,
      longitude: lng,
      comments: comments // 更新したコメント配列を保存
    }).then(() => {
      console.log("Comment successfully added to Firebase:", comments);
    }).catch((error) => {
      console.error("Error saving comment:", error);
    });
    
  }).catch((error) => {
    console.error("Error retrieving place data:", error);
  });
}



//関数3:handleSaveButtonClick(SaveボタンをクリックしたときにFirebaseにデータを送信する)
function handleSaveButtonClick() {
  if (!currentPlace) {
    console.error("No place selected.");
    return;
  }

  savePlaceToFirebase(
    currentPlace.place_id,
    currentPlace.name,
    currentPlace.formatted_address,
    currentPlace.geometry.location.lat(),
    currentPlace.geometry.location.lng(),
    $("#comment-input").val() // コメントを引数として渡す
  );

  initMap();
  $("#comment-input").val("");
}

//関数4:loadPlacesFromFirebase(位置情報をFirebaseから受信する)
async function loadPlacesFromFirebase() {
  const placesRef = ref(db, 'places'); // RealtimeDB内の"places"を参照
  const snapshot = await get(placesRef);
  const places = [];
  if (snapshot.exists()) {
    snapshot.forEach((childSnapshot) => {
      places.push(childSnapshot.val());
    });
  }
  console.log("Loaded places:", places); // デバッグ用のログ
  return places;
}


//関数5:initMap(受信したデータをマッピングする)
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 49.252474, lng: -123.073432 },  // デフォルトの中心
    zoom: 12,
  });

  // Firebaseからデータを取得しマーカーを配置
  loadPlacesFromFirebase().then((places) => {
    places.forEach((place) => {
      const comments = Array.isArray(place.comments) ? place.comments : []; // コメントを配列として取得
      
      const marker = new google.maps.Marker({
        position: { lat: place.latitude, lng: place.longitude },
        map: map,
      });

      // infoWindowの内容にplaceIdを含め、textareaのIDを一意にする
      marker.addListener("click", () => {
        const infoWindowContent = `
          <div>
            <strong>${place.name}</strong>
            <br>${comments.join('<br>')} <!-- コメントを表示 -->
            <br>
            <textarea id="add-comment-${place.placeId}" placeholder="追加コメントを記入"></textarea> <!-- textareaのIDにplaceIdを追加 -->
            <br>
            <button class="add-comment" data-place-id="${place.placeId}">送信</button> <!-- ボタンにplaceIdをデータ属性として追加 -->
          </div>`;

        // 既存のinfoWindowに新しい内容を設定して開く
        infoWindow.setContent(infoWindowContent);
        infoWindow.open(map, marker);
      });
    });

    // マップ上の「add-comment」ボタンのイベントリスナーを追加
    $(document).on('click', '.add-comment', function() {
      const placeId = $(this).data('place-id'); // ボタンからplaceIdを取得
      const comment = $(`#add-comment-${placeId}`).val(); // textareaの内容を取得

      if (comment.trim() !== '') { // 空でないコメントのみ保存
        // 現在の場所の情報を取得する必要がある
        loadPlacesFromFirebase().then((places) => {
          const place = places.find(p => p.placeId === placeId); // placeIdに基づいて場所を検索
          if (place) {
            savePlaceToFirebase(
              placeId,
              place.name,
              place.formattedAddress,
              place.latitude,
              place.longitude,
              comment
            ).then(() => {
              // コメントをFirebaseに保存した後、infoWindowの内容を再更新する
              const updatedComments = [...place.comments, comment]; // 新しいコメントを追加
              const updatedContent = `
                <div>
                  <strong>${place.name}</strong>
                  <br>${updatedComments.join('<br>')} <!-- 更新したコメントを表示 -->
                  <br>
                  <textarea id="add-comment-${placeId}" placeholder="追加コメントを記入"></textarea>
                  <br>
                  <button class="add-comment" data-place-id="${placeId}">送信</button>
                </div>`;

              // infoWindowの内容を更新して再表示
              infoWindow.setContent(updatedContent);
              infoWindow.open(map, marker);

              // コメント送信後にtextareaをクリア
              $(`#add-comment-${placeId}`).val('');
            });
          } else {
            console.error("Place not found for ID:", placeId);
          }
        });
      } else {
        console.error("Comment cannot be empty");
      }
    });
  });
}



$("#save-button").on("click", function(){
  handleSaveButtonClick();
});

// jQueryでDOMが完全に読み込まれた後にinitAutocompleteとinitMapを実行
$(document).ready(function() {
  initAutocomplete();
  initMap();
});

$("#save-button").on("click", function(){
  handleSaveButtonClick();
});

// jQueryでDOMが完全に読み込まれた後にinitAutocompleteとinitMapを実行
$(document).ready(function() {
  initAutocomplete();
  initMap();
});
