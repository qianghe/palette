import React, { Component } from 'react';
import { Input } from 'antd';
let map = null;
let geocoder = null;
let marker = null;

class Map extends Component {
  constructor(props) {
    super(props);

    this.state = {
      location: this.props.location || '',
      latLng: this.props.latLng || '',
      city: this.props.city || '',
    };
  }
  componentDidMount() {
    const defaultLatLng = this.props.value.latLng;
    console.log();
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
      complete: (results) => {
        const pois = results.detail.pois;
        const latlngBounds = new qq.maps.LatLngBounds();
        if(!pois) return;

        const poi = pois[0];
        latlngBounds.extend(poi.latLng);
        if (marker) marker.setMap(null);

        marker = new qq.maps.Marker({
            position: poi.latLng,
            map: map
          });
        //调整地图视野
        map.fitBounds(latlngBounds);
      },
    });
    //地理位置信息
    geocoder = new qq.maps.Geocoder({
        complete: (result) => {
          const { detail } = result;
          const obj = {
            location: detail.address,
            latLng: `${detail.location.lat}, ${detail.location.lng}`,
            city: detail.addressComponents.city || '无',
          };
          this.setState(obj);
          this.props.onChange(obj);
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
        const address = res.value;
        searchService.setPageCapacity(1);
        searchService.search(address);
        if (marker) marker.setMap(null);
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
    const { value } = e.target;
    this.setState({
      location: value,
    });
    this.props.onChange({
      city: '',
      latLng: '',
      location: value,
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
