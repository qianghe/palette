import CONFIGS from './constant.js';
//目标模型
const PaletteTarget = function(mode) {
  this._mode = mode;
  this._saturationTargets = [];
  this._lightnessTargets = [];
  this._weights = [];
}

PaletteTarget.prototype.initWithTargetMode = function(){
  //初始化各种数据
  this._weights.push(CONFIGS.WEIGHT_SATURATION);
  this._weights.push(CONFIGS.WEIGHT_LUMA);
  this._weights.push(CONFIGS.WEIGHT_POPULATION);

  this._lightnessTargets.push(0.0);
  this._lightnessTargets.push(0.5);
  this._lightnessTargets.push(1.0);

  this._saturationTargets.push(0.0);
  this._saturationTargets.push(0.5);
  this._saturationTargets.push(1.0);

  switch(this._mode) {
    case CONFIGS.LIGHT_VIBRANT_PALETTE:
        this.setDefaultLightLuma();
        this.setDefaultVibrantSaturation();
        break;
    case CONFIGS.VIBRANT_PALETTE:
        this.setDefaultNormalLuma();
        this.setDefaultVibrantSaturation();
        break;
    case CONFIGS.DARK_VIBRANT_PALETTE:
        this.setDefaultDarkLuma();
        this.setDefaultVibrantSaturation();
        break;
    case CONFIGS.LIGHT_MUTED_PALETTE:
        this.setDefaultLightLuma();
        this.setDefaultMutedSaturation();
        break;
    case CONFIGS.MUTED_PALETTE:
        this.setDefaultNormalLuma();
        this.setDefaultMutedSaturation();
        break;
    case CONFIGS.DARK_MUTED_PALETTE:
        this.setDefaultDarkLuma();
        this.setDefaultMutedSaturation();
        break;
    default:
        break;
  }
}
PaletteTarget.prototype.getTargetKey = function() {
  let key = '';

  switch (this._mode) {
      case CONFIGS.LIGHT_VIBRANT_PALETTE:
          key = "light_vibrant";
          break;
      case CONFIGS.VIBRANT_PALETTE:
          key = "vibrant";
          break;
      case CONFIGS.DARK_VIBRANT_PALETTE:
          key = "dark_vibrant";
          break;
      case CONFIGS.LIGHT_MUTED_PALETTE:
          key = "light_muted";
          break;
      case CONFIGS.MUTED_PALETTE:
          key = "muted";
          break;
      case CONFIGS.DARK_MUTED_PALETTE:
          key = "dark_muted";
          break;
      default:
          break;
  }
  return key;
}
PaletteTarget.prototype.setDefaultLightLuma = function() {
  this._lightnessTargets[CONFIGS.INDEX_MIN] = CONFIGS.MIN_LIGHT_LUMA;
  this._lightnessTargets[CONFIGS.INDEX_TARGET] = CONFIGS.TARGET_LIGHT_LUMA;
}

PaletteTarget.prototype.setDefaultVibrantSaturation = function() {
  this._saturationTargets[CONFIGS.INDEX_MIN] = CONFIGS.MIN_VIBRANT_SATURATION;
  this._saturationTargets[CONFIGS.INDEX_TARGET] = CONFIGS.TARGET_VIBRANT_SATURATION;
}

PaletteTarget.prototype.setDefaultNormalLuma = function() {
  this._lightnessTargets[CONFIGS.NDEX_MIN] = CONFIGS.MIN_NORMAL_LUMA;
  this._lightnessTargets[CONFIGS.INDEX_TARGET] = CONFIGS.TARGET_NORMAL_LUMA;
  this._lightnessTargets[CONFIGS.INDEX_MAX] = CONFIGS.MAX_NORMAL_LUMA;
}

PaletteTarget.prototype.setDefaultDarkLuma = function() {
  this._lightnessTargets[CONFIGS.INDEX_TARGET] = CONFIGS.TARGET_DARK_LUMA;
  this._lightnessTargets[CONFIGS.INDEX_MAX] = CONFIGS.MAX_DARK_LUMA;
}

PaletteTarget.prototype.setDefaultMutedSaturation = function() {
  this._saturationTargets[CONFIGS.INDEX_TARGET] = CONFIGS.TARGET_MUTED_SATURATION;
  this._saturationTargets[CONFIGS.INDEX_MAX] = CONFIGS.MAX_MUTED_SATURATION;
}
PaletteTarget.prototype.getMinSaturation = function() {
  return this._saturationTargets[CONFIGS.INDEX_MIN];
}
PaletteTarget.prototype.getMaxSaturation = function() {
  let maxIndex;
  maxIndex = Math.min(CONFIGS.INDEX_MAX, this._saturationTargets.length - 1);

  return this._saturationTargets[maxIndex];
}
PaletteTarget.prototype.getMinLuma = function() {
  return this._lightnessTargets[CONFIGS.INDEX_MIN];
}
PaletteTarget.prototype.getMaxLuma = function() {
  let maxIndex;
  maxIndex = CONFIGS.INDEX_MAX >= this._lightnessTargets.lenght ? this._lightnessTargets.length : CONFIGS.INDEX_MAX;

  return this._lightnessTargets[maxIndex];
}
PaletteTarget.prototype.getSaturationWeight = function() {
  return this._weights[CONFIGS.INDEX_WEIGHT_SAT];
}
PaletteTarget.prototype.getLumaWeight = function() {
  return this._weights[CONFIGS.INDEX_WEIGHT_LUMA];
}
PaletteTarget.prototype.getPopulationWeight = function() {
  return this._weights[CONFIGS.INDEX_WEIGHT_POP];
}
PaletteTarget.prototype.getTargetSaturation = function() {
  return this._saturationTargets[CONFIGS.INDEX_TARGET];
}
PaletteTarget.prototype.getPopulationWeight = function() {
  return this._lightnessTargets[CONFIGS.INDEX_TARGET];
}
PaletteTarget.prototype.getTargetLuma = function() {
  return this._saturationTargets[CONFIGS.INDEX_TARGET];
}
PaletteTarget.prototype.normalizeWeights = function() {
  let sum = 0, weight = 0, i = 0, z= 0;
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

export default PaletteTarget;
