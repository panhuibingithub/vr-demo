function krpanoplugin() {
  var local = this;

  var krpano = null;
  var plugin = null;

  var oBar = document.createElement('div');
  var oWrap = document.createElement('div');
  var oContainerOfUl = document.createElement('div');
  var oUl = document.createElement('ul');
  var oBtnPrev = document.createElement('div');
  var oBtnNext = document.createElement('div');

  var sBtnPrev = document.createElement('div');
  var sBtnNext = document.createElement('div');

  var sBar = document.createElement('div');
  var sWrap = document.createElement('div');
  var sContainerOfUl = document.createElement('div');
  var sUl = document.createElement('ul');
  var stageWidth = null;

  var analyse = {};

  //分配class名称
  //父容器
  oBar.className = 'scenebar-main';
  oWrap.className = 'main-wrap';
  oContainerOfUl.className = 'main-container';
  oUl.className = 'main-ul'
  oBtnPrev.className = 'main-prev'
  oBtnNext.className = 'main-next'
  sBtnPrev.className = 'son-prev'
  sBtnNext.className = 'son-next'

  // 子容器
  sBar.className = 'scenebar-son';
  sWrap.className = 'son-wrap'
  sContainerOfUl.className = 'son-container'
  sUl.className = 'son-ul'

  var show_scenes = false
  var preGroupId = null;
  var data = [];

  var liWidth, isDragOn = false, isMoved = false, isMouseDown = false, isMobile = false;

  local.registerplugin = function(krpanointerface, pluginpath, pluginobject) {
    krpano = krpanointerface;
    plugin = pluginobject;

    krpano.trace(1, "welcome to scenes_bar plugin~");

    isMobile = krpano.get('device.mobile');
    stageWidth = krpano.get('stagewidth');

    if(!krpano.scene) {
      krpano.trace(1, "there're no scenes in the krpano.");
      return;
    }

    if(krpano.get('data[data_scenebar]')){
      data = krpano.get('data[data_scenebar]').content;
      data = JSON.parse(data);
    }
    else {
      var scenes = krpano.scene.getArray();
      for(var i=0; i<scenes.length; i++){
        data.push({
          name: scenes[i].name,
          title: scenes[i].title || scenes[i].name
        })
      }
    }

    plugin.show = show;
    plugin.hide = hide;
    plugin.make_current_scene_active = make_current_scene_active;

    // 解析analyse方法
    if(plugin.analyse) {
      var actions = plugin.analyse.split('|');
      if(actions.length > 0) {
        analyse['switch'] = actions[0];
      }
      if(actions.length > 1) {
        analyse['toggle'] = actions[1];
      }
    }

    //手机端撑满屏幕宽度
    generateOnMobile();

    oContainerOfUl.addEventListener('mousedown', dragOn.bind(this, ''), false);
    oContainerOfUl.addEventListener('touchstart', dragOn.bind(this, ''), false);
    oContainerOfUl.addEventListener('mousemove', dragMove.bind(this, ''), false);
    oContainerOfUl.addEventListener('touchmove', dragMove.bind(this, ''), false);
    oContainerOfUl.addEventListener('mouseup', dragOff.bind(this), false);
    oContainerOfUl.addEventListener('touchend', dragOff.bind(this), false);

    oBar.addEventListener('click', preventDefault, false)
    sBar.addEventListener('click', preventDefault, false)

    document.body.addEventListener('click', hide, false);
    document.body.addEventListener('touchend', hide, false);

    plugin.sprite.className = 'krpano-scenebar';
    plugin.sprite.style.zIndex = 4002;
    make_current_scene_active();
    make_current_group_active();
  }

  function generateOnMobile() {
    // // 生成父列表宽度

    var barWidth = data.length * 120 + 50 * 2;

    if (!isMobile) {
      if (barWidth > stageWidth) {
        oBtnPrev.style.display = 'blcok'
        oBtnNext.style.display = 'block'
      } else {
        oBtnPrev.style.display = 'none'
        oBtnNext.style.display = 'none'
      }
    }

    for (var i = 0; i < data.length; i++) {
      // 生成列表DOM元素
      var oLi = document.createElement('li');
      var oThumb = document.createElement('div');
      var oImg = document.createElement('img');
      var oTitle = document.createElement('div');
      oThumb.className = 'scenebar-thumb';
      oTitle.className = 'thumb-title';

      oImg.src = data[i].children ? krpano.get("scene["+data[i].children[0].name+"].thumburl") : krpano.get("scene["+data[i].name+"].thumburl")
      oTitle.innerHTML = data[i].children ? data[i].name : data[i].title;
      // 如果包含子全景，则生成分组封面图和样式
      if(data[i].children) {
        // 设置分组临时ID
        oLi.setAttribute('groupId', i);
        // 设置分组封面样式
        sp.addClass(oThumb, 'scenebar-group');
        sp.addClass(oImg, 'group-cover');
        var oPaper1 = document.createElement('div');
        var oPaper2 = document.createElement('div');
        oPaper1.className = 'group-childone';
        oPaper2.className = 'group-childtwo';
        oThumb.appendChild(oPaper2);
        oThumb.appendChild(oPaper1);
        // 绑定点击事件
        oLi.addEventListener('click', showScenesOnMobile);
        oLi.addEventListener('touchend', showScenesOnMobile);
      }else{
        // 非分组设置场景名称
        oLi.setAttribute('scenename', data[i].name);
        oLi.setAttribute('title', oTitle.innerHTML);
        oLi.setAttribute('group','nogroup')
        // 绑定点击事件
        oLi.addEventListener('click', loadScene.bind(oLi, true, data[i].switchMode));
        oLi.addEventListener('touchend', loadScene.bind(oLi, true, data[i].switchMode));
      }

      // 插入元素到DOM中
      oThumb.appendChild(oImg);
      oThumb.appendChild(oTitle);
      oLi.appendChild(oThumb);
      oUl.appendChild(oLi);
    }



    oWrap.appendChild(oContainerOfUl);
    sWrap.appendChild(sContainerOfUl);

    if(!isMobile) {
      oWrap.appendChild(oBtnPrev);
      oWrap.appendChild(oBtnNext);
      sWrap.appendChild(sBtnPrev);
      sWrap.appendChild(sBtnNext);
    }

    oBtnPrev.addEventListener('mousedown', turnRightOn);
    oBtnPrev.addEventListener('mouseup', turnRightOff);
    oBtnNext.addEventListener('mousedown', turnLeftOn);
    oBtnNext.addEventListener('mouseup', turnLeftOff);

    sBtnPrev.addEventListener('mousedown', turnRightOn.bind(this, 'scene'));
    sBtnPrev.addEventListener('mouseup', turnRightOff);
    sBtnNext.addEventListener('mousedown', turnLeftOn.bind(this, 'scene'));
    sBtnNext.addEventListener('mouseup', turnLeftOff);

    oContainerOfUl.appendChild(oUl);
    oBar.appendChild(oWrap);


    sContainerOfUl.appendChild(sUl);
    sBar.appendChild(sWrap);

    plugin.sprite.appendChild(sBar);
    plugin.sprite.appendChild(oBar);

    if(plugin.visible) {
      show();
    }

    plugin.align = 'leftbottom';
    plugin.width = '100%';
    plugin.height = 0;
  }


  var hTurnLeft = null;
  function turnLeftOn(judge) {
    hTurnLeft = setInterval(function() {
      if (judge === 'scene') {
        if (sContainerOfUl.scrollLeft + sContainerOfUl.offsetWidth >= sContainerOfUl.scrollWidth) {
          clearInterval(hTurnLeft);
          return;
        }
        sContainerOfUl.scrollLeft += 16;
      } else {
        if (oContainerOfUl.scrollLeft + oContainerOfUl.offsetWidth >= oContainerOfUl.scrollWidth) {
          clearInterval(hTurnLeft);
          return;
        }
        oContainerOfUl.scrollLeft += 16;
      }
    }, 25);
  }

  function turnLeftOff() {
    clearInterval(hTurnLeft);
  }

  var hTurnRight = null;
  function turnRightOn(judge) {
    hTurnRight = setInterval(function() {
      if (judge === 'scene') {
        if (sContainerOfUl.scrollLeft <= 0) {
          clearInterval(hTurnRight);
          return;
        }
        sContainerOfUl.scrollLeft -= 16;
      } else {
        if (oContainerOfUl.scrollLeft <= 0) {
          clearInterval(hTurnRight);
          return;
        }
        oContainerOfUl.scrollLeft -= 16;
      }
    }, 25);
  }

  function turnRightOff() {
    clearInterval(hTurnRight);
  }

  // 点击父列表展示子列表事件
  function showScenesOnMobile(e) {
    var evt = e || window.event;
    preventDefault(evt);
    if(isMoved) {return};


    // 获取groupID
    var groupId = this.getAttribute('groupId');
    var activeGroup = data[groupId].children;

    make_current_group_active(groupId);
    if(sp.hasClass(sBar, 'scenebar-show')){
      // sBar已经显示,替换内容
      if(sBar.getAttribute('groupId') == groupId){
        sp.removeClass(sBar, 'scenebar-show');
      }else{
        changeSbarCont(groupId, activeGroup);
      }

    }else{
      // sBar已经隐藏
      if(sBar.getAttribute('groupId') == groupId) {
        sp.addClass(sBar, 'scenebar-show');

        return;
      }

      sBar.setAttribute('groupId', groupId);

      sContainerOfUl.addEventListener('touchstart', dragOn.bind(this, 'scene'), false);
      sContainerOfUl.addEventListener('touchmove', dragMove.bind(this, 'scene'), false);
      sContainerOfUl.addEventListener('touchend', dragOff, false);
      sContainerOfUl.addEventListener('mousedown', dragOn.bind(this, 'scene'), false);
      sContainerOfUl.addEventListener('mousemove', dragMove.bind(this, 'scene'), false);
      sContainerOfUl.addEventListener('mouseup', dragOff, false);

      if(!sUl){
        sUl = document.createElement('ul');
        sUl.className = 'son-ul';
        sContainerOfUl.appendChild(sUl);
      }

      changeSbarCont(groupId, activeGroup);

      sp.addClass(sBar, 'scenebar-show');

    }

    var barWidth = activeGroup.length * 120 + 50 * 2;

    if (!isMobile) {
      if (barWidth > stageWidth) {
        sBtnNext.style.display = 'block'
        sBtnPrev.style.display = 'block'
      } else {
        sBtnNext.style.display = 'none'
        sBtnPrev.style.display = 'none'
      }
    }

    // make_current_scene_active();
    // make_current_group_active(groupId);
  }

  function loadScene(needClear, switchMode, e) {
    var evt = e || window.event;
    preventDefault(evt);

    var self = this;
    if(isMoved) {return};

    var scenename = self.getAttribute('scenename')
    var title = self.getAttribute('title')
    var GroupId = self.getAttribute('groupId')
    var group = self.getAttribute('group')

    var hashHlookat = 0, hashVlookat = 0;
    if(switchMode && switchMode == "follow"){
      var hashHlookat = krpano.get('view.hlookat');
      var hashVlookat = krpano.get('view.vlookat');
    }

    krpano.call('loadscene(' + scenename + ', null, MERGE, BLEND(0.2))');
    // 视角跟随
    if(switchMode && switchMode == "follow"){
      krpano.set('view.hlookat', hashHlookat);
      krpano.set('view.vlookat', hashVlookat);
    }
    // 非分组内则关闭sBar
    if(group == 'nogroup'){
      sp.removeClass(sBar, 'scenebar-show');
    }
    // 设置当前active样式
    make_current_scene_active();

    //data collection
    if(analyse.switch) {
      krpano.call(analyse.switch + '(' + scenename + ', ' + title + ')');
    }

  }

  var originX = 0;

  function dragOn(judge, e) {
    var evt = e || window.event;
    if(evt.changedTouches){
      originX = evt.changedTouches[0].clientX;
    }else{
      originX = evt.clientX;
    }
    // preventDefault(evt);
    if(!isMobile) {
      isMouseDown = true;
    }
    isMoved = false;
  }

  function dragMove(judge, e) {
    var evt = e || window.event;
    preventDefault(evt);
    if(!isMobile && !isMouseDown) {
      return;
    }
    isMoved = true;
    var x;
    if(evt.changedTouches){
      x = evt.changedTouches[0].clientX;
    }else{
      x = evt.clientX;
    }
    var delta = originX - x;

    originX = x;
    if (judge === 'scene') {
      sContainerOfUl.scrollLeft += delta;
    } else {
      oContainerOfUl.scrollLeft += delta;
    }
  }

  function dragOff(e) {
    var evt = e || window.event;
    preventDefault(evt);
    setTimeout(function(){
      isMoved = false;
      isMouseDown = false;
    }, 5)
  }

  function preventDefault(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  var canHide = false;
  // 显示scenebar
  function show() {
    isDragOn = false;
    isMoved = false;
    isMouseDown = false;
    plugin.visible = true;
    setTimeout(function(){
      sp.addClass(oBar, 'scenebar-show');
      make_current_scene_active();
      // var dom = document.getElementsByClassName('main-ul')[0].getElementsByTagName('li')[0];
      // liWidth = dom.offsetWidth ;
      if (!isMobile) {
        liWidth = 120;
      } else {
        liWidth = 100;
      }
      // 生成父列表宽度
      oUl.style.width = liWidth * data.length + 'px';
      canHide = true;
    }, 100);

    if(analyse.toggle) {
      krpano.call(analyse.toggle + '()');
    }
  }

  var hHideSettimeout = null

  // 隐藏scenebar
  function hide(e) {
    isDragOn = false;
    isMouseDown = false;
    sp.removeClass(oBar, 'scenebar-show');
    sp.removeClass(sBar, 'scenebar-show');
    hHideSettimeout = setTimeout(function () {
      plugin.visible = false;
      krpano.call('plugin[btn_scenes_bar].togglew(false)');

      //data collection
      // if(analyse.toggle) {
      //   krpano.call(analyse.toggle + '()');
      // }
    }, 500);
  }

  // 给当前激活的场景列表增加active样式
  function make_current_scene_active() {
    var currentSceneName = krpano.get("xml.scene"),
        currentGroupId;

    for (var j = 0; j < data.length; j++) {
      if (data[j].children) {
        for (var k = 0; k < data[j].children.length; k++) {
          if (data[j].children[k].name === currentSceneName) {
            currentGroupId = j
          }
        }
      }
    }

    for (var i = 0; i < oUl.childNodes.length; i++) {
      var oLi = oUl.childNodes[i];
      if (oLi.getAttribute("scenename") == currentSceneName) {
        sp.addClass(oLi, 'scene-active');
      } else if (parseInt(oLi.getAttribute("groupId")) == currentGroupId) {
        sp.addClass(oLi,'scene-group-active');
      } else {
        sp.removeClass(oLi, 'scene-active');
        sp.removeClass(oLi, 'scene-group-active');
      }
    }

    for (var i = 0; i < sUl.childNodes.length; i++) {
      var sLi = sUl.childNodes[i];
      if (sLi.getAttribute("scenename") == currentSceneName) {
        sp.addClass(sLi, 'scene-active');
      } else {
        sp.removeClass(sLi, 'scene-active');
      }
    }

  }

  function make_current_group_active(groupId) {

    for (var i = 0; i < oUl.childNodes.length; i++) {
      var oLi = oUl.childNodes[i];

      if ( oLi.getAttribute("groupid") && (oLi.getAttribute("groupid") == groupId) ) {
        sp.addClass(oLi, 'scene-group-active');
      } else {
        sp.removeClass(oLi, 'scene-active');
        sp.removeClass(oLi, 'scene-group-active');
      }
    }
  }

  function changeSbarCont(groupId, activeGroup) {
    sUl.innerHTML = '';
    sUl.style.width = (activeGroup.length * liWidth) + 'px';
    sBar.setAttribute('groupId', groupId);
    // 生成子场景列表
    for(var i = 0; i < activeGroup.length; i++){
      var sLi = document.createElement('li');
      var sThumb = document.createElement('div');
      var sImg = document.createElement('img');
      var sTitle = document.createElement('div');

      sThumb.className = 'scenebar-thumb'
      sTitle.className = 'thumb-title'

      sTitle.innerHTML = activeGroup[i].title;
      sImg.src = krpano.get("scene["+activeGroup[i].name+"].thumburl")

      sThumb.appendChild(sImg)
      sThumb.appendChild(sTitle)
      sLi.appendChild(sThumb)
      sUl.appendChild(sLi)
      sLi.setAttribute('group', groupId);
      sLi.setAttribute('scenename', activeGroup[i].name);
      sLi.setAttribute('title', sTitle.innerHTML);
      sLi.addEventListener('click', loadScene.bind(sLi, false, activeGroup[i].switchMode));
      sLi.addEventListener('touchend', loadScene.bind(sLi, false, activeGroup[i].switchMode));
    }
  }

}