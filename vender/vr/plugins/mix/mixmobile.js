function krpanoplugin()
{
  var local = this;

  var krpano = null;
  var plugin = null;

  var oPanel = null;
  var oHeader, oTitle, oDescription;
  var oBtnAudio, pcAudio;
  var iconPath = '';
  var contentData, mixSwiper = null;

  local.registerplugin = function(krpanointerface, pluginpath, pluginobject)
  {
    krpano = krpanointerface;
    plugin = pluginobject;
    krpano.trace(1, 'welcome to mix content mobile');

    loadjs([
      sp.config.origin + '/vender/vr/plugins/swiper/idangerous.swiper.css',
      sp.config.origin + '/vender/vr/plugins/swiper/idangerous.swiper.min.js'
    ], {
      async: false,
      success: function() {
        iconPath = plugin.icon_path || '';

        var oWrap = document.createElement('div');
        oWrap.className = 'mix-wrap';

        var Box = document.createElement('div');
        Box.className = 'mix-box';
        oWrap.appendChild(Box);

        oHeader = document.createElement('div');
        oHeader.className = 'mix-header';
        Box.appendChild(oHeader);

        var oBtnClose = document.createElement('div');
        oBtnClose.className = 'mix-close';
        oBtnClose.addEventListener('click', close);
        oBtnClose.addEventListener('touchend', close);
        Box.appendChild(oBtnClose);

        var pcBtnClose = document.createElement('div');
        pcBtnClose.className = 'mix-pc-close';
        pcBtnClose.addEventListener('click', close);
        pcBtnClose.addEventListener('touchend', close);
        oWrap.appendChild(pcBtnClose);

        oPanel = document.createElement('div');
        oPanel.className = 'mix-panel';
        Box.appendChild(oPanel);

        oThumbWrap = document.createElement('div');
        oThumbWrap.className = 'mix-thumbWrap';
        oThumbWrap.id = 'mix-thumbWrap';
        Box.appendChild(oThumbWrap);

        oContent = document.createElement('div');
        oContent.className = 'mix-content';
        Box.appendChild(oContent);

        oTitle = document.createElement('div');
        oTitle.className = 'mix-title';
        oContent.appendChild(oTitle);

        // 手机端按钮
        oBtnAudio = document.createElement('div');
        oBtnAudio.className = 'mix-audio';
        oBtnAudio.addEventListener('click', toggleAudio);
        oBtnAudio.addEventListener('touchend', toggleAudio);
        oContent.appendChild(oBtnAudio);

        // pc端按钮
        pcAudio = document.createElement('div');
        pcAudio.className = 'mix-pc-audio';
        pcAudio.addEventListener('click', toggleAudio);
        pcAudio.addEventListener('touchend', toggleAudio);
        oWrap.appendChild(pcAudio);

        oDescription = document.createElement('div');
        oDescription.className = 'mix-description'
        oContent.appendChild(oDescription);

        oDescription.addEventListener('touchstart', scrollTextOn);
        oDescription.addEventListener('touchmove', scrollText);
        oDescription.addEventListener('touchend', scrollTextOff);

        plugin.loadcontent = loadContent;
        plugin.resetsounds = resetSounds;

        plugin.sprite.className = 'krpano-mix';
        setTimeout(function(){
          plugin.sprite.appendChild(oWrap);
          plugin.registercontentsize('100%', '100%');
          plugin.sprite.style.zIndex = 4002;
          plugin.sprite.style.width = '100%';
          plugin.sprite.style.height = '100%';
        }, 0);
      }
    });
  }

  function loadContent(dataName) {

    if(dataName) {
      contentData = krpano.get('data[' + dataName + ']');
      contentData = JSON.parse(contentData.content);
    }

    if(!contentData) {
      return;
    }

    var imageList = contentData.image;

    oPanel.innerHTML = '';
    slideContainer = document.createElement('div');
    slideContainer.className = 'swiper-container mix-swiper-container';
    oPanel.appendChild(slideContainer);

    slideWrap = document.createElement('div');
    slideWrap.className = 'swiper-wrapper';
    slideContainer.appendChild(slideWrap);


    oHeader.innerHTML = '1 / ' + imageList.length;
    oThumbWrap.innerHTML = '';

    for(var i=0; i<imageList.length; i++){
      // 滚动大图
      var slideBox = document.createElement('div');
      slideBox.className = 'swiper-slide';
      var oImg = document.createElement('img');
      oImg.style.width = '100%';
      oImg.onload = function(){
        var ow = this.width;
        var oh = this.height;
        var parentWidth = oPanel.offsetWidth;
        var parentHeight = oPanel.offsetHeight;
        if(ow/oh  >= parentWidth/parentHeight ) {
          this.style.width = '100%';
          this.style.height = 'auto';
        }else{
          this.style.width = 'auto';
          this.style.height = '100%';
        }
      }
      oImg.src = imageList[i].src + '?imageView2/2/w/1000';
      slideBox.appendChild(oImg);
      slideWrap.appendChild(slideBox);

      //缩略小图
      var thumbLi = document.createElement('div');
      thumbLi.className = 'mix-thumbli';
      thumbLi.setAttribute('data-index', i);
      thumbLi.addEventListener('click', changeActiveImg);
      if(i == 0){
        sp.addClass(thumbLi, 'active');
      }
      var thumbImg = document.createElement('img');
      thumbImg.src = imageList[i].src + '?imageView2/2/w/160';
      thumbLi.appendChild(thumbImg);
      oThumbWrap.appendChild(thumbLi);
    }

    oTitle.innerHTML = contentData.title;
    oDescription.innerHTML = contentData.description.replace(/\n/g, '<br>');


    if(!contentData.audio || !contentData.audio.src) {
      oBtnAudio.style.display = 'none';
      pcAudio.style.display = 'none';
    }
    slideContainer.style.visibility = 'hidden';

    setTimeout(function(){
      if(!mixSwiper){
        mixSwiper = new Swiper('.mix-swiper-container', {
          loop: true,
          updateOnImagesReady: true,
          autoResize: true,
          onSlideChangeStart: function(swiper) {
            oHeader.innerHTML = swiper.activeLoopIndex+1 + ' / ' + imageList.length;
            var thumbWrap = document.getElementsByClassName('mix-thumbWrap')[0];
            var thumbLi = thumbWrap.getElementsByClassName('mix-thumbli');
            for(var i = 0; i < thumbLi.length; i ++ ){
              if(i == swiper.activeLoopIndex){
                sp.addClass(thumbLi[i], 'active');
              }else{
                sp.removeClass(thumbLi[i], 'active');
              }
            }
          },
          onSwiperCreated: function(swiper) {
            slideContainer.style.visibility = 'visible';
          }
        });
      }
    }, 200)


    if(plugin.analyse) {
      krpano.call(plugin.analyse + '(open, media)');
    }
  }


  function close() {
    plugin.visible = false;
    oBtnAudio.src = iconPath + 'btn_audio.png';
    pcAudio.src = iconPath + 'btn_audio.png';
    krpano.call('stopsound(mix_audio)');
    if(!!contentData.audio) {
      krpano.call('plugin[audiotool].resume();');
    }

    mixSwiper = null;
    sp.removeClass(oBtnAudio, 'playing');
    sp.removeClass(pcAudio, 'playing');

    if(plugin.analyse) {
      krpano.call(plugin.analyse + '(close, media)');
    }
  }

  function toggleAudio() {
    var soundPath = contentData.audio.src || '';

    if(!this.hasPlayed) {
      this.hasPlayed = true;
      sp.addClass(this, 'playing');
      krpano.call('playsound(mix_audio, "'+soundPath+'")');
      return;
    }

    if(sp.hasClass(this, 'playing')) {
      sp.removeClass(this, 'playing');
      krpano.call('pausesound(mix_audio, "'+soundPath+'")');
      return;
    }
    sp.addClass(this, 'playing');
    krpano.call('playsound(mix_audio, "'+soundPath+'")');

  }

  var originY = 0
  function scrollTextOn(e) {
    isDragOn = true;
    var evt = e || window.event;
    originY = evt.changedTouches[0].clientY;
    evt.stopPropagation()
  }

  function scrollText(e) {
    if(isDragOn){
      var evt = e || window.event;
      var Y = evt.changedTouches[0].clientY;
      var delta = originY - Y;
      originY = Y;
      oDescription.scrollTop -= delta;
      evt.stopPropagation();
    }
  }

  function scrollTextOff(e) {
    isDragOn = false;
  }

  function resetSounds() {
    krpano.call('stopsound(mix_audio)');
    if(!!contentData.audio) {
      krpano.call('plugin[audiotool].pause()');
    }

    // krpano.call('plugin[btn_audio_cmt].reset();');
  }

  function changeActiveImg(){
    if(!mixSwiper) return;
    mixSwiper.swipeTo(this.getAttribute('data-index'));
  }

  local.onresize = function(width,height)
  {
    loadContent();
    return false;
  }
}
