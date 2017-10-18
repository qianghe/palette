import React, { Component } from 'react'
import './upload.scss'

class Upload extends Component {
  state = {
    isFetching: false,
    hasUpload: true,
    hasPreview: false,
    imgSrc: null,
  }
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
        hasPreview: true,
      });
    }
  }
  render() {
    const { imgSrc, hasPreview } = this.state;
    const showStyle = { display: hasPreview ? 'none' : 'block'};

    return (
      <div className="container">
        <h1>Palette Algorithm</h1>
        <section className="upload">
          <span style={showStyle}>+</span>
          <div className="preview" style={{ backgroundImage: `url(${imgSrc})` }}/>
          <input type="file" onChange={(e)=>this.selectImg(e)}/>
        </section>
        <section className="tip">click to select a pic</section>
        <div className="startBtn">start to analysis</div>
      </div>
    )
  }
}

export default Upload;
