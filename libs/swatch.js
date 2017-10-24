//swatch模型
function Swatch(color, population){
  console.log('new Swatch', population);
  this._red = this.approximateRed(color);
  this._green = this.approximateGreen(color);
  this._blue = this.approximateBlue(color);
  this._population = population;
}

Swatch.prototype.getPopulation = function(){
  return this._population;
}
Swatch.prototype.getColorString = function(){
  console.log('getColorString', this._red, this._green, this._blue);
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
