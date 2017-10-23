onmessage = function (evt){
  //通过canvas获取的图片像素值，共widht*height个像素，每个像素由raba四个值构成
  var data = evt.data;
  postMessage(Palette.init(data));//将获取到的数据发送会主线程
}

// vibrant-鲜艳度  muted-柔和度 saturation-饱和度


var DEFAULT_NON_MODE_PALETTE = 0;//if you don't need the ColorDic(including modeKey-colorModel key-value)
var VIBRANT_PALETTE = 1 << 0;
var LIGHT_VIBRANT_PALETTE = 1 << 1;
var DARK_VIBRANT_PALETTE = 1 << 2;
var LIGHT_MUTED_PALETTE = 1 << 3;
var MUTED_PALETTE = 1 << 4;
var DARK_MUTED_PALETTE = 1 << 5;
var ALL_MODE_PALETTE = 1 << 6;



var modes = [
  VIBRANT_PALETTE, LIGHT_VIBRANT_PALETTE, DARK_VIBRANT_PALETTE,
  LIGHT_MUTED_PALETTE, MUTED_PALETTE, DARK_MUTED_PALETTE
];
var curMode = MUTED_PALETTE;

var PaletteColor = {
  QUANTIZE_WORD_WIDTH: 5,
  QUANTIZE_WORD_MASK_COLOR: (1 >> 5) - 1,
  quantizedRed(color) {
    var red =  (color >> (this.QUANTIZE_WORD_WIDTH_COLOR + this.QUANTIZE_WORD_WIDTH_COLOR)) & this.QUANTIZE_WORD_MASK_COLOR;
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

var Palette = {
  pixelCount: 0,
  rawData : null,
  width: 0,
  height: 0,
  kMaxColorNum: 16,
  hist: [],
  distinctColors: [],
  distinctColorCount: 0,
  distinctColorIndex: 0,
  swatchArray: [],
  maxPopulation: 0,
  targetArray: [],
  isNeedColorDic: false,
  finalDic: [],
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

    return this.finalDic;
  },
  initTargetsWithMode() {
    var vibrantTarget = null;
    var that = this;
    curMode;

    if (curMode < VIBRANT_PALETTE || curMode > ALL_MODE_PALETTE || curMode == ALL_MODE_PALETTE) {
      modes.forEach(function(mode){
        vibrantTarget = new PaletteTarget(mode);
        vibrantTarget.initWithTargetMode();
        that.targetArray.push(vibrantTarget);
      });
    } else {
      var modeName = 0;
      switch (curMode) {
        case (1 << 0) :
          modeName = VIBRANT_PALETTE;
          break;
        case (1 << 1) :
          modeName = LIGHT_VIBRANT_PALETTE;
          break;
        case (1 << 2):
          modeName = DARK_VIBRANT_PALETTE;
          break;
        case (1 << 3):
          modeName = LIGHT_MUTED_PALETTE;
          break;
        case (1 << 4):
          modeName = MUTED_PALETTE;
          break;
        case (1 << 5):
          modeName = DARK_MUTED_PALETTE;
          break;

      }

      vibrantTarget = new PaletteTarget(modeName);
      vibrantTarget.initWithTargetMode();
      this.targetArray.push(vibrantTarget);
    }

    if (curMode >= VIBRANT_PALETTE && curMode <= ALL_MODE_PALETTE){
        this.isNeedColorDic = true;
    }
  },
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
  },
  quantizedSwatches() {
    var color, population, red, green, blue, swatch, vbox, priorityArray = [];

    if(this.distinctColorIndex <= this.kMaxColorNum){
      for(var i = 0; i < this.distinctColorCount; i++){
        color = this.distinctColors[i];
        population = this.hist[color];

        red = PaletteColor.quantizedRed(color);
        green = PaletteColor.quantizedGreen(color);
        blue = PaletteColor.quantizedBlue(color);

        color = red << 2 * 8 | green << 8 | blue;
        swatch = new Swatch(color, population);
        this.swatchArray.push(swatch);
      }
    } else {
      console.log('超过了');
      vbox = new VBox(0, this.distinctColorIndex, this.distinctColors);
      priorityArray.push(vbox);
      this.splitBoxes(priorityArray);
      this.swatchArray = this.generateAverageColors(priorityArray);
    }

    console.log(this.swatchArray);
  },
  splitBoxes(queue) {
    //queue is a priority queue.
    var vbox = null;

    while (queue.length < this.kMaxColorNum) {
      vbox = queue.shift();
      if (vbox && vbox.canSplit()) {
        // First split the box, and offer the result
        [queue addVBox:[vbox splitBox]];
        queue.push(vbox.splitBox());
        // Then offer the box back
        [queue addVBox:vbox];
      }else{
        console.log("All boxes split");
        return;
      }
    }
  },
  generateAverageColors(array) {
    var swatchs = [], vboxArray = [];

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
  },
  getSwatchForTarget() {
    var target = null, swatch = null, colorModel = null;
    for(var i = 0; i < this.targetArray.length; i++){
      target = this.targetArray[i];
      target.normalizeWeights();

      swatch = this.getMaxScoredSwatchForTarget(target);
      if (swatch) {
        colorModel = {
          imageColorString: swatch.getColorString(),
          percentage: swatch.getPopulation() / this.pixelCount
        };

        if(colorModel){
          this.finalDic.push(colorModel);
        }
      }
    }

    console.log('last one', this.finalDic);
  },
  getMaxScoredSwatchForTarget(target) {
    var swatch = null, maxScoreSwatch = null, score = 0, maxScore = 0;

    for(var i = 0; i < this.swatchArray.length; i++){
      swatch = this.swatchArray[i];
      if(this.shouldBeScoredForTarget(swatch, target)){
        score = this.generateScoreForTarget(target, swatch);
        if (maxScore == 0 || score > maxScore){
            maxScoreSwatch = swatch;
            maxScore = score;
        }
      }
    }

    return maxScoreSwatch;
  },
  shouldBeScoredForTarget(swatch, target) {
    var hsl = swatch.getHsl();
    return hsl[1] >= target.getMinSaturation() && hsl[1] <= target.getMaxSaturation() &&
      hsl[2] >= target.getMinLuma() && hsl[2] <= target.getMaxLuma()
  },
  generateScoreForTarget(target, swatch) {
    var hsl = swatch.getHsl();
    var saturationScore = 0, luminanceScore = 0, populationScore = 0;

    if (target.getSaturationWeight() > 0){
      saturationScore = target.getSaturationWeight() *
        (1.0 - Math.abs(hsl[1] - target.getTargetSaturation()));
    }
    if(target.getLumaWeight() > 0){
      luminanceScore = target.getLumaWeight() *
        (1.0 - Math.abs(hsl[2] - target.getTargetLuma()))
    }
    if (target.getPopulationWeight() > 0) {
        populationScore = target.getPopulationWeight() *
         (swatch.getPopulation() / this.maxPopulation);
    }

    return saturationScore + luminanceScore + populationScore;
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
  }
};

//vbox模型
function VBox(lowerIndex, upperIndex, colorArray) {
  this._lowerIndex = lowderIndex;
  this._upperIndex = upperIndex;
  this._distinctColors = colorArray;
  this._minRed = 0;
  this._maxRed = 0;
  this._minGreen = 0;
  this._maxGreen = 0;
  this._minBlue = 0;
  this._maxBlue = 0;
  this._population = 0;
}
VBox.prototype.fitBox = function() {
  var minRed, minGreen, minBlue;
  minRed = minGreen = minBlue = 32768;
  var maxRed, maxGreen, maxBlue;
  maxRed = maxGreen = maxBlue = 0;
  var count = 0;
  var color, r, g, b;

  for (var i = this._lowerIndex; i <= this._upperIndex; i++) {
    color = this._distinctColors[i];
    count += hist[color];

    r =  PaletteColor.quantizedRed(color);
    g =  PaletteColor.quantizedGreen(color);
    b =  PaletteColor.quantizedBlue(color);

    if (r > maxRed) {
      maxRed = r;
    }
    if (r < minRed) {
      minRed = r;
    }
    if (g > maxGreen) {
      maxGreen = g;
    }
    if (g < minGreen) {
      minGreen = g;
    }
    if (b > maxBlue) {
      maxBlue = b;
    }
    if (b < minBlue) {
      minBlue = b;
    }
  }

  this._minRed = minRed;
  this._maxRed = maxRed;
  this._minGreen = minGreen;
  this._maxGreen = maxGreen;
  this._minBlue = minBlue;
  this._maxBlue = maxBlue;
  this._population = count;
}
VBox.prototype.canSplit = funciton(){
    if ((this._upperIndex - this._lowerIndex) <= 0){
        return false;
    }
    return true;
}
VBox.prototype.splitBox = function(){
  if(!this.canSplit()) return null;

  var splitPoint = this.findSplitPoint();
  var vbox = new VBox(splitPoint + 1, this._upperIndex, this._distinctColors);

  this._upperIndex = splitPoint;
  this.fitBox();

  return vbox;
}
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
Swatch.prototype.getColorString = function(){
  return "#" + this._red.toString(16) + this._green.toString(16) + this._blue.toString(16);
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
Swatch.prototype.constrain = function(amount, low, high) {
  return amount > high ? high  : amount < low ? low : amount;
}
Swatch.prototype.getHsl = function() {
    var rf, gf, bf;
    var max,min;
    rf = parseFloat(this._red /255.0);
    gf = parseFloat(this._green / 255);
    bf = parseFloat(this._blue / 255);
    max = Math.max(rf, gf) > bf ? Math.max(rf, gf) : bf;
    min = Math.min(rf, gf) < bf ? Math.min(rf, gf) : bf;

    var deltaMaxMin = max - min;
    var l = (max+min)/2.0;
    var h = 0, s = 0;

    if(max == min){
      h = s = 0.0;
    }else{
      if (max == rf){
//            h = (gf - bf)/deltaMaxMin % 6.0F;
      }else{
        if (max == gf){
           h = (bf - rf)/deltaMaxMin + 2.0;
        }else{
          h = (rf - gf)/deltaMaxMin + 4.0;
        }
      }
    }
    s = deltaMaxMin / (1.0 - Math.abs(2.0 * l - 1.0));
//    h = h * 60.0F % 360.0F;
    if (h < 0.0){
        h += 360.0;
    }
    var hsl = [];

    hsl.push(this.constrain(h, 0.0, 360.0));
    hsl.push(this.constrain(s, 0.0, 1.0));
    hsl.push(this.constrain(l, 0.0, 1.0));

    return hsl;
}

var  TARGET_DARK_LUMA = 0.26;
var  MAX_DARK_LUMA = 0.45;

var  MIN_LIGHT_LUMA = 0.55;
var  TARGET_LIGHT_LUMA = 0.74;

var  MIN_NORMAL_LUMA = 0.3;
var  TARGET_NORMAL_LUMA = 0.5;
var  MAX_NORMAL_LUMA = 0.7;

var  TARGET_MUTED_SATURATION = 0.3;
var  MAX_MUTED_SATURATION = 0.4;

var  TARGET_VIBRANT_SATURATION = 1.0;
var  MIN_VIBRANT_SATURATION = 0.35;

var  WEIGHT_SATURATION = 0.24;
var  WEIGHT_LUMA = 0.52;
var  WEIGHT_POPULATION = 0.24;

var  INDEX_MIN = 0;
var  INDEX_TARGET = 1;
var  INDEX_MAX = 2;

var  INDEX_WEIGHT_SAT = 0;
var  INDEX_WEIGHT_LUMA = 1;
var  INDEX_WEIGHT_POP = 2;
//目标模型
function PaletteTarget(mode) {
  this._mode = mode;
  this._saturationTargets = [];
  this._lightnessTargets = [];
  this._weights = [];
}

PaletteTarget.prototype.initWithTargetMode = function(){
  //初始化各种数据
  this._weights.push(WEIGHT_SATURATION);
  this._weights.push(WEIGHT_LUMA);
  this._weights.push(WEIGHT_POPULATION);

  this._lightnessTargets.push(0.0);
  this._lightnessTargets.push(0.5);
  this._lightnessTargets.push(1.0);

  this._saturationTargets.push(0.0);
  this._saturationTargets.push(0.5);
  this._saturationTargets.push(1.0);

  switch(this.mode) {
    case LIGHT_VIBRANT_PALETTE:
        this.setDefaultLightLuma();
        this.setDefaultVibrantSaturation();
        break;
    case VIBRANT_PALETTE:
        this.setDefaultNormalLuma();
        this.setDefaultVibrantSaturation();
        break;
    case DARK_VIBRANT_PALETTE:
        this.setDefaultDarkLuma();
        this.setDefaultVibrantSaturation();
        break;
    case LIGHT_MUTED_PALETTE:
        this.setDefaultLightLuma();
        this.setDefaultMutedSaturation();
        break;
    case MUTED_PALETTE:
        this.setDefaultNormalLuma();
        this.setDefaultMutedSaturation();
        break;
    case DARK_MUTED_PALETTE:
        this.setDefaultDarkLuma();
        this.setDefaultMutedSaturation();
        break;
    default:
        break;
  }
}
PaletteTarget.prototype.getTargetKey = function() {
  switch (this._mode) {
      case LIGHT_VIBRANT_PALETTE:
          key = "light_vibrant";
          break;
      case VIBRANT_PALETTE:
          key = "vibrant";
          break;
      case DARK_VIBRANT_PALETTE:
          key = "dark_vibrant";
          break;
      case LIGHT_MUTED_PALETTE:
          key = "light_muted";
          break;
      case MUTED_PALETTE:
          key = "muted";
          break;
      case DARK_MUTED_PALETTE:
          key = "dark_muted";
          break;
      default:
          break;
  }
  return key;
}
PaletteTarget.prototype.setDefaultLightLuma = function() {
  this._lightnessTargets[INDEX_MIN] = MIN_LIGHT_LUMA;
  this._lightnessTargets[INDEX_TARGET] = TARGET_LIGHT_LUMA;
}

PaletteTarget.prototype.setDefaultVibrantSaturation = function() {
  this._saturationTargets[INDEX_MIN] = MIN_VIBRANT_SATURATION;
  this._saturationTargets[INDEX_TARGET] = TARGET_VIBRANT_SATURATION;
}

PaletteTarget.prototype.setDefaultNormalLuma = function() {
  this._lightnessTargets[INDEX_MIN] = MIN_NORMAL_LUMA;
  this._lightnessTargets[INDEX_TARGET] = TARGET_NORMAL_LUMA;
  this._lightnessTargets[INDEX_MAX] = MAX_NORMAL_LUMA;
}

PaletteTarget.prototype.setDefaultDarkLuma = function() {
  this._lightnessTargets[INDEX_TARGET] = TARGET_DARK_LUMA;
  this._lightnessTargets[INDEX_MAX] = MAX_DARK_LUMA;
}

PaletteTarget.prototype.setDefaultMutedSaturation = function() {
  this._saturationTargets[INDEX_TARGET] = TARGET_MUTED_SATURATION;
  this._saturationTargets[INDEX_MAX] = MAX_MUTED_SATURATION;
}
PaletteTarget.prototype.getMinSaturation = function() {
  return this._saturationTargets[INDEX_MIN];
}
PaletteTarget.prototype.getMaxSaturation = function() {
  var maxIndex;
  maxIndex = Math.min(INDEX_MAX, this._saturationTargets.length - 1);
  return this._saturationTargets[maxIndex];
}
PaletteTarget.prototype.getMinLuma = function() {
  return this._lightnessTargets[INDEX_MIN];
}
PaletteTarget.prototype.getMaxLuma = function() {
  var maxIndex;
  maxIndex = INDEX_MAX >= this._lightnessTargets.lenght ? this._lightnessTargets.length : INDEX_MAX;
  return this._lightnessTargets[maxIndex];
}
PaletteTarget.prototype.getSaturationWeight = function() {
  return this._weights[INDEX_WEIGHT_SAT];
}
PaletteTarget.prototype.getLumaWeight = function() {
  return this._weights[INDEX_WEIGHT_LUMA];
}
PaletteTarget.prototype.getPopulationWeight = function() {
  return this._weights[INDEX_WEIGHT_POP];
}
PaletteTarget.prototype.getTargetSaturation = function() {
  return this._saturationTargets[INDEX_TARGET];
}
PaletteTarget.prototype.getPopulationWeight = function() {
  return this._lightnessTargets[INDEX_TARGET];
}
PaletteTarget.prototype.getTargetLuma = function() {
  return this._saturationTargets[INDEX_TARGET];
}
PaletteTarget.prototype.normalizeWeights = function() {
  var sum = 0, weight = 0, i = 0, z= 0;
  for(i = 0, z= this._weights.length; i < z; i++) {
    weight = this._weights[i];
    if(weight > 0) sum += weight;
  }

  if(sum){
    for(i = 0, z= this._weights.length; i < z; i++) {
        weight = this._weights[i];
        if(weight > 0) {
          weight /= sum;
          this._weights[i] = weight;
        }
    }
  }
}
