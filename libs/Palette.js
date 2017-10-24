function Palette(){
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

Palette.prototype.init = function(data){
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
}
Palette.prototype.initHist = function() {
  var red, green, blue, quantizedColor;
  // var time = 0;
  for (var pixelIndex = 0; pixelIndex < this.pixelCount; pixelIndex++) {
    red = this.rawData[pixelIndex * 4 + 0];
    green = this.rawData[pixelIndex * 4 + 1];
    blue = this.rawData[pixelIndex * 4 + 2];

    red = PaletteColor.modifyWordWidthWithValue(red, 8, QUANTIZE_WORD_WIDTH);
    green = PaletteColor.modifyWordWidthWithValue(green, 8, QUANTIZE_WORD_WIDTH);
    blue = PaletteColor.modifyWordWidthWithValue(blue, 8, QUANTIZE_WORD_WIDTH);

    quantizedColor = red << 2 * QUANTIZE_WORD_WIDTH | green << QUANTIZE_WORD_WIDTH | blue;
    // if(quantizedColor === 21140 && !time){
    //     time++;
    //     .log(this.rawData[pixelIndex * 4 + 0], this.rawData[pixelIndex * 4 + 1], this.rawData[pixelIndex * 4 + 2]);
    // }
    hist[quantizedColor] = hist[quantizedColor] ? hist[quantizedColor] + 1 : 1;
  }
  // console.log('hist', hist);
}
Palette.prototype.initDistanctColors = function(){
  var length = hist.length;

  for (var color = 0; color < length; color++){
      var count = hist[color]
      if (count > 0){
        this.distinctColorCount++;
        this.distinctColors[this.distinctColorIndex++] = color;
      }
  }
  this.distinctColorIndex--;
}
Palette.prototype.quantizedSwatches = function(){
  var color, population, red, green, blue, swatch, vbox;

  if(this.distinctColorIndex <= kMaxColorNum){
    for(var i = 0; i < this.distinctColorCount; i++){
      color = this.distinctColors[i];
      population = hist[color];

      red = PaletteColor.quantizedRed(color);
      green = PaletteColor.quantizedGreen(color);
      blue = PaletteColor.quantizedBlue(color);

      red = PaletteColor.modifyWordWidthWithValue(red, QUANTIZE_WORD_WIDTH, 8);
      green = PaletteColor.modifyWordWidthWithValue(green, QUANTIZE_WORD_WIDTH, 8);
      blue = PaletteColor.modifyWordWidthWithValue(blue, QUANTIZE_WORD_WIDTH, 8);

      color = red << 2 * 8 | green << 8 | blue;

      swatch = new Swatch(color, population);
      this.swatchArray.push(swatch);
    }
  } else {
    console.log('超过了');
    vbox = new VBox(0, this.distinctColorIndex, this.distinctColors);
    var priorityArray = new PriorityBoxArray();
    priorityArray.addVBox(vbox);
    this.splitBoxes(priorityArray);
    this.swatchArray = this.generateAverageColors(priorityArray);
  }
  // console.log(this.swatchArray);
}
Palette.prototype.splitBoxes = function(queue) {
  //queue is a priority queue.
  var vbox = null;
  while (queue.getLength() < kMaxColorNum) {
    // vbox = queue.getTop();
    vbox = queue.poll();
    // console.log('vbox poll', vbox);
    if (vbox && vbox.canSplit()) {
      // First split the box, and offer the result
      // queue.poll();
      queue.addVBox(vbox.splitBox());
      // Then offer the box back
      queue.addVBox(vbox);
      // console.log('vbox push', vbox);
      //test
      var test = queue.getVBoxArray();
      // console.log('****************');
      // console.log('queue', queue, queue.getLength());
      // for(var i = 0;i<test.length;i++){
      //   var testbox = test[i];
      //   console.log('testbox:', testbox._lowerIndex, testbox._upperIndex);
      // }
      // console.log('****************');
    }else{
      queue.addVBox(vbox);
      console.log("All boxes split");
      return;
    }
  }
}
Palette.prototype.generateAverageColors = function(array) {
  var swatchs = [];
  var vboxArray = array.getVBoxArray();
  var swatch;

  for(var i =0 ; i < vboxArray.length ; i++){
    swatch = vboxArray[i].getAverageColor();
    if (swatch){
      swatchs.push(swatch);
    }
  }
  return swatchs;
}
Palette.prototype.findMaxPopulation = function() {
  var max = 0;
  var swatch = null, swatchPopulation = 0;
  for (var i = 0; i < this.swatchArray.length; i++){
    swatch = this.swatchArray[i];
    swatchPopulation = swatch.getPopulation();
    max =  Math.max(max, swatchPopulation);
  }
  this.maxPopulation = max;
}
Palette.prototype.getSwatchForTarget = function() {
  var target = null, swatch = null, colorModel = null;
  for(var i = 0; i < this.targetArray.length; i++){
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
  console.log('last one', this.finalDic);
}
Palette.prototype.getMaxScoredSwatchForTarget = function(target) {
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
}
Palette.prototype.shouldBeScoredForTarget = function(swatch, target) {
  var hsl = swatch.getHsl();
  return hsl[1] >= target.getMinSaturation() && hsl[1] <= target.getMaxSaturation() &&
    hsl[2] >= target.getMinLuma() && hsl[2] <= target.getMaxLuma()
}
Palette.prototype.generateScoreForTarget = function(target, swatch) {
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
}

window.paletteObject = Palette;
