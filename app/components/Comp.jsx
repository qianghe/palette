import React, { Component } from 'react';
import { Input } from 'antd';

class Comp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lg: this.props.value.lg || '',
      ln: this.props.value.ln || '',
    };
  }
  onChange = (e, type) => {
    // this.props.onChange();
    const obj = {
      ...this.state,
      [type]: e.target.value,
    }
    this.setState(obj);
    this.props.onChange(obj);
  }
  render() {
    const { value } = this.props;
    return (
      <div>
        <input
          placeholder="type something"
          value={this.state.lg}
          onChange={(e) => this.onChange(e, 'lg')}
        />
        <input
          placeholder="type something"
          value={this.state.ln}
          onChange={(e) => this.onChange(e, 'ln')}
        />
      </div>
    );
  }
}

export default Comp;
