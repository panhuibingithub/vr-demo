function krpanoplugin()
{
  var local = this;

  var krpano = null;
  var plugin = null;
  var isMobile = false;

  // 所有的音频数据
  var data = {
    bgm: {},
    aud: {}
  };

  // 当前场景音频数据及状态
  var state = {
    bgm: { src: '', playing: false, changed: true },
    aud: { src: '', playing: false, changed: true }
  }

  var analyse = {};

  local.registerplugin = function(krpanointerface, pluginpath, pluginobject)
  {
    krpano = krpanointerface;
    plugin = pluginobject;

    krpano.trace(1, "welcome to audio plugin~");

    isMobile = krpano.get('device.mobile') || krpano.get('device.ipad');

    plugin.loaddata = loadData;
    plugin.togglebgm = toggleBgm;
    plugin.toggleaud = toggleAud;
    plugin.stop = stop;
    plugin.autoplay = autoPlay;
    plugin.pause = pause;
    plugin.resume = resume;

    loadData();

    setTimeout(plugin.autoplay, 1500);

    if(plugin.analyse) {
      analyse = plugin.analyse;
    }
  }

  // 加载背景音乐和语音解说的DATA，并翻译为audio tool所需的数据结构
  function loadData() {
    var dataBGM = krpano.get('data[data_bgm]');
    var dataAUD = krpano.get('data[data_aud]');

    if(dataBGM) {
      dataBGM = JSON.parse(dataBGM.content);

      if(dataBGM.global) {
        data.bgm['global'] = dataBGM.global.path;
      }
      if(dataBGM.scenes) {
        for(var sceneName in dataBGM.scenes) {
          data.bgm[sceneName] = dataBGM.scenes[sceneName].path;
        }
      }
    }
    if(dataAUD) {
      dataAUD = JSON.parse(dataAUD.content);

      if(dataAUD.global) {
        data.aud['global'] = dataAUD.global.path;
      }
      if(dataAUD.scenes) {
        for(var sceneName in dataAUD.scenes) {
          data.aud[sceneName] = dataAUD.scenes[sceneName].path;
        }
      }
    }

  }

  // 取当前场景音频数据 并设定状态
  function getCurrentData() {
    var currentScene = krpano.get('xml.scene');

    var bgmSrc = data['bgm'][currentScene] || data['bgm']['global'] || '';
    var audSrc = data['aud'][currentScene] || data['aud']['global'] || '';

    state.bgm.changed = state.bgm.src != bgmSrc
    state.aud.changed = state.aud.src != audSrc;

    state.bgm.src = bgmSrc;
    state.aud.src = audSrc;
  }

  // 播放音频的原型方法，供接口方法调用
  function play(type, src, callback) {
    var soundName = type;
    var loops = type == 'bgm';
    var cb = callback || '';

    var exp = 'playsound(' + soundName;
    exp += ', "' + src + '"';
    exp += ', ' + loops;
    exp += ', ' + cb + ')';

    stop(type);

    krpano.call(exp);

    state[type].playing = true;
  }

  // 关闭音频，若type不传，则关闭所有音频
  function stop(type) {
    if(!!type) {
      krpano.call('stopsound(' + type + ')');

      state[type].playing = false;
      if(type == 'bgm') { toggleBtnBgm(false) }
      if(type == 'aud') { toggleBtnAud(false) }
    }
    else {
      krpano.call('stopallsounds()');
      for(var key in state) {
        state[key].playing = false;
      }
      toggleBtnBgm(false);
      toggleBtnAud(false);
    }
  }

  // 暂停所有音频
  function pause() {
    if(state.bgm.playing) { krpano.call('pausesound(bgm)') }
    if(state.aud.playing) { krpano.call('pausesound(aud)') }
  }

  // 恢复所有音频
  function resume() {
    if(state.bgm.playing) { krpano.call('resumesound(bgm)') }
    if(state.aud.playing) { krpano.call('resumesound(aud)') }
  }

  // 调低音量
  function volumeDown(type) {
    krpano.call('tween(sound['+type+'].volume, 0.2)');
  }

  // 恢复音量
  function resumeVolume(type) {
    krpano.call('tween(sound['+type+'].volume, 1)');
  }

  // 自动播放，场景切换时触发
  function autoPlay() {
    var currentScene = krpano.get('xml.scene');

    // get bgm and aud path of current scene
    getCurrentData();

    // if current scene has bgm then play bgm, turn on btn bgm
    if(!!state.bgm.src) {
      if(state.bgm.changed) {
        play('bgm', state.bgm.src)
        toggleBtnBgm(true);
      }
    }
    // else turn off btn bgm and bgm
    else {
      stop('bgm');
      toggleBtnBgm(false);
    }

    // if current scene has aud then volume down bgm, play aud, turn on btn aud
    if(state.aud.src) {
      if(state.aud.changed) {
        play('aud', state.aud.src, 'tween(sound[bgm].volume, 1);plugin[btn_audio_cmt].toggle(false);plugin[audiotool].stop(aud);');
        volumeDown('bgm');
        toggleBtnAud(true);
      }
    }
    // else turn off btn aud
    else {
      stop('aud');
      toggleBtnAud(false);
    }

    // isMobile && document.body.removeEventListener('touchstart', autoPlay);
  }

  function toggleBtnBgm(isPressed) {
    krpano.call('plugin[btn_bgm].toggle('  + isPressed.toString() + ')');
    if(analyse) {
      krpano.call(analyse + '(bgm, ' + (isPressed ? 'open' : 'close') + ')');
    }
  }

  function toggleBtnAud(isPressed) {
    krpano.call('plugin[btn_audio_cmt].toggle('  + isPressed.toString() + ')');
    if(analyse) {
      krpano.call(analyse + '(audio_cmt, ' + (isPressed ? 'open' : 'close') + ')');
    }
  }

  function toggleBgm() {
    getCurrentData();

    if(state.bgm.playing) {
      stop('bgm');
      toggleBtnBgm(false);
    }
    else {
      play('bgm', state.bgm.src);
      toggleBtnBgm(true)
    }
  }

  function toggleAud() {
    getCurrentData();

    if(state.aud.playing) {
      stop('aud');
      resumeVolume('bgm');
    }
    else {
      play('aud', state.aud.src, 'tween(sound[bgm].volume, 1);plugin[btn_audio_cmt].toggle(false);plugin[audiotool].stop(aud);');
      toggleBtnAud(true);
      volumeDown('bgm');
    }
  }

  // function force2autoplay() {
  //   document.body.addEventListener('touchstart', autoPlay);
  // }
}
