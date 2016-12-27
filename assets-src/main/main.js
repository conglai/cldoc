hljs.initHighlightingOnLoad();

//## 监听滚动
function lazyScroll(checkFunc, time){
  time = time || 100;
  var timer;
  var lastTime = Date.now();
  checkFunc();
  $(window).on('scroll', function() {
    var currentTime = Date.now();
    if(timer) {
      clearTimeout(timer);
      timer = null;
    }
    if(currentTime - lastTime > time) {
      lastTime = currentTime;
      checkFunc();
    } else {
      timer = setTimeout(function() {
        checkFunc();
      }, time);
    }
  });
}
function getNodeHeight(node) {
  return node.innerHeight ? node.innerHeight(): node.height();
}
function checkWebp(cb) {
  var img = new Image();
  img.onload = function() {
    cb(img.height === 1);
  };
  img.src = 'data:image/webp;base64,UklGRiYAAABXRUJQVlA4IBoAAAAwAQCdASoBAAEAAAAMJaQAA3AA/v89WAAAAA==';
}
function imgFunc() {
  var canUseWebp = window.navigator.userAgent.indexOf('Chrome') !== -1;
  if(!canUseWebp) {
    checkWebp(function(isWebp) {
      canUseWebp = isWebp;
    });
  }
  var ratio = window.devicePixelRatio || 1;

  function loadImg(imgNode) {
    var w = imgNode.width();
    var h = getNodeHeight(imgNode);
    var aspect = imgNode.data('aspect');
    aspect = Number(aspect);
    if(aspect) {
      h = Math.floor(w * aspect);
    } else {
      h = getNodeHeight(imgNode);
    }
    var srcTpl = imgNode.data('src-tpl');
    var wNum = Math.floor(w * ratio);
    var hNum = Math.floor(h * ratio);
    var formatStr = canUseWebp ? 'webp': 'jpg';

    var imgPath = srcTpl.replace('{{w}}', wNum)
      .replace('{{h}}', hNum)
      .replace('{{format}}', formatStr);
    var imgObj = new Image();
    imgObj.onload = function() {
      var cssObj = {
        backgroundImage: 'url("' + imgPath + '")',
        backgroundSize: 'cover',
        backgroundPosition: '0px 0px',
      };
      if(aspect) {
        cssObj.height = h;
      }
      imgNode.css(cssObj);
    };
    imgObj.src = imgPath;
  }
  var imgArr = [];
  return {
    addImages: function(imgs) {
      imgArr = imgArr.concat(imgs);
    },
    clearImages: function() {
      imgArr = [];
    },
    check: function(scrollTop, viewHeight) {
      imgArr.forEach(function(imgNode) {
        var top = imgNode.offset().top;
        var height = getNodeHeight(imgNode);
        var topInView = top > scrollTop && top < scrollTop + viewHeight;
        var bottomInView = top + height > scrollTop && top + height < scrollTop + viewHeight;
        var inView = topInView || bottomInView;
        if(!imgNode._loading && inView) {
          imgNode._loading = true;
          loadImg(imgNode);
        }
      });
    },
    loadImg: loadImg
  };
}

$(function(){
  var currentPath = location.pathname;
  var win = window;
  var filename = currentPath.split('/');
  filename = filename[filename.length - 1];
  filename = filename || 'index.html';

  $('.J_navItem').each(function(i, item){
    var node = $(item);
    var tabSize = node.data('tab-size');
    var itemUrl = node.data('url');
    if(filename === itemUrl) {
      node.addClass('active');
    }
  });
  var imgs = [];
  $('.J_lazyImg').each(function(i, img){
    imgs.push($(img));
  });
  var imgTool = imgFunc();
  imgTool.addImages(imgs);

  var viewHeight = $(win).height();
  lazyScroll(function(){
    var scrollTop = $(win).scrollTop();
    imgTool.check(scrollTop, viewHeight);
  }, 300);
});
