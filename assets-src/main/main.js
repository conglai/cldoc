hljs.initHighlightingOnLoad();
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
