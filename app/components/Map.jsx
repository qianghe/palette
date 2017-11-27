import React, { Component } from 'react';

let map = null;
let geocoder = null;
let marker = null;

class Map extends Component {
  constructor(props) {
    super(props);

    this.state = {
      location: '',
      latLng: '',
      city: '',
    };
  }
  componentDidMount() {
    const { defaultLatLng } = this.props;
    let lat, lng, myLatlng, latLng;

    if (defaultLatLng) {
      const latlngStr = defaultLatLng.split(",", 2);
      lat = parseFloat(latlngStr[0]);
      lng = parseFloat(latlngStr[1]);
      myLatlng = new qq.maps.LatLng(lat, lng);
    } else {
      myLatlng = new qq.maps.LatLng(39.916527, 116.397128);
    }
    const myOptions = {
      zoom: defaultLatLng ? 14 : 8,
      center: myLatlng
    };
    //创建地图
    var map = new qq.maps.Map(document.getElementById("qq-map-container"), myOptions);
    //自动补全
    var ap = new qq.maps.place.Autocomplete(document.getElementById("qq-map-place"));
    var searchService = new qq.maps.SearchService({
      map : map,
      complete: (result) => {
        console.log(result);
      },
    });
    //地理位置信息
    geocoder = new qq.maps.Geocoder({
        complete: (result) => {
          const { detail } = result;
          console.log('detail', detail);
          this.setState({
            location: detail.address,
            city: detail.addressComponents.city || '无',
            latLng: `${detail.location.lat}, ${detail.location.lng}`,
          });
        }
    });
    if (defaultLatLng) {
      latLng = new qq.maps.LatLng(lat, lng);

      marker = new qq.maps.Marker({
        position: latLng,
        map: map
      });
      //经纬度转化为地址
      geocoder.getAddress(latLng);
    }
    //自动补全添加监听事件
    qq.maps.event.addListener(ap, "confirm", function(res){
        console.log('confirm', res.value);
        const address = res.value;
        searchService.setPageCapacity(1);
        searchService.search(address);
        //根据地址转换经纬度
        geocoder.getLocation(address);
    });
    var info = new qq.maps.InfoWindow({ map: map });
    //单击定点
    qq.maps.event.addListener(map, 'click', function(event) {
      latLng = event.latLng;

      if (marker) {
        marker.setMap(null);
      }
      //打标
      marker = new qq.maps.Marker({
        position: latLng,
        map: map
      });
      //经纬度转化为地址
      geocoder.getAddress(latLng);
    });
  }
  handleLocation = (e) => {
    this.setState({
      location: e.target.value,
    });
  }
  render() {
    return (
      <div>
        <input
          id="qq-map-place"
          style={{ width: 300, height: 30 }}
          value={this.state.location}
          onChange={this.handleLocation}
        />
        <div
          id="qq-map-container"
          style={{ width: 600, height: 400 }}
        />
        <div>经纬度：{this.state.latLng}</div>
        <div>城市：{this.state.city}</div>
      </div>
    );
  }
}

export default Map;
