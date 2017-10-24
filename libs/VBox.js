//vbox模型
function VBox(lowerIndex, upperIndex, colorArray) {
  this._lowerIndex = lowerIndex;
  this._upperIndex = upperIndex;
  this._distinctColors = colorArray;
  this._minRed = 0;
  this._maxRed = 0;
  this._minGreen = 0;
  this._maxGreen = 0;
  this._minBlue = 0;
  this._maxBlue = 0;
  this._population = 0;
  this.fitBox();
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
    count = count + hist[color];

    r = PaletteColor.quantizedRed(color);
    g = PaletteColor.quantizedGreen(color);
    b = PaletteColor.quantizedBlue(color);

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
VBox.prototype.canSplit = function(){
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
VBox.prototype.findSplitPoint = function(){
  var longestDimesion = this.getLongestColorDimension();
  this.modifySignificantOctetWithDismension(longestDimesion, this._lowerIndex, this._upperIndex);
  this.sortColorArray();
  this.modifySignificantOctetWithDismension(longestDimesion, this._lowerIndex, this._upperIndex);

  var midPoint = this._population / 2;
  var population = 0;
  for (var i = this._lowerIndex, count = 0; i <= this._upperIndex ; i++)  {
      population = hist[this._distinctColors[i]];
      count += population;
      if (count >= midPoint) {
          return i !== this._lowerIndex ? (i-1) : i;
      }
  }
  return this._lowerIndex;
}
VBox.prototype.getLongestColorDimension = function() {
  var redLength = this._maxRed - this._minRed;
  var greenLength = this._maxGreen - this._minGreen;
  var blueLength = this._maxBlue - this._minBlue;

  if (redLength >= greenLength && redLength >= blueLength) {
    return COMPONENT_RED;
  } else if (greenLength >= redLength && greenLength >= blueLength) {
    return COMPONENT_GREEN;
  } else {
    return COMPONENT_BLUE;
  }
}
VBox.prototype.modifySignificantOctetWithDismension = function(dimension, lower, upper) {
  switch (dimension) {
    case COMPONENT_RED:
      // Already in RGB, no need to do anything
      break;
    case COMPONENT_GREEN:
      // We need to do a RGB to GRB swap, or vice-versa
      for (var i = lower; i <= upper; i++) {
          var color = this._distinctColors[i];
          var newColor = PaletteColor.quantizedGreen(color) << (QUANTIZE_WORD_WIDTH + QUANTIZE_WORD_WIDTH) |
            PaletteColor.quantizedRed(color)  << QUANTIZE_WORD_WIDTH | PaletteColor.quantizedBlue(color);
          this._distinctColors[i] = newColor;
      }
      break;
    case COMPONENT_BLUE:
      // We need to do a RGB to BGR swap, or vice-versa
      for (var i = lower; i <= upper; i++) {
          var color = this._distinctColors[i];
          var newColor =  PaletteColor.quantizedBlue(color) << (QUANTIZE_WORD_WIDTH + QUANTIZE_WORD_WIDTH) |
            PaletteColor.quantizedGreen(color)  << QUANTIZE_WORD_WIDTH |
            PaletteColor.quantizedRed(color);
          this._distinctColors[i] = newColor;
      }
      break;
    }
}
VBox.prototype.sortColorArray = function(){
    // Now sort... Arrays.sort uses a exclusive toIndex so we need to add 1

    var sortCount = (this._upperIndex - this._lowerIndex) + 1;
    var sortArray = [];
    var sortIndex = 0;

    for (var index = this._lowerIndex; index<= this._upperIndex; index++){
        sortArray[sortIndex] = this._distinctColors[index];
        sortIndex++;
    }

    var arrayLength = sortIndex;
    var isSorted = true, temp = null;

    //bubble sort冒泡排序
    for(var i = 0; i < arrayLength - 1; i++)
    {
        for(var j=0; j< arrayLength- 1 - i; j++)
        {
            if(sortArray[j] > sortArray[j+1])
            {
                isSorted = false;
                temp = sortArray[j];
                sortArray[j] = sortArray[j+1];
                sortArray[j + 1]=temp;
            }
        }
        if(isSorted)
            break;
    }

    sortIndex = 0;
    for (var index = this._lowerIndex; index <= this._upperIndex; index++){
        this._distinctColors[index] = sortArray[sortIndex];
        sortIndex++;
    }
}
VBox.prototype.getVolume = function() {
  var volume = (this._maxRed - this._minRed + 1) * (this._maxGreen - this._minGreen + 1) * (this._maxBlue - this._minBlue + 1);
  return volume;
}
VBox.prototype.getAverageColor = function() {
  var redSum = 0;
  var greenSum = 0;
  var blueSum = 0;
  var totalPopulation = 0;

  for (var i = this._lowerIndex; i <= this._upperIndex; i++) {
      var color = this._distinctColors[i];
      var colorPopulation = hist[color];

      totalPopulation += colorPopulation;

      redSum += colorPopulation * PaletteColor.quantizedRed(color);
      greenSum += colorPopulation * PaletteColor.quantizedGreen(color);
      blueSum += colorPopulation * PaletteColor.quantizedBlue(color);
  }

  //in case of totalPopulation equals to 0
  if (totalPopulation <= 0){
      return null;
  }

  var redMean = redSum / totalPopulation;
  var greenMean = greenSum / totalPopulation;
  var blueMean = blueSum / totalPopulation;

  redMean = PaletteColor.modifyWordWidthWithValue(redMean, QUANTIZE_WORD_WIDTH, 8);
  greenMean = PaletteColor.modifyWordWidthWithValue(greenMean, QUANTIZE_WORD_WIDTH, 8);
  blueMean = PaletteColor.modifyWordWidthWithValue(blueMean, QUANTIZE_WORD_WIDTH,8);

  var rgb888Color = redMean << 2 * 8 | greenMean << 8 | blueMean;
  var swatch = new Swatch(rgb888Color, totalPopulation);

  return swatch;
}
