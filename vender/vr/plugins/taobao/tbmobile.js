function krpanoplugin()
{
  var local = this;

  var krpano = null;
  var plugin = null;

  var oWrap = null;
  var oPanel = null;
  var oDescription;
  var carouselDiv = null;
  var iconPath = '';
  var contentData;
  var isShowOriginalImg = true
  var isCloseOriginalImg = true
  var audioWrap, iconWrap, audioImg, oSymbol;
  var sImgPrev = document.createElement('div');
  var sImgNext = document.createElement('div');
  var mc;
  var btnWrap = document.createElement('div'),
      priceBar = document.createElement('div'),
      oCollectBox = document.createElement('span');
  var oBtnFav;
  var currentProductId;
  var audioIsPlayed = false;


  local.registerplugin = function(krpanointerface, pluginpath, pluginobject)
  {
    krpano = krpanointerface;
    plugin = pluginobject;

    krpano.trace(1, 'welcome to tb mobile content');

    iconPath = plugin.icon_path || '';

    var stageWidth = krpano.get('stagewidth');
    var stageHeight = krpano.get('stageheight');

    loadjs([
      sp.config.origin + '/vender/vr/plugins/swiper/idangerous.swiper.css',
      sp.config.origin + '/vender/vr/plugins/swiper/idangerous.swiper.min.js',
      sp.config.origin + '/vender/vr/plugins/Zoomage.js',
      sp.config.origin + '/vender/vr/plugins/swiper/idangerous.swiper.3dflow.css',
      sp.config.origin + '/vender/vr/plugins/swiper/idangerous.swiper.3dflow.js'
    ], {
      async: false,
      success: function(){
        oWrap = document.createElement('div');
        oWrap.className = 'krpano-taobao';

        if(stageWidth <= 320) {
          oWrap.style.width = stageWidth * 0.8 + 'px';
          oWrap.style.marginLeft = -1 * (stageWidth * 0.8) / 2 + 'px'
        }

        var oBtnClose = document.createElement('img');
        oBtnClose.className = 'btn-close';
        oBtnClose.src = iconPath + 'close.png';
        oBtnClose.addEventListener('click', close);
        oBtnClose.addEventListener('touchend', close);
        oWrap.appendChild(oBtnClose);

        oPanel = document.createElement('div');
        oPanel.className = 'panel';
        oWrap.appendChild(oPanel);

        carouselDiv = document.createElement('div');
        carouselDiv.className = 'carousel';

        audioWrap = document.createElement('span');
        audioWrap.className = 'audio-wrap alone';

        priceBar = document.createElement('div');
        priceBar.className = 'pricebar';

        iconWrap = document.createElement('div');
        iconWrap.className = 'icon-wrap';

        oSymbol = document.createElement('span');
        oSymbol.className = 'symbol';

        oCollectBox.className = 'fav-wrap';

        oSymbol.innerHTML = '¥';

        priceBar.appendChild(oSymbol);

        oPrice = document.createElement('span');

        iconWrap.appendChild(audioWrap);
        iconWrap.appendChild(oCollectBox);


        priceBar.appendChild(oPrice);
        priceBar.appendChild(iconWrap);
        oPanel.appendChild(priceBar);

        tips = document.createElement('div');
        tips.className = 'tips';

        tips.addEventListener('touchstart', touchStartDescription)
        tips.addEventListener('touchmove', touchMoveDescription)

        oPanel.appendChild(tips);

        btnWrap = document.createElement('div');
        btnWrap.className = 'btn-wrap';
        oWrap.appendChild(btnWrap);

        plugin.loadtbcontent = loadContent;
        plugin.sprite.appendChild(oWrap);
        plugin.align = 'center'
      }
    });


  }

  function loadContent(dataName) {
    var stageWidth = krpano.get('stagewidth')

    if(dataName) {
      contentData = krpano.get('data[' + dataName + ']');
      contentData = JSON.parse(contentData.content);
    }

    if(!contentData) {
      return;
    }
    var oBtnCart = document.createElement('div');
    var oBtnBuy = document.createElement('div');
    oBtnFav = document.createElement('img');
    var linkEl = document.createElement('div');
    linkEl.className = 'krpano-taobao-link';
    linkEl.innerHTML = '立即购买';

    oBtnCart.className = 'btn-style addcarbtn';
    oBtnBuy.className = 'btn-style buybtn';
    oBtnFav.className = 'btn-fav';
    oBtnFav.src = iconPath + 'btn_collection.png';
    oBtnFav.style.display = 'none';

    oBtnBuy.innerHTML = '立即购买';
    oBtnCart.innerHTML = '加入购物车';
    btnWrap.innerHTML = '';
    oCollectBox.innerHTML = '';
    btnWrap.appendChild(oBtnCart);
    btnWrap.appendChild(oBtnBuy);
    oCollectBox.appendChild(oBtnFav);

    currentProductId = contentData.productId;
    currentLink = contentData.link;
    // 淘宝JSSDK存在的情况下，绑定购物车事件
    // 加入购物车
    oBtnCart.addEventListener('touchend', addShoppingCart.bind(this, '', currentProductId, contentData.skuId));

    // 立即购买
    oBtnBuy.addEventListener('touchend', buyRightNow.bind(this, currentProductId));

    // 添加收藏事件
    oBtnFav.addEventListener('touchend', toggleCollect);

    // 添加浏览器跳转事件
    linkEl.addEventListener('touchend', openWindow);

    if(window.Tida){
      Tida.ready({
      }, function(){
        setTimeout(function(){
          oWrap.style.display = 'block';
        }, 100);
        if(Tida.appinfo.isTmall || Tida.appinfo.isTaobao){
          if(Tida.appinfo.isTaobao){
            oBtnFav.style.display = 'block';
          }
          Tida.isLogin(function(e){
            if(e.isLogin == 'true'){
              Tida.itemFavor({
                itemId: currentProductId,
                action: 'check'
              },function(data){
                if(data.data.isFav == 'true'){
                  oBtnFav.src = iconPath + 'btn_collected.png';
                  oBtnFav.style.display = 'block';
                }
              });
            }
          });
        }else{
          // 非taobao/Tmall中
          btnWrap.innerHTML = '';
          btnWrap.appendChild(linkEl);
        }
      })
    }

    var imageList = contentData.image
    var oSwipe = document.createElement('div')
    oSwipe.setAttribute('class', 'swiper-container taobao-swiper-container')
    var oSwipeWrap = document.createElement('div')
    oSwipeWrap.setAttribute('class', 'swiper-wrapper')
    oSwipe.appendChild(oSwipeWrap)

    var styleEl = document.createElement('style')
    var styleText = '.swiper-slide{opacity: 0.6;} .swiper-slide.swiper-slide-active{opacity: 1;}'
    styleEl.type = 'text/css'
    if(styleEl.styleSheet){         //ie下
      styleEl.styleSheet.cssText = styleText;
    } else {
      styleEl.innerHTML = styleText;
    }
    document.getElementsByTagName('head')[0].appendChild(styleEl);

    if (imageList && imageList.length) {
      for (var i = 0; i < imageList.length; i++) {
        var oDiv = document.createElement('div')
        var oImg = document.createElement('img')

        oImg.style.cssText += 'vertical-align: middle;'
        oDiv.setAttribute('data-src', imageList[i].src)
        oDiv.className = 'swiper-slide';
        sImgPrev.className = "btn-prev";
        sImgNext.className = "btn-next"

        oImg.onload = function(){
          if(this.width/this.height > 240/150) {
            this.style.width = '100%';
          }
          else {
            this.style.height = '100%';
          }
        }
        oImg.src = imageList[i].src + '?imageView2/2/w/200'
        oDiv.appendChild(oImg)
        oSwipeWrap.appendChild(oDiv)
      }
      carouselDiv.innerHTML = ''
      carouselDiv.appendChild(sImgPrev);
      carouselDiv.appendChild(oSwipe);
      carouselDiv.appendChild(sImgNext);
    } else {
      carouselDiv.innerHTML = ''
    }

    if (contentData.audio && contentData.audio.src) {
      audioImg = document.createElement('img');
      audioImg.src = iconPath + 'btn_audio.png'
      audioImg.className = 'btn-audio';
      audioImg.addEventListener('touchend', toggleAudio);
      audioWrap.innerHTML = ''
      audioWrap.appendChild(audioImg);
      audioWrap.style.display = 'inline-block';
      playAudio();
      setTimeout(function(){
        if(oBtnFav.style = 'block'){
          audioWrap.className = 'audio-wrap';
        }
      }, 300);
    } else {
      audioWrap.innerHTML = ''
      audioWrap.style.display = 'none';
    }
    if(contentData.price){
      oSymbol.style.display = 'inline-block';
      oPrice.style.display = 'inline-block';
      oPrice.innerHTML = contentData.price;
    }else{
      oSymbol.style.display = 'none';
      oPrice.style.display = 'none';
    }

    var stageWidth = krpano.get('stagewidth');

    tips.innerHTML = contentData.text.replace(/\n/g, '<br>');




    var pre = document.createElement('pre');
    pre.style.cssText = 'display: inline-block; width: 240px; word-wrap: break-all; white-space: pre-wrap;'
    pre.style.width = oWrap.style.width;
    pre.innerHTML = contentData.text.replace(/\n/g, '<br>');
    document.body.appendChild(pre);

    var loop = true;
    if (contentData.image && contentData.image.length) {
      carouselDiv.style.cssText = 'max-height:150px; padding: 0px 0px; position: relative; '
      oPanel.insertBefore(carouselDiv, priceBar);
      if(contentData.image.length == 1){
        loop = false;
      }
    }

    oSwipeWrap.style.visibility = 'hidden';
    var isMove = false;
    setTimeout(function(){
      window.mySwiper = new Swiper('.taobao-swiper-container', {
        loop: loop,
        loopAdditionalSlides: 1,
        slidesPerView: 1.5,
        centeredSlides: true,
        simulateTouch: true,
        updateOnImagesReady: true,
        autoResize: true,
        longSwipesRatio: 0.1,
        tdFlow: {
          rotate: 1,
          stretch: -30,
          depth: 100,
          modifier : 1,
          shadows: false
        },
        onSlideChangeEnd: function(swiper) {
          isMove = false;
        },
        onTouchMove: function(swiper) {
          isMove = true;
        },
        onTouchEnd: function(swiper) {
          if(isMove){
            isMove = false;
            return;
          }
          var activeImg = swiper.activeSlide().getAttribute('data-src');
          if(activeImg){
            onEndThumbnail(activeImg);
          }
        },
        onSwiperCreated: function(swiper) {
          oSwipeWrap.style.visibility = 'visible';
        }
      })
    }, 200);
    document.body.removeChild(pre);
  }

  function onStartThumbnail() {
    isShowOriginalImg = true
  }

  function onMoveThumbnail () {
   isShowOriginalImg = false
  }

  function onEndThumbnail (src, e) {
    if (!isShowOriginalImg) return
    krpano.call('plugin[zoomage].show('+ src +')')
  }

  function playAudio(){
    var soundPath = contentData.audio.src || '';
    if(soundPath){
      krpano.call('playsound(taobao, "'+soundPath+'")');
      audioImg.src = iconPath + 'btn_audio_pressed.png';
      audioIsPlayed = true;
    }
  }

  function toggleAudio() {
    krpano.call('pausesoundtoggle(taobao)');
    if(audioIsPlayed){
      audioImg.src = iconPath + 'btn_audio.png';
      audioIsPlayed = false;
    }else{
      audioImg.src = iconPath + 'btn_audio_pressed.png';
      audioIsPlayed = true;
    }
  }

  function close() {
    if(contentData.audio && contentData.audio.src){
      var soundPath = contentData.audio.src || '';
      krpano.call('stopsound(taobao)');
      audioImg.src = iconPath + 'btn_audio.png';
      audioIsPlayed = false;
    }
    plugin.visible = false;
  }

  function openWindow() {
    window.open(currentLink);
  }

  function addShoppingCart(nick, id, skuId) {
    if(window.Tida){
      if(Tida.appinfo.isTmall || Tida.appinfo.isTaobao){
        Tida.cart({
          sellerNick: nick,
          itemId: id || '',
          skuId: skuId || '',
          isvExt: ""
        }, function (data) {
        })
      }
    }
  }

  function buyRightNow(id) {
    if(window.Tida){
      if(Tida.appinfo.isTmall || Tida.appinfo.isTaobao){
        Tida.detail(id);
      }
    }
  }

  function toggleCollect() {
    if(window.Tida){
      if(Tida.appinfo.isTmall || Tida.appinfo.isTaobao){
        Tida.itemFavor({
          itemId: currentProductId,
          action: 'check'
        }, function(data){
          if(data.data.isFav == 'true'){
            // 删除收藏
            Tida.itemFavor({
              itemId: currentProductId,
              action: 'del'
            }, function(data){
              if(data.errorCode == 0){
                oBtnFav.src = iconPath + 'btn_collection.png';
              }
            })
          }else{
            // 添加收藏
            Tida.itemFavor({
              itemId: currentProductId,
              action: 'add'
            }, function(data){
              if(data.errorCode == 0){
                oBtnFav.src = iconPath + 'btn_collected.png';
              }
            })
          }
        });
      }
    }
  }

  var originY = 0
  function touchStartDescription(e) {
    originY = e.changedTouches[0].clientY;
    e.stopPropagation();
  }

  function touchMoveDescription(e) {
    var y = e.changedTouches[0].clientY;
    var delta = originY - y;
    originY = y;
    this.scrollTop += delta;
    e.stopPropagation();
  }
}
