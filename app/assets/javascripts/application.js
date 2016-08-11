// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require turbolinks
//= require_tree .

//--------------------------------------------------
//変数群
//--------------------------------------------------

var gList = null;           //DBデータ格納
var gLyric = new Array();   //各歌詞の情報格納

var gRankingList = gon.rank;

//歌詞表示領域に関する情報
var gAreaInfo = new lyricAreaInfo();
function lyricAreaInfo(){
  this.max_width  = 0;
  this.max_height = 0;
  this.lyric_max_width = 500;
  this.margin_x = 20;
  this.margin_y = 10;

  this.now = 0;
}

//歌詞情報
function lyricObj(){
  //曲情報
  this.lyric  = "";   //歌詞
  this.title  = "";
  this.artist = "";
  this.genre  = "";
  this.point  = 0;

  //CSS情報
  this.over   = "";
  this.size   = 0;    //文字サイズ
  this.left   = 0;    //Y座標
  this.top    = 0;    //X座標
  this.width  = 0;    //幅
  this.height = 0;    //高さ
  this.color  = "";   //色
}

//詳細ボックス情報
var gBoxInfo = new box();
function box(){
  this.width  = 0;
  this.height = 0;
}

//歌詞配置情報
var gLocate = new Array();

//--------------------------------------------------



//ページ読み込み完了時
$(window).on("load" , init);



//--------------------------------------------------
//初期処理
//--------------------------------------------------

//初期処理
function init(event){

  $(".lyric").remove();

  gList  = null;          //初期化
  gLyric = new Array();   //初期化
  gLocate = new Array();  //初期化

  var w = $(".lyricArea").css("width");   //CSSより、歌詞表示エリアの幅を取得
  var h = $(".lyricArea").css("height");  //CSSより、歌詞表示エリアの高さを取得

  //ランダム配置を行うため、配置可能な座標の最大値を格納
  gAreaInfo.max_width  = Number(w.substring(0,w.indexOf("px")));
  gAreaInfo.max_height = Number(h.substring(0,h.indexOf("px")));

  var b_w = $(".detailBox").css("width");   //CSSより、歌詞表示エリアの幅を取得
  var b_h = $(".detailBox").css("height");  //CSSより、歌詞表示エリアの高さを取得
  gBoxInfo.width  = Number(b_w.substring(0,b_w.indexOf("px")));
  gBoxInfo.height = Number(b_h.substring(0,b_h.indexOf("px")));

  getLyric();     //DBのデータ取得、歌詞のCSSプロパティを設定
  drawLyric();    //歌詞を配置

  //イベント登録
  $(".lyric").hover(focusOn , focusOut);                //フォーカスオン,フォーカスアウトイベント
  $(".lyric").on("click" , showDetailBox);              //歌詞クリック（楽曲詳細ボックスオープン）
  $(".detailClose").on("click" , closeDetailBox);       //楽曲詳細ボックスクローズ
  $(".rankingClose").on("click" , closeRanking);       //楽曲詳細ボックスクローズ


  $(".lyricArea:not(.lyric)").on("click" , clickTest);  //
}

function clickTest(){

}

//DBデータ取得、CSSプロパティ付与
function getLyric(){
  gList = gon.list;   //gem「gon」を用いて、Railsで取得したDBデータを参照
  var fontSize = new Array(14,16,18);   //取りうるフォントサイズ

  for(var i=0;i<gList.length;i++){
    if(gAreaInfo.now >= gList.length) gAreaInfo.now = 0;
    if(i >= 30) break;
    var key = "ly" + i;  //キー名
    gLyric[key] = new lyricObj();     //連想配列で管理

    gLyric[key].lyric  = gList[gAreaInfo.now]["lyric"];   //歌詞
    gLyric[key].title  = (gList[gAreaInfo.now]["title"]  != "")?    gList[gAreaInfo.now]["title"]  : "no title";    //タイトル
    gLyric[key].artist = (gList[gAreaInfo.now]["artist"] != "")?    gList[gAreaInfo.now]["artist"] : "no artist";  //アーティスト
    gLyric[key].genre  = (gList[gAreaInfo.now]["genre"]  != "")?    gList[gAreaInfo.now]["genre"]  : "no genre";    //ジャンル
    gLyric[key].point  = (gList[gAreaInfo.now]["points"] != null)?  gList[gAreaInfo.now]["points"] : 0;            //ポイント

    var size = fontSize[Math.floor(Math.random()*fontSize.length)];   //文字サイズをランダムで決定
    gLyric[key].size   = size;  //フォントサイズを指定
    widthCount(key);   //文字のバイト数より幅を指定

    gLyric[key].height = size + 4;  //高さを指定

    var col = "";
    switch(gList[gAreaInfo.now]["sex"]){
                                          //性別：未入力
                                          case null:
                                            col = "#A9A9A9";
                                            break;
                                          //性別：man
                                          case 0:
                                            col = "#bcddff";
                                            break;
                                          //性別：woman
                                          case 1:
                                            col = "#ffbcdd";
                                            break;
                                          //性別：other
                                          case 2:
                                            col = "#ddbcff";
                                            break;
                                          //default
                                          default:
                                            col = "#A9A9A9";
                                            break;
                                        }
    gLyric[key].color = col;  //文字色を指定

    lyricPosition(key);   //歌詞の表示位置を決定

    gAreaInfo.now++;
  }
}

//バイト数より文字幅を決定
function  widthCount(key){
  var cnt   = 0;
  var width = 0;
  var str   = gLyric[key].lyric;
  var size  = gLyric[key].size;
  for(var i=0;i<str.length;i++){
    var c = str.charCodeAt(i);
    // Shift_JIS: 0x0 ～ 0x80, 0xa0 , 0xa1 ～ 0xdf , 0xfd ～ 0xff
    // Unicode : 0x0 ～ 0x80, 0xf8f0, 0xff61 ～ 0xff9f, 0xf8f1 ～ 0xf8f3
    if ((c >= 0x0 && c < 0x81) || (c == 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)){
      width += size/2;
    }else{
      width += size;
    }
    if(width + (size + (size/2)) >= gAreaInfo.lyric_max_width){
      gLyric[key].over  = str;
      gLyric[key].lyric = str.substring(0,cnt) + "...";
      width = gAreaInfo.lyric_max_width;
      break;
    }
    cnt++;
  }
  gLyric[key].width = strWidth(key);   //文字のバイト数より幅を指定
//  console.log(gLyric[key].width);
}


//表示位置決定処理
function lyricPosition(key){

  var retry = 0;
  while(1){
    var overlapFlg = true;
    gLyric[key].left = Math.floor(Math.random() * (gAreaInfo.max_width - gLyric[key].width));     //X座標
    gLyric[key].top  = Math.floor(Math.random() * (gAreaInfo.max_height - gLyric[key].height));   //Y座標
    if(gLocate.length == 0) overlapFlg = false;
    for(var i=0;i<gLocate.length;i++){

      var a = gLyric[key].left;
      var b = gLyric[key].top;
      var c = gLyric[key].left + gLyric[key].width + gAreaInfo.margin_x;
      var d = gLyric[key].top + gLyric[key].height + gAreaInfo.margin_y;

      //重なり判定（gLocate：既に置かれている場所、a~d：置こうとしている場所）
      if(gLocate[i][0] <= c && a <= gLocate[i][2] && gLocate[i][1] <= d && b <= gLocate[i][3]){
        overlapFlg = true;
        break;
      }else{
        overlapFlg = false;
      }
    }

    //重なりチェックはマックス200回繰り返す
    if(overlapFlg == false || retry >= 200){
      gLocate[gLocate.length] = new Array(
                                            gLyric[key].left,
                                            gLyric[key].top,
                                            gLyric[key].left + gLyric[key].width + gAreaInfo.margin_x,
                                            gLyric[key].top + gLyric[key].height + gAreaInfo.margin_y
                                          );
      break;
    }
    retry++;
  }
}

//描画処理
function drawLyric(){
  for(var name in gLyric){
    $(".lyricArea").append("<div id=\"" + name + "\" class=\"lyric font\"><div id=\"" + name + "_t\" style=\"left:0px;\">" + gLyric[name].lyric + "</div></div>");
    $("#" + name).css({
                        "font-size" : gLyric[name].size   + "px",
                        "left"      : gLyric[name].left   + "px",
                        "top"       : gLyric[name].top    + "px",
                        "height"    : gLyric[name].height + "px",
                        "color"     : gLyric[name].color
                      });
  }
  $(".lyricArea").fadeIn("slow");
}

//--------------------------------------------------





//--------------------------------------------------
//楽曲詳細ボックス
//--------------------------------------------------

//楽曲詳細ボックスを表示
function showDetailBox(){
  if($("#dBox").css("display") != "none") $("#dBox").hide();  //既に表示中の場合はいったん非表示

  var key = $(this).attr("id");
  $(".lyric:not(#" + key + ")").stop().animate({opacity:0.3},{duration:100,queue:false});
  $("#" + key).stop().animate({opacity:1.0},{duration:300,queue:false});

  setDetailBox(key);  //詳細ボックスに情報セット
  $("#dBox").fadeIn("fast");
}

//楽曲詳細ボックスに情報をセット
function setDetailBox(key){
  var item_w = $("#" + key).css("width");
  var item_h = $("#" + key).css("height");
  $("#dBox").css({
                    "left":gLyric[key].left + Number(item_w.substring(0,item_w.indexOf("px"))) + "px",
                    "top" :gLyric[key].top  + Number(item_h.substring(0,item_h.indexOf("px"))) + "px"
                  });

  $(".detail_lyric div").text(gLyric[key].lyric);

  $("#dBox #title" ).text(gLyric[key].title);   //タイトル
  $("#dBox #artist").text(gLyric[key].artist);  //アーティスト
  $("#dBox #point" ).text(gLyric[key].point);   //ポイント
}

//楽曲詳細ボックスを非表示
function closeDetailBox(){
  $("#dBox").fadeOut("fast");
  $(".lyric").stop().animate({opacity:1.0},{duration:100,queue:false});
}

//--------------------------------------------------



//フォーカスオン処理
function focusOn(event){
  if($("#dBox").css("display") != "none") return;   //詳細表示中はreturn
  var key = this.id;
  $(".lyric:not(#" + key + ")").stop().animate({
                                                  opacity:0.3
                                                },
                                                {
                                                  duration:300,
                                                  complete:completeAct(key)
                                                });
}

//フォーカスアウト処理
function focusOut(event){
  if($("#dBox").css("display") != "none") return;   //詳細表示中はreturn
  var key = this.id;
  $(".lyric:not(#" + key + ")").stop().animate({
                                                  opacity:1.0
                                                },
                                                {
                                                  duration:100,
                                                });
}

function addLyric(){
}

//アニメーション完了後処理
function completeAct(key){
}


function marquee(key , str){
}


//ランキング表示
function showRanking(){
  if($(".rankingArea").css("display") != "none") return;
  $(".rankNum , .rank").remove();
  var max = 20;   //上位10位まで
  var cnt = 0;
  for(var name in gRankingList){
    $(".rankingArea ul").append("<li class=\"rankNum\">" + (cnt+1)+ ".</li><li class=\"rank\">" + gRankingList[name]["title"] + "</li>");
    cnt++;
    if(cnt >= max) break;
  }
  $(".lyricArea").fadeOut("fast");
  $(".rankingArea").fadeIn("fast");
}

function closeRanking(){
  $(".rankingArea").fadeOut("fast");
  $(".lyricArea").fadeIn("fast");
}

//歌詞エリアリフレッシュ
function nextLyric(){
//  init();
  //イベント削除
  $(".lyric").off();                //フォーカスオン,フォーカスアウトイベント
  $(".detailClose").off();       //楽曲詳細ボックスクローズ
  $("#dBox").fadeOut("fast");
  $(".lyricArea").fadeOut("slow",init);
}


var gTimerID = NaN;

var gCnt = 0;
function count(){
  if(!isNaN(gTimerID)){
    clearInterval(gTimerID);
    gTimerID = NaN;
  }
  gCnt++;
  if(gCnt >= 5){
    gCnt = 0;
    nextLyric();
  }
  gTimerID = setInterval("count();",1000,0);
}



function strWidth(key) {
  $("#ruler").css("font-size" , gLyric[key].size + "px");


  var e = $("#ruler");
  var width = e.text(gLyric[key].lyric).get(0).offsetWidth;
  e.empty();
  return width;
}