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

  switch(this._mode) {
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
