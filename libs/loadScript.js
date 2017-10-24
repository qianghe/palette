function loadScript(url, callback){
  var script = document.createElement('script');
  script.type = 'text/javascript';

  if(script.readyState){
    script.onreadystatechange = function(){
      if(script.readyState === 'loaded' || script.readyState === 'completed') {
        script.onreadystatechange = null;
        if(callback) callback();
      }
    }
  }else{
    script.onload = function(){
      if(callback) callback();
    }
  }

  script.src = url;
  document.getElementsByTagName('head')[0].appendChild(script);
}

//要动态加载的js文件
var array = ['libs/constant.js', 'libs/PaletteColor.js', 'libs/PaletteTarget.js', 'libs/PriorityBoxArray.js',
  'libs/swatch.js', 'libs/VBox.js','libs/Palette.js'];
console.log('excute');
array.forEach(function(file,index){
  console.log('hahah');
  loadScript(file);
})
