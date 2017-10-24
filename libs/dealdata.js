onmessage = function (evt){
  //通过canvas获取的图片像素值，共widht*height个像素，每个像素由raba四个值构成
  console.log(window.paletteObject);
  var data = evt.data;
  var palette = new Palette();
  var resp = Palette.init(data);

  postMessage(resp);//将获取到的数据发送会主线程
}
