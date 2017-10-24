import React, { Component } from 'react'
import './upload.scss'

class Upload extends Component {
  state = {
    isFetching: false,
    hasUpload: true,
    imgSrc: null,
    file: null,
    analyData: [],
  }
  // postPic = () => {
  //   //传递图片
  //   const data = new FormData()
  //   data.append('file', file);
  //   data.append('user', 'heqiang');
  //
  //   const url = 'hqiswonder.com.cn:3000/upload';
  //   fetch(url, {
  //     method: 'POST',
  //     body: data
  //   }).then(response => response.json())
  //   .then((data) => {
  //     console.log('data', data);
  //   });
  // }
  selectImg= (e) => {
    const file = e.target.files[0];
    const that = this;
    if (!file) return;

    //判断是否为支持的图片格式
    if (file.type && file.type.indexOf('image') == -1 && !/\.(?:jpg|png|gif)$/.test(file.name)) {
      alert('只支持jpg,png,gif格式的图片！');
      return;
    }
    //采用fileReader进行文件的读取
    let reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (e) => {
      that.setState({
        imgSrc: e.target.result,
        file,
      });
    }
  }
  startAnalysis= () => {
    console.log('start to anlysis....');
    const that = this;
    const img = this.refs.selectedImg;
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0 , 0);
    var imgData = ctx.getImageData(0, 0, img.width, img.height);

    //使用web worker进行数据处理
    // var worker =new Worker("../../libs/dealdata.js");
    // worker.postMessage(imgData);     //向worker发送数据
    // worker.onmessage =function(evt){     //接收worker传过来的数据函数
    //  console.log(evt.data);              //输出worker发送来的数据
    //   that.setState({
    //     analyData: evt.data
    //   })
    // }
    console.log();
    var PaletteObject = window.paletteObject;
    var palette = new PaletteObject();
    var resp = palette.init(imgData);

    this.setState({
      analyData: resp
    });
  }
  render() {
    const { imgSrc, analyData } = this.state;

    return (
      <div className="container">
        <h1>Palette Algorithm</h1>
        <section className="upload">
          <span style={{ display: imgSrc ? 'none' : 'block' }}>+</span>
          <div className="preview">
            <img src={imgSrc} ref="selectedImg"/>
          </div>
          <input type="file" onChange={(e)=>this.selectImg(e)}/>
        </section>
        <section className="tip">click to select a picture</section>
        <div className="startBtn" style={{ display: imgSrc ? 'block' : 'none' }} onClick={this.startAnalysis}>start to analysis</div>
        <ul style = {{ display: analyData.length ? 'flex' : 'none' }}>
          {
            analyData.map((data, index) =>
              <li
                key={`color_item_${index}`}
                style={{ backgroundColor: data.imageColorString }}>
                <span>{`${data.mode}:${data.imageColorString}`}</span>
                <span>{`${(data.percentage*100).toFixed(2)}%`}</span>
              </li>
            )
          }
        </ul>
      </div>
    )
  }
}

export default Upload;
