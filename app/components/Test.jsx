import React, { Component } from 'react';
import { Form, Input, Icon, Button } from 'antd';
import Comp from './Comp';
import Map from './Map';

const FormItem = Form.Item;

class Test extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const config = {
      location: '北京市朝阳区北京798艺术区',
      latLng: '39.98423, 116.49446',
      city: '天津',
    };
    return (
      <Form onSubmit={this.handleSubmit} className="login-form">
        <FormItem>
          {getFieldDecorator('address', {
            initialValue: {
              location: config.location || '',
              latLng: config.latLng || '',
              city: config.city || '',
            },
            rules: [{
              type: 'object',
            }],
          })(<Map />)}
        </FormItem>
        <Button type="primary" htmlType="submit" className="login-form-button">
           Log in
         </Button>
      </Form>
    );
  }
}

export default Form.create()(Test);
