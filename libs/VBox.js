import CONFIGS from './constant.js';
import Palette from './Palette.js';
import PaletteColor from './PaletteColor.js';
import Swatch from './Swatch';
import Hist from './Hist';
//vbox模型
const VBox = function(lowerIndex, upperIndex, colorArray) {
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
  let minRed, minGreen, minBlue, maxRed, maxGreen, maxBlue;
  let count = 0,color, r, g, b;
  const hist = Hist.getHist();

  minRed = minGreen = minBlue = 32768;
  maxRed = maxGreen = maxBlue = 0;

  for (let i = this._lowerIndex; i <= this._upperIndex; i++) {
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

  const splitPoint = this.findSplitPoint();
  const vbox = new VBox(splitPoint + 1, this._upperIndex, this._distinctColors);

  this._upperIndex = splitPoint;
  this.fitBox();

  return vbox;
}
VBox.prototype.findSplitPoint = function(){
  const longestDimesion = this.getLongestColorDimension();
  this.modifySignificantOctetWithDismension(longestDimesion, this._lowerIndex, this._upperIndex);
  this.sortColorArray();
  this.modifySignificantOctetWithDismension(longestDimesion, this._lowerIndex, this._upperIndex);

  const midPoint = this._population / 2;
  let population = 0, hist = Hist.getHist();

  for (let i = this._lowerIndex, count = 0; i <= this._upperIndex ; i++)  {
      population = hist[this._distinctColors[i]];
      count += population;
      if (count >= midPoint) {
          return i !== this._lowerIndex ? (i-1) : i;
      }
  }
  return this._lowerIndex;
}
VBox.prototype.getLongestColorDimension = function() {
  const redLength = this._maxRed - this._minRed;
  const greenLength = this._maxGreen - this._minGreen;
  const blueLength = this._maxBlue - this._minBlue;

  if (redLength >= greenLength && redLength >= blueLength) {
    return CONFIGS.COMPONENT_RED;
  } else if (greenLength >= redLength && greenLength >= blueLength) {
    return CONFIGS.COMPONENT_GREEN;
  } else {
    return CONFIGS.COMPONENT_BLUE;
  }
}
VBox.prototype.modifySignificantOctetWithDismension = function(dimension, lower, upper) {
  let color, newColor;

  switch (dimension) {
    case CONFIGS.COMPONENT_RED:
      // Already in RGB, no need to do anything
      break;
    case CONFIGS.COMPONENT_GREEN:
      // We need to do a RGB to GRB swap, or vice-versa
      for (let i = lower; i <= upper; i++) {
          color = this._distinctColors[i];
          newColor = PaletteColor.quantizedGreen(color) << (CONFIGS.QUANTIZE_WORD_WIDTH + CONFIGS.QUANTIZE_WORD_WIDTH) |
            PaletteColor.quantizedRed(color)  << CONFIGS.QUANTIZE_WORD_WIDTH | PaletteColor.quantizedBlue(color);
          this._distinctColors[i] = newColor;
      }
      break;
    case CONFIGS.COMPONENT_BLUE:
      // We need to do a RGB to BGR swap, or vice-versa
      for (var i = lower; i <= upper; i++) {
          color = this._distinctColors[i];
          newColor =  PaletteColor.quantizedBlue(color) << (CONFIGS.QUANTIZE_WORD_WIDTH + CONFIGS.QUANTIZE_WORD_WIDTH) |
            PaletteColor.quantizedGreen(color)  << CONFIGS.QUANTIZE_WORD_WIDTH |
            PaletteColor.quantizedRed(color);
          this._distinctColors[i] = newColor;
      }
      break;
    }
}
VBox.prototype.sortColorArray = function(){
    // Now sort... Arrays.sort uses a exclusive toIndex so we need to add 1
    const sortCount = (this._upperIndex - this._lowerIndex) + 1;
    const sortArray = [];
    let sortIndex = 0;

    for (let index = this._lowerIndex; index<= this._upperIndex; index++){
        sortArray[sortIndex] = this._distinctColors[index];
        sortIndex++;
    }

    const arrayLength = sortIndex;
    let isSorted = true, temp = null;

    //bubble sort冒泡排序
    for(let i = 0; i < arrayLength - 1; i++)
    {
        for(let j=0; j< arrayLength- 1 - i; j++)
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
  return (this._maxRed - this._minRed + 1) * (this._maxGreen - this._minGreen + 1) * (this._maxBlue - this._minBlue + 1);
}
VBox.prototype.getAverageColor = function() {
  let redSum = 0, greenSum = 0, blueSum = 0,totalPopulation = 0;
  let color, colorPopulation;
  const hist = Hist.getHist();

  for (let i = this._lowerIndex; i <= this._upperIndex; i++) {
      color = this._distinctColors[i];
      colorPopulation = hist[color];

      totalPopulation += colorPopulation;

      redSum += colorPopulation * PaletteColor.quantizedRed(color);
      greenSum += colorPopulation * PaletteColor.quantizedGreen(color);
      blueSum += colorPopulation * PaletteColor.quantizedBlue(color);
  }

  //in case of totalPopulation equals to 0
  if (totalPopulation <= 0){
      return null;
  }

  let redMean = redSum / totalPopulation;
  let greenMean = greenSum / totalPopulation;
  let blueMean = blueSum / totalPopulation;

  redMean = PaletteColor.modifyWordWidthWithValue(redMean, CONFIGS.QUANTIZE_WORD_WIDTH, 8);
  greenMean = PaletteColor.modifyWordWidthWithValue(greenMean, CONFIGS.QUANTIZE_WORD_WIDTH, 8);
  blueMean = PaletteColor.modifyWordWidthWithValue(blueMean, CONFIGS.QUANTIZE_WORD_WIDTH,8);

  const rgb888Color = redMean << 2 * 8 | greenMean << 8 | blueMean;
  const swatch = new Swatch(rgb888Color, totalPopulation);

  return swatch;
}

export default VBox;
