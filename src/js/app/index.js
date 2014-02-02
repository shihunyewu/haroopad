var gui = require('nw.gui');

window.top = window;
window.nw = gui.Window.get();
window.ee = new EventEmitter();

//fixed text.js error on node-webkit
require.nodeRequire = require;

/**
 * require.js 환경 설정
 */
requirejs.config({
  baseUrl: 'js/app',
  waitSeconds: 30,
  locale: 'ko-kr',
  paths: {
    tpl: '../../tpl',
    vendors: '../vendors',
    keyboard: '../vendors/keymage/keymage',
    parse: 'core/Parser'
  },
  config: {
    text: {
      env: 'xhr'
    }
  }
});

requirejs.onError = function (e) {
  console.log(e)
  alert('Oops! app is crash :-(');
};

i18n.init({
  lng: global.LOCALES._lang
}, function() {
  i18n.addResourceBundle(global.LOCALES._lang, 'menu', global.LOCALES['menu']);
  i18n.setDefaultNamespace('menu');

  MenuBar();

  requirejs([
    'context/Context',
    'mail/Mailer',
    'window/Window',
    'window/WindowManager',
    'utils/UpdateNotifier',
    'math/Math'
  ], function(Context, Mailer, Window, WindowMgr, Updater) {

    // window.ee.on('change.markdown', function(md, options, cb) {
    //   cb = typeof options === 'function' ? options : cb;
    //   options = typeof options === 'object' ? options : undefined;
      
    //   var html = Parser(md, options);

    global._gaq.init(function(_gaq) {
      _gaq.push('haroopad', 'init', '');
    });

    window.ee.on('send.email', function(fileInfo, mailInfo) {
      var child = WindowMgr.actived;
      var Emails = store.get('Emails') || {};
      var addrs = Emails.addrs || [];

      Mailer.setCredential(mailInfo);
      Mailer.send(mailInfo, fileInfo, function(err, response) {

        if (err) {
          child.window.ee.emit('fail.send.email', err);
          return;
        }

        if (mailInfo.remember) {
          addrs.push(mailInfo.to);
          addrs = _.uniq(addrs);

          store.set('Emails', {
            to: mailInfo.to,
            from: mailInfo.from,
            mode: mailInfo.mode,
            addrs: addrs,
            remember: mailInfo.remember
          });
        }

        child.window.ee.emit('sent.email');
      });
    })
    
    var os = getPlatformName();
    gui.App.on('open', function(cmdline) {
      var file;

      switch(os) {
        case 'windows':
          //"z:\Works\haroopad\" --original-process-start-time=1302223754723848
          //"z:\Works\haroopad\" --original-process-start-time=1302223754723848 "z:\Works\filename.ext"
          if (cmdline.split('"').length >= 5) {
            cmdline = cmdline.split('"');
            cmdline.pop();
            
            file = cmdline.pop();
          }
        break;
        case 'mac':
          file = cmdline;
        break;
        case 'linux':
          cmdline = cmdline.split(' ');
          cmdline.shift();

          file = cmdline.join(' ');
        break;
      }
        
      WindowMgr.open(file);
    });


    //open file with commend line
    if (gui.App.argv.length > 0) {
      var file;
      
      switch(os) {
        case 'windows':
          file = gui.App.argv[0];
        break;
        case 'mac':
          file = gui.App.argv[0];
        break;
        case 'linux':
          file = gui.App.fullArgv.join(' ');  //it's bug
        break;
      }

      WindowMgr.open(file);
    } else {
      WindowMgr.open();
    }
  });

});