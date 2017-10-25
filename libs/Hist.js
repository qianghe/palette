const Hist = {
  _hist: [],
  getHist: function(){
    return this._hist;
  },
  setHist: function(hist){
    this.clearHist();
    this._hist = hist;
  },
  clearHist: function(){
    this._hist = [];
  }
}

export default Hist;
