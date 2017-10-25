const PaletteColor = {
  QUANTIZE_WORD_WIDTH_COLOR: 5,
  QUANTIZE_WORD_MASK_COLOR: (1 << 5) - 1,
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

export default PaletteColor;
