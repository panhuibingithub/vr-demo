function krpanoplugin()
{
  var local = this;
  var krpano = null;
  var plugin = null;

  var oBtn = document.createElement('div');
  var oImage = document.createElement('div')
  var oTitle = document.createElement('div');

  var oMenu = null;
  // var buttonClass = '';
  // var buttonPressClass = '';
  var isPressed = false;
  var isMobile = false;

  local.registerplugin = function(krpanointerface, pluginpath, pluginobject)
  {
    krpano = krpanointerface;
    plugin = pluginobject;

    plugin.toggle = toggleIcon;
    plugin.togglew = toggleIconW;

    isMobile = krpano.get('device.mobile') || krpano.get('device.ipad');

    oBtn.className = 'krpano-button ' + plugin.icon;
    oImage.className = 'image';
    oTitle.className = 'title';
    oBtn.appendChild(oImage);
    oBtn.appendChild(oTitle);

    oTitle.style.marginLeft = ((plugin.width - 80) / 2) + 'px';
    oTitle.innerHTML = plugin.title || '';

    if(isMobile) {
      oTitle.style.display = 'none';
    }

    plugin.sprite.appendChild(oBtn);

    oBtn.addEventListener('click', toggleIconA);
    oBtn.addEventListener('touchend', toggleIconA);
  }

  local.unloadplugin = function()
  {
      plugin = null;
      krpano = null;
  }

  var runtoggleAorB = 'A'
  function toggleIcon(isPressed_)
  {
    if(typeof isPressed_ === 'object') { return; }
    if(typeof isPressed_ === 'string') {
      isPressed = !(isPressed_ === 'true');
    }
    if(!isPressed) {
      sp.addClass(oBtn, 'active');
      isPressed = true;
    }
    else {
      sp.removeClass(oBtn, 'active');
      isPressed = false;
    }

    runtoggleAorB = 'B'
  }

  function toggleIconA(evt){
    evt.preventDefault();
    evt.stopPropagation();
    if(runtoggleAorB === 'B') {
      runtoggleAorB = 'A';
      return;
    }

    if(!isPressed) {
      sp.addClass(oBtn, 'active');
      isPressed = true;
    }
    else {
      sp.removeClass(oBtn, 'active');
      isPressed = false;
    }
  }

  function toggleIconW(isPressed_){
    if(typeof isPressed_ === 'string') {
      isPressed = !!(isPressed_ === 'true');
    }
    else {
      isPressed = !!isPressed_;
    }
    if(isPressed) {
      sp.addClass(oBtn, 'active');
    }
    else {
      sp.removeClass(oBtn, 'active');
    }
  }

  function noop() {}
}
