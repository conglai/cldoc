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
function imgFunc(config) {
  let { ratio, canWebp, mode } = config;
  mode = mode || 1;
  ratio = ratio || 1;
  let formatStr = '';
  if(canWebp) {
    formatStr = '/format/webp';
  }

  function loadImg(imgNode) {
    let w = imgNode.width();
    let h = getNodeHeight(imgNode);
    let src = imgNode.data('img');
    let wNum = Math.floor(w * ratio);
    let hNum = Math.floor(h * ratio);
    let imgPath = `${src}?imageView2/${mode}/w/${wNum}/h/${hNum}${formatStr}`;
    let imgObj = new Image();
    imgObj.onload = () => {
      imgNode.css({
        backgroundImage: `url('${imgPath}')`,
        backgroundSize: `cover`,
        backgroundPosition: `0px 0px`,
      });
    };
    imgObj.src = imgPath;
  }
  let imgArr = [];
  return {
    addImages: function(imgs) {
      imgArr = imgArr.concat(imgs);
    },
    clearImages: function() {
      imgArr = [];
    },
    check: function(scrollTop, viewHeight) {
      imgArr.forEach(imgNode => {
        let { top } = imgNode.offset();
        let height = getNodeHeight(imgNode);
        let topInView = top > scrollTop && top < scrollTop + viewHeight;
        let bottomInView = top + height > scrollTop && top + height < scrollTop + viewHeight;
        let inView = topInView || bottomInView;
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
});
