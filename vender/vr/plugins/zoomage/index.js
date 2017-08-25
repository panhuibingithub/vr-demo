function krpanoplugin() {
    var local = this; // save the 'this' pointer from the current plugin object

    var krpano = null; // the krpano and plugin interface objects
    var plugin = null;
    var oWrap;
    var originalDiv;
    var closeBtn;
    var zoomage;
    var imageUrl;
    var loadingDiv;
    var isCloseOriginalImg = true;
    var iconPath;

    local.registerplugin = function(krpanointerface, pluginpath, pluginobject) {
        // get the krpano interface and the plugin object
        krpano = krpanointerface;
        plugin = pluginobject;
        plugin.show = show

        iconPath = plugin.icon_path || '';

        var stageWidth = krpano.get('stagewidth');
        var stageHeight = krpano.get('stageheight');

        oWrap = document.createElement('div')
        oWrap.className = 'oWrap-zoomage'
        oWrap.style.cssText = 'background: #000000;'
        oWrap.style.width = stageWidth + 'px';
        oWrap.style.height = stageHeight + 'px';

        loadingDiv = document.createElement('div')
        loadingDiv.className = 'uil-rolling-css'
        loadingDiv.style.cssText = 'transform:scale(0.1 );'
        loadingDiv.innerHTML = '<div><div></div><div></div></div>'
        loadingDiv.style.cssText += 'position: absolute; z-index: 3000; top: 50%; left: 50%; margin-left: -140px; margin-top: -140px;'

        originalDiv = document.createElement('div');
        closeBtn = document.createElement('div');
        var stageWidth = krpano.get('stagewidth');
        var stageHeight = krpano.get('stageheight');

        originalDiv.style.cssText = 'position: absolute; z-index: 99998; top: 0; bottom: 0; left: 0; right: 0;';
        originalDiv.style.height = stageHeight + 'px';
        originalDiv.style.width = stageWidth + 'px';
        originalDiv.className = 'originalDiv'

        closeBtn.style.cssText = 'position: absolute; z-index: 99999; top: 10px; right: 10px; width: 30px; height: 30px;';
        closeBtn.style.cssText += 'background:url('+iconPath+'zoomage_close.png) no-repeat center center; background-size: cover;';
        originalDiv.addEventListener('touchstart', onStartOriginalImg)
        originalDiv.addEventListener('touchmove', onMoveOriginalImg)
        originalDiv.addEventListener('touchend', onEndOriginalImg)

        closeBtn.addEventListener('touchend', onEndOriginalImg);

        oWrap.appendChild(loadingDiv)
        oWrap.appendChild(originalDiv)
        oWrap.appendChild(closeBtn)

        plugin.sprite.appendChild(oWrap);
        setTimeout(function(){
          plugin.registercontentsize('100%', '100%');
          plugin.sprite.style.width = '100%';
          plugin.sprite.style.height = '100%';

          plugin.sprite.style.zIndex = 3004;
        }, 0)

    }

    function addZoomageUntilDomReady(){
      loadingDiv.style.display = 'block';
      if(originalDiv.offsetWidth == 0) {
        setTimeout(addZoomageUntilDomReady, 100);
        return;
      }

      zoomage = new Zoomage({
          container: originalDiv,
          enableDesktop: true,
          enableGestureRotate: false,
          dbclickZoomThreshold: 0.1,
          lockedge: true,
          maxZoom: 3,
          minZoom: 0.5,
          onLoaded: function (obj) {
            loadingDiv.style.display = 'none';
          }
      })

      if(!zoomage) { return; }

      zoomage.load(imageUrl);
    }

    function onStartOriginalImg() {
      isCloseOriginalImg = true
    }

    function onMoveOriginalImg() {
      isCloseOriginalImg = false
    }

    function onEndOriginalImg() {
      if (!isCloseOriginalImg){
        isCloseOriginalImg = true;
        return
      }
      originalDiv.innerHTML = ''
      plugin.visible = false;
      imageUrl = '';
    }

    function show(src) {
      plugin.visible = true;
      imageUrl = src;
      addZoomageUntilDomReady();
      // if(!zoomage) { return; }
      // plugin.visible = true;
      // zoomage.load(src);
    }

}
