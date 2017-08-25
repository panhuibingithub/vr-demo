function krpanoplugin()
{

  var local = this;

  var krpano = null;
  var plugin = null;
  var map;
  var mapContainer;
  var marker;
  // var oLocation = document.createElement('a');
  var iconPath = '';
  var locContent = document.createElement('div');

  var isMobile = false

  var location = '';
  var endLng = '';
  var endLat = '';

  var startLng = '';
  var startLat = '';
  var gdContent = '';

  var analyse = "";

  local.registerplugin = function(krpanointerface, pluginpath, pluginobject)
  {
    krpano = krpanointerface;
    plugin = pluginobject;
    plugin.loadmap = loadmap;
    // plugin.setmarker = setMarker;

    iconPath = plugin.icon_path || '';


    plugin.show = show
    plugin.hide = hide

    krpano.trace(1, 'welcome to gaodmap mb');

    var stageWidth = krpano.get('stagewidth');
    var stageHeight = krpano.get('stageheight');

    isMobile = krpano.get('device.mobile');

    var contentData = krpano.get('data[location]');
    var gdData;
    if (contentData && contentData.content) {
      gdData = JSON.parse(contentData.content);
    }

    if (gdData && gdData.content) {
      gdContent = gdData.content;
    }

    if(plugin.analyse) {
      analyse = plugin.analyse;
    }

    loadjs('https://webapi.amap.com/maps?v=1.3&key=da718d6b58377b9d6b23228dfef77b25&plugin=AMap.Geocoder', {
      success: function() {
        var oPanel = document.createElement('div');
        oPanel.className = 'krpano-gaodmap';

        mapContainer = document.createElement('div');

        var oLocation = document.createElement('div');
        oLocation.className = 'location'
        oLocation.addEventListener('click', travelTo);
        oLocation.addEventListener('touchend', travelTo);

        oLocation.appendChild(locContent);

        if (!isMobile) {
          oPanel.style.width = 640 + 'px';
          oPanel.style.height = 500 + 'px';
          oPanel.style.left = (stageWidth - 640) / 2 + 'px';
          oPanel.style.top = (stageHeight - 500) / 2 + 'px';
          mapContainer.style.height = 450 + 'px';
        } else {
          oPanel.style.width = stageWidth * 0.8 + 'px';
          oPanel.style.height = stageHeight * 0.6 + 'px';
          oPanel.style.left =  stageWidth * 0.1 + 'px';
          oPanel.style.top = stageHeight * 0.2 + 'px';
          mapContainer.style.height = stageHeight * 0.6 - 40 + 'px';
        }
        oPanel.appendChild(mapContainer);
        oPanel.appendChild(oLocation);

        plugin.sprite.appendChild(oPanel);
        plugin.width = '100%';
        plugin.align = 'lefttop';
        plugin.sprite.style.zIndex = 3014;
      }
    })
  }

  /**
   * [loadMap 实例化地图对象]
   */
  function loadmap() {
    if(mapContainer){
      map = new AMap.Map(mapContainer, {
        resizeEnable: true,
        zoom: 15,
      })
    }else{
      console.log('loadMap~~~~~')
    }
  }



  /**
   * [setMarker 设置marker]
   * @position = {
   *           LngLat: [121.499809, 31.239666],
   *           content: 显示内容
   * }
   */
  function setMarker(position) {
    if(!position || !position.LngLat){
      console.warn('setMarker: position is not exist');
      return
    }
    map.setCenter(position.LngLat);
    marker = new AMap.Marker({
      map: map,
      position: position.LngLat,
    })

  }


  /**
   * 获取地理坐标
   **/

  function geocoder() {
    var geocoder = new AMap.Geocoder({
      radius: '1000',
      zoom: 12,
    });

    if (gdContent && gdContent.value) {
      setMarker({
        LngLat: [gdContent.lng, gdContent.lat]
      });
    }
  }

    /**
   * 定位获取当前位置经纬度
   * **/

  function geolocationFn() {
    map.plugin('AMap.Geolocation', function() {
      geolocation = new AMap.Geolocation({
        enableHighAccuracy: true,
        timeout: 10000,
        showButton: false,
        showMarker: false,
        showCircle: false,
        panToLocation: false,
      });
      map.addControl(geolocation);
      geolocation.getCurrentPosition();
      AMap.event.addListener(geolocation, 'complete', onComplete);//返回定位信息
      AMap.event.addListener(geolocation, 'error', onError);      //返回定位出错信息
    });


    function onComplete(data) {
      startLng = data.position.lng;
      startLat = data.position.lat;
    }

    function onError(data) {
      console.log(data, 'onError----------')
    }
  }

    function travelTo() {
      if(analyse) {
        krpano.call(analyse + "(navigation)");
      }

      if (startLat) {
        window.open("http://m.amap.com/navi/?start="+startLng+","+startLat+"&dest="+gdContent.lng+","+gdContent.lat+"&destName="+gdContent.value+"&naviBy=car&key=da718d6b58377b9d6b23228dfef77b25");
        return
      }
      window.open("http://m.amap.com/navi/?start=&dest="+gdContent.lng+","+gdContent.lat+"&destName="+gdContent.value+"&naviBy=car&key=da718d6b58377b9d6b23228dfef77b25");
  }

  function show() {
    locContent.innerHTML = gdContent.value;
    plugin.visible = true;
    loadmap();
    geolocationFn();
    geocoder();
  }

  function hide() {
    plugin.visible = false;
  }
}
