import CONFIGS from './constant.js';

//vbox队列PriorityBoxArray
const PriorityBoxArray = function(){
  this._vboxArray = [];
}
PriorityBoxArray.prototype.getLength = function() {
  return this._vboxArray.length;
}
PriorityBoxArray.prototype.addVBox = function(box){
  //
  // if (Object.prototype.toString(box) !== '[Object Object]'){
  //     return;
  // }
  if (this._vboxArray.length <= 0){
    this._vboxArray.push(box);
    return;
  }
  var nowBox;

  for (var i = 0 ; i < this._vboxArray.length ; i++){
    nowBox = this._vboxArray[i];

    if (box.getVolume() > nowBox.getVolume()){
      this._vboxArray.splice(i, 0, box);
      if (this._vboxArray.length > CONFIGS.kMaxColorNum){
        this._vboxArray.pop();
      }
      return;
    }

    if ((i == this._vboxArray.length - 1) && this._vboxArray.length < CONFIGS.kMaxColorNum){
      this._vboxArray.push(box);
      return;
    }
  }
}
PriorityBoxArray.prototype.getTop = function() {
  if (this._vboxArray.length <= 0){
      return null;
  }

  return this._vboxArray[0];
}
PriorityBoxArray.prototype.poll = function(){
  if (this._vboxArray.length <= 0){
      return null;
  }

  const headObject = this._vboxArray[0];

  this._vboxArray.shift();

  return headObject;
}
PriorityBoxArray.prototype.getVBoxArray = function(){
  return this._vboxArray;
}

export default PriorityBoxArray;
