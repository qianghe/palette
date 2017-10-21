onmessage = function (evt){
  //通过canvas获取的图片像素值，共widht*height个像素，每个像素由raba四个值构成
  var data = evt.data;
  Palette.init(data);
  // postMessage( d );//将获取到的数据发送会主线程
}

var Palette = {
  pixelCount: 0,
  rawData : null,
  width: 0,
  height: 0,
  QUANTIZE_WORD_WIDTH: 5,
  QUANTIZE_WORD_MASK_COLOR: (1 >> this.QUANTIZE_WORD_WIDTH) - 1,
  kMaxColorNum: 16,
  hist: [],
  distinctColors: [],
  distinctColorCount: 0,
  distinctColorIndex: 0,
  swatchArray: [],
  maxPopulation: 0,
  init(data){
    this.rawData = data.data;
    this.pixelCount = this.rawData.length;
    this.width = data.width;
    this.height = data.height;
    //根据选择的模式初始化目标对象
    this.initTargetsWithMode();
    //初始化直方图
    this.initHist();
    //提取量化后的每种颜色
    this.initDistanctColors();
    //量化参数swatch:color and population
    this.quantizedSwatches();
    this.findMaxPopulation();
    this.getSwatchForTarget();
  },
  initTargetsWithMode() {
    
  }
  initHist() {
    var red, green, blue, quantizedColor;
    for (var pixelIndex = 0; pixelIndex < this.pixelCount; pixelIndex++) {
      red = this.rawData[pixelIndex * 4 + 0];
      green = this.rawData[pixelIndex * 4 + 1];
      blue = this.rawData[pixelIndex * 4 + 2];

      red = this.modifyWordWidthWithValue(red, 8, this.QUANTIZE_WORD_WIDTH);
      green = this.modifyWordWidthWithValue(green, 8, this.QUANTIZE_WORD_WIDTH);
      blue = this.modifyWordWidthWithValue(blue, 8, this.QUANTIZE_WORD_WIDTH);

      quantizedColor = red << 2 * this.QUANTIZE_WORD_WIDTH | green << this.QUANTIZE_WORD_WIDTH | blue;
      this.hist[quantizedColor] = this.hist[quantizedColor] ? this.hist[quantizedColor] + 1 : 1;
    }
    console.log('hist',this.hist);
  },
  initDistanctColors(){
    var length = this.hist.length;
    for (var color = 0; color < length; color++){
        var count = this.hist[color]
        if (count > 0){
          this.distinctColorCount++;
          this.distinctColors[this.distinctColorIndex++] = color;
        }
    }

    this.distinctColorIndex--;
    console.log(this.distinctColors);
  },
  quantizedSwatches() {
    var color, population, red, green, blue, swatch;
    for(var i = 0; i < this.distinctColorCount; i++){
      color = this.distinctColors[i];
      population = this.hist[color];

      red = this.quantizedRed(color);
      green = this.quantizedGreen(color);
      blue = this.quantizedBlue(color);

      color = red << 2 * 8 | green << 8 | blue;
      swatch = new Swatch(color, population);
      this.swatchArray.push(swatch);
    }
    console.log('swatchArray',this.swatchArray);
  },
  findMaxPopulation() {
    var max = 0;
    var swatch = null, swatchPopulation = 0;
    for (var i = 0; i < this.swatchArray.length; i++){
      swatch = this.swatchArray[i];
      swatchPopulation = swatch.getPopulation();
      max =  Math.max(max, swatchPopulation);
    }
    this.maxPopulation = max;
    console.log('mp',this.maxPopulation);
  },
  getSwatchForTarget() {

  },
  modifyWordWidthWithValue(value, currentWidth, targetWidth) {
    var newValue;
    if (targetWidth > currentWidth) {
        // If we're approximating up in word width, we'll use scaling to approximate the
        // new value
        newValue = value * ((1 << targetWidth) - 1) / ((1 << currentWidth) - 1);
    } else {
        // Else, we will just shift and keep the MSB
        newValue = value >> (currentWidth - targetWidth);
    }
    return newValue & ((1 << targetWidth) - 1);
  },
  quantizedRed(color) {
    var red =  (color >> 2 * this.QUANTIZE_WORD_WIDTH) & this.QUANTIZE_WORD_MASK_COLOR;
    return red;
  },
  quantizedGreen(color) {
    var green = (color >> this.QUANTIZE_WORD_WIDTH_COLOR) & this.QUANTIZE_WORD_MASK_COLOR;
    return green;
  },
  quantizedBlue(color) {
    var blue = color & this.QUANTIZE_WORD_MASK_COLOR;
    return blue;
  }
};


//swatch模型
function Swatch(color, population){
  this._red = this.approximateRed(color);
  this._green = this.approximateGreen(color);
  this._blue = this.approximateBlue(color);
  this._population = population;
}

Swatch.prototype.getPopulation = function(){
  return this._population;
}
Swatch.prototype.approximateRed = function(color){
  return (color >> (8 + 8)) & ((1 << 8) - 1);
}
Swatch.prototype.approximateGreen = function(color) {
  return color >> 8 & ((1 << 8) - 1);
}
Swatch.prototype.approximateBlue = function(color) {
  return color  & ((1 << 8) - 1);
}
