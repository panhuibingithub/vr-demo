function krpanoplugin()
{
  var local = this;

  var krpano = null;
  var plugin = null;
  var stageWidth = null;
  var stageHeight = null;
  var isMobile = null;

  // 定义容器
  var wrap = document.createElement('div'),
      cont = document.createElement('div'),

      closeBtn = document.createElement('div'),
      countBox = document.createElement('div');

  wrap.className = 'krpano-imgslider';
  cont.className = 'content';

  closeBtn.className = 'btn-close';
  countBox.className = 'count';

  var oWrap, oHeader;
  var oPanel = null;
  var iconPath = '';
  var activedImageIndex = 0;
  var contentData, imgSwiper = null;
  var prevBtn, nextBtn, slideContainer, slideWraper;

  local.registerplugin = function(krpanointerface, pluginpath, pluginobject)
  {
    krpano = krpanointerface;
    plugin = pluginobject;

    krpano.trace(1, "welcome to image slider plugin mobile~");
    plugin.loadcontent = loadContent;

    stageWidth = krpano.get('stageWidth');
    stageHeight = krpano.get('stageHeight');

    isMobile = krpano.get('device.mobile');

    var contentWidth = stageWidth - 100 * 2;
    var contentHeight = stageHeight - 150 * 2;

    loadjs([
      sp.config.origin + '/vender/vr/plugins/swiper/idangerous.swiper.css',
      sp.config.origin + '/vender/vr/plugins/swiper/idangerous.swiper.min.js'
    ], {
      async: false,
      success: function() {
        console.log('registerplugin ism')
        if (!isMobile) {
          cont.style.width = contentWidth + 'px';
          cont.style.height = contentHeight + 'px';
          cont.style.marginTop = -contentHeight/2 + 'px';
          cont.style.marginLeft = -contentWidth/2 + 'px';
        }

        closeBtn.addEventListener('click', close);
        closeBtn.addEventListener('touchend', close);

        // 构建DOM结构
        wrap.appendChild(closeBtn);
        wrap.appendChild(countBox);
        wrap.appendChild(cont);
        plugin.sprite.appendChild(wrap);

        setTimeout(function(){
          plugin.width = '100%';
          plugin.height = '100%';
          plugin.align = 'lefttop';
          plugin.sprite.style.zIndex = 4002;
        }, 0)
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

    cont.innerHTML = '';

    prevBtn = document.createElement('div');
    nextBtn = document.createElement('div');
    prevBtn.className = 'btn-pre';
    nextBtn.className = 'btn-next';
    slideContainer = document.createElement('div');
    slideContainer.className = 'swiper-container image-swiper-container';
    if (!isMobile) {
      slideContainer.style.width = stageWidth - 150 * 2 + 'px';
      slideContainer.style.lineHeight = stageHeight - 150 * 2 + 'px';
    }


    slideWraper = document.createElement('div');
    slideWraper.className = 'swiper-wrapper';

    slideContainer.appendChild(slideWraper);
    cont.appendChild(prevBtn);
    cont.appendChild(slideContainer);
    cont.appendChild(nextBtn);

    countBox.innerHTML = '1 / '+contentData.length;

    for(var i = 0; i < contentData.length; i++){
      var slideBox = document.createElement('div');
      slideBox.className = 'swiper-slide';
      var oImg = document.createElement('img');
      if (!isMobile) {
        oImg.style.height = '100%';
      }else{
        oImg.style.width = '100%';
      }
      oImg.onload = function(){
        var ow = this.width;
        var oh = this.height;
        var parentWidth = slideContainer.offsetWidth;
        var parentHeight = slideContainer.offsetHeight;
        if(ow/oh  >= parentWidth/parentHeight ) {
          this.style.width = '100%';
          this.style.height = 'auto';
        }else{
          this.style.width = 'auto';
          this.style.height = '100%';
        }
      }
      oImg.src = contentData[i].url + '?imageView2/2/w/1000';
      slideBox.appendChild(oImg);
      slideWraper.appendChild(slideBox);
    }

    setTimeout(function(){
      imgSwiper = new Swiper('.image-swiper-container', {
        updateOnImagesReady: true,
        autoResize: true,
        loop : true,
        onSlideChangeStart: function(swiper) {
          countBox.innerHTML = swiper.activeLoopIndex+1 + ' / ' + contentData.length;
        },
      });
    }, 250)

    prevBtn.addEventListener('click', function(){
      imgSwiper.swipePrev();
    });

    nextBtn.addEventListener('click', function(){
      imgSwiper.swipeNext();
    });

    if(plugin.analyse) {
      krpano.call(plugin.analyse + '(open, image)');
    }
  }

  function imageOnLoad(){

    var self = this;

    if(!this.width) {
      setTimeout(function(){
        imageOnLoad.call(self);
      }, 100);
      return;
    }

    var ow = this.width;
    var oh = this.height;
    var parentWidth = slideContainer.offsetWidth;
    var parentHeight = slideContainer.offsetHeight;

    if(ow >= parentWidth) {
      self.style.width = '100%';
    }else{
      self.style.height = '100%';
    }

  }

  var isDragOn = false
  var originX = 0;
  var lastX = 0;
  var displayIndex = 0;

  function dragon(e) {
    isDragOn = true;
    var evt = e || window.event;
    lastX = evt.changedTouches[0].clientX;
    originX = this.offsetLeft;
    evt.stopPropagation()
  }

  function dragmove(e) {
    if(isDragOn){
      var evt = e || window.event;
      var x = evt.changedTouches[0].clientX;
      var delta = lastX - x;
      lastX = x;
      this.style.left = this.offsetLeft - delta + 'px'
    }
  }

  function dragoff(e) {
    isDragOn = false;
    var evt = e || window.event;
    var w = krpano.get('stagewidth');
    var half = w / 2;
    var x = this.offsetLeft;
    var total = this.getElementsByTagName('li').length
    var i = displayIndex

    var distance = originX - x;

    if(Math.abs(distance) > w / 3) {
      i = distance > 0 ? i + 1 : i - 1;
    }

    if(i < 0) { i = 0; }
    if(i > total - 1) { i = total - 1; }

    this.style.left = -w * i + 'px';

    displayIndex = i;

    setHeaderText(i, total)
  }

  function setHeaderText(i, t){
    oHeader.innerHTML = (i + 1) + '/' + t
  }

  function close() {
    plugin.visible = false;

    if(plugin.analyse) {
      krpano.call(plugin.analyse + '(close, image)');
    }
  }

  local.onresize = function(width,height)
  {
    loadContent();
    return false;
  }
}