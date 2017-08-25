function krpanoplugin()
{
  var local = this;

  var krpano = null;
  var plugin = null;
  var oDiv = document.createElement('div');
  oDiv.className = 'krpano-label';

  // 规定label最长的rem值,8个字符，fontsize为14；增加3像素偏移量
  var maxWidth = 14 * 8 + 3;
  // alert('maxWidth = :' + maxWidth);

  local.registerplugin = function(krpanointerface, pluginpath, pluginobject)
  {
    krpano = krpanointerface;
    plugin = pluginobject;
    plugin.resetposition = resetposition;
    plugin.resethtml = resethtml;

    oDiv.innerHTML = plugin.text || '';
    oDiv.style.cssText = 'display: block';


    var pre = document.createElement('span');
    pre.innerHTML = oDiv.innerHTML;
    pre.className = 'krpano-hotspot-name';
    pre.style.visibility = 'hidden';
    document.body.appendChild(pre);
    // alert('pre.width = '+pre.offsetWidth);
    oDiv.style.width = pre.offsetWidth + 'px';
    // 判断 usefor = tooltip ,则执行Hotspot设置
    if(plugin.usefor && plugin.usefor == 'tooltip'){
      sp.addClass(oDiv, 'krpano-hotspot-name');
      if(pre.offsetWidth > maxWidth ){
        oDiv.style.width = maxWidth + 'px';
      }else{
        oDiv.style.width = pre.offsetWidth + 'px';
      }
    }
    document.body.removeChild(pre);
    plugin.sprite.appendChild(oDiv);
  }

  function resetposition() {
    var pre = document.createElement('span');
    var newWidth = 0;
    var newHeight = 0;
    pre.innerHTML = plugin.text;
    pre.className = 'krpano-hotspot-name';
    pre.style.visibility = 'hidden';
    document.body.appendChild(pre);
    if(pre.offsetWidth > maxWidth){
      newWidth = maxWidth
    }else{
      newWidth = pre.offsetWidth;
    }

    newHeight = Math.ceil(pre.offsetWidth/maxWidth) * 18 + 8;

    oDiv.style.width = newWidth + 'px';
    plugin.registercontentsize(newWidth, newHeight);
    document.body.removeChild(pre);
  }

  function resethtml(txt) {
    oDiv.innerHTML = txt || '';
    plugin.text = txt || '';
    resetposition();
  }

}