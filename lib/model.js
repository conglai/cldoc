'use strict';
const fs = require('fs');
module.exports = function(dirs) {

  //## 获取模板路径
  function getTpl(tplName) {
    for (let i = 0, l = dirs.length; i < l ; i++) {
      let modelDir = dirs[i];
      if(fs.existsSync(`${modelDir}/${tplName}`)) {
        return `${modelDir}/${tplName}`;
      }
    }
    return false;
  }

  let modelMap = {};
  //## 获取模型数据
  function getModel(modelKey) {
    if(!modelMap[modelKey]) {
      let modelPath = getTpl(modelKey);
      if(!modelPath) {
        modelMap[modelKey] = '';
      } else {
        let modelStr = fs.readFileSync(modelPath, 'utf8');
        modelStr = modelStr.replace(/\n+$/, '');
        modelMap[modelKey] = modelStr;
      }
    }
    return modelMap[modelKey];
  }
  return {
    getTpl,
    getModel
  };
};
