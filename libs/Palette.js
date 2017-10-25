import CONFIGS from './constant.js';
import Hist from './Hist.js';
import PaletteColor from './PaletteColor.js';
import PaletteTarget from './PaletteTarget.js';
import PriorityBoxArray from './PriorityBoxArray.js';
import Swatch from './Swatch.js';
import VBox from './VBox.js';

const modes = [
 CONFIGS.VIBRANT_PALETTE, CONFIGS.LIGHT_VIBRANT_PALETTE,CONFIGS.DARK_VIBRANT_PALETTE,
 CONFIGS.LIGHT_MUTED_PALETTE, CONFIGS.MUTED_PALETTE, CONFIGS.DARK_MUTED_PALETTE
];
const curMode = CONFIGS.ALL_MODE_PALETTE;

const Palette = function(){
  this.pixelCount = 0;
  this.rawData = 0;
  this.width = 0;
  this.height = 0;
  this.distinctColors = [];
  this.distinctColorCount = 0;
  this.distinctColorIndex = 0;
  this.swatchArray = [];
  this.maxPopulation = 0;
  this.targetArray = [];
  this.isNeedColorDic = false;
  this.finalDic = [];
}
Palette.prototype.analysis = function(data){
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
  //找到最大的population值
  this.findMaxPopulation();
  //找到目标swatch
  this.getSwatchForTarget();

  return this.finalDic;
}
Palette.prototype.initTargetsWithMode = function() {
  let vibrantTarget = null;
  const that = this;

  if (curMode < CONFIGS.VIBRANT_PALETTE || curMode > CONFIGS.ALL_MODE_PALETTE || curMode == CONFIGS.ALL_MODE_PALETTE) {
    modes.forEach(mode => {
      vibrantTarget = new PaletteTarget(mode);
      vibrantTarget.initWithTargetMode();
      that.targetArray.push(vibrantTarget);
    });
  } else {
    let modeName = 0;

    switch (curMode) {
      case (1 << 0) :
        modeName = CONFIGS.VIBRANT_PALETTE;
        break;
      case (1 << 1) :
        modeName = CONFIGS.LIGHT_VIBRANT_PALETTE;
        break;
      case (1 << 2):
        modeName = CONFIGS.DARK_VIBRANT_PALETTE;
        break;
      case (1 << 3):
        modeName = CONFIGS.LIGHT_MUTED_PALETTE;
        break;
      case (1 << 4):
        modeName = CONFIGS.MUTED_PALETTE;
        break;
      case (1 << 5):
        modeName = CONFIGS.DARK_MUTED_PALETTE;
        break;

    }

    vibrantTarget = new PaletteTarget(modeName);
    vibrantTarget.initWithTargetMode();
    this.targetArray.push(vibrantTarget);
  }

  if (curMode >= CONFIGS.VIBRANT_PALETTE && curMode <= CONFIGS.ALL_MODE_PALETTE){
      this.isNeedColorDic = true;
  }
}
Palette.prototype.initHist = function() {
  let red, green, blue, quantizedColor;
  let hist = [];
  // var time = 0;
  for (let pixelIndex = 0; pixelIndex < this.pixelCount; pixelIndex++) {
    red = this.rawData[pixelIndex * 4 + 0];
    green = this.rawData[pixelIndex * 4 + 1];
    blue = this.rawData[pixelIndex * 4 + 2];

    red = PaletteColor.modifyWordWidthWithValue(red, 8, CONFIGS.QUANTIZE_WORD_WIDTH);
    green = PaletteColor.modifyWordWidthWithValue(green, 8, CONFIGS.QUANTIZE_WORD_WIDTH);
    blue = PaletteColor.modifyWordWidthWithValue(blue, 8, CONFIGS.QUANTIZE_WORD_WIDTH);

    quantizedColor = red << 2 * CONFIGS.QUANTIZE_WORD_WIDTH | green << CONFIGS.QUANTIZE_WORD_WIDTH | blue;

    hist[quantizedColor] = hist[quantizedColor] ? hist[quantizedColor] + 1 : 1;
  }
  Hist.setHist(hist);
}
Palette.prototype.initDistanctColors = function(){
  const hist = Hist.getHist();

  for (let color = 0; color < hist.length; color++){
      let count = hist[color];

      if (count > 0){
        this.distinctColorCount++;
        this.distinctColors[this.distinctColorIndex++] = color;
      }
  }
  this.distinctColorIndex--;
}
Palette.prototype.quantizedSwatches = function(){
  let color, population, red, green, blue, swatch, vbox;
  const hist = Hist.getHist();

  if(this.distinctColorIndex <= CONFIGS.kMaxColorNum){
    for(let i = 0; i < this.distinctColorCount; i++){
      color = this.distinctColors[i];
      population = hist[color];

      red = PaletteColor.quantizedRed(color);
      green = PaletteColor.quantizedGreen(color);
      blue = PaletteColor.quantizedBlue(color);

      red = PaletteColor.modifyWordWidthWithValue(red, CONFIGS.QUANTIZE_WORD_WIDTH, 8);
      green = PaletteColor.modifyWordWidthWithValue(green, CONFIGS.QUANTIZE_WORD_WIDTH, 8);
      blue = PaletteColor.modifyWordWidthWithValue(blue, CONFIGS.QUANTIZE_WORD_WIDTH, 8);

      color = red << 2 * 8 | green << 8 | blue;

      swatch = new Swatch(color, population);
      this.swatchArray.push(swatch);
    }
  } else {
    console.log('超过了');
    const priorityArray = new PriorityBoxArray();

    vbox = new VBox(0, this.distinctColorIndex, this.distinctColors);
    priorityArray.addVBox(vbox);
    this.splitBoxes(priorityArray);
    this.swatchArray = this.generateAverageColors(priorityArray);
  }
}
Palette.prototype.splitBoxes = function(queue) {
  //queue is a priority queue.
  let vbox = null;

  while (queue.getLength() < CONFIGS.kMaxColorNum) {
    vbox = queue.poll();
    if (vbox && vbox.canSplit()) {
      queue.addVBox(vbox.splitBox());
      // Then offer the box back
      queue.addVBox(vbox);
    }else{
      queue.addVBox(vbox);
      console.log("All boxes split");
      return;
    }
  }
}
Palette.prototype.generateAverageColors = function(array) {
  const swatchs = [];
  const vboxArray = array.getVBoxArray();
  let swatch;

  for(var i =0 ; i < vboxArray.length ; i++){
    swatch = vboxArray[i].getAverageColor();
    if (swatch){
      swatchs.push(swatch);
    }
  }
  return swatchs;
}
Palette.prototype.findMaxPopulation = function() {
  let max = 0, swatch = null, swatchPopulation = 0;

  for (let i = 0; i < this.swatchArray.length; i++){
    swatch = this.swatchArray[i];
    swatchPopulation = swatch.getPopulation();
    max =  Math.max(max, swatchPopulation);
  }
  this.maxPopulation = max;
}
Palette.prototype.getSwatchForTarget = function() {
  let target = null, swatch = null, colorModel = null;

  for(let i = 0; i < this.targetArray.length; i++){
    target = this.targetArray[i];
    target.normalizeWeights();

    swatch = this.getMaxScoredSwatchForTarget(target);
    if (swatch) {
      colorModel = {
        imageColorString: swatch.getColorString(),
        percentage: swatch.getPopulation() / this.pixelCount,
        mode: target.getTargetKey()
      };

      if(colorModel){
        this.finalDic.push(colorModel);
      }
    }
  }
}
Palette.prototype.getMaxScoredSwatchForTarget = function(target) {
  let swatch = null, maxScoreSwatch = null, score = 0, maxScore = 0;

  for(let i = 0; i < this.swatchArray.length; i++){
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
}
Palette.prototype.shouldBeScoredForTarget = function(swatch, target) {
  const hsl = swatch.getHsl();
  return hsl[1] >= target.getMinSaturation() && hsl[1] <= target.getMaxSaturation() &&
    hsl[2] >= target.getMinLuma() && hsl[2] <= target.getMaxLuma()
}
Palette.prototype.generateScoreForTarget = function(target, swatch) {
  const hsl = swatch.getHsl();
  let saturationScore = 0, luminanceScore = 0, populationScore = 0;

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
}

export default Palette;
