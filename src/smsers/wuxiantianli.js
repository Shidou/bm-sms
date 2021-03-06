import _ from 'lodash';
import moment from 'moment';
import SmserAbstract from './abstract';
import { encodeBase64Url } from '../utils';
import { InvalidArgumentException } from '../exceptions';
import SmsResponse from '../sms_response';

export default class Wuxiantianli extends SmserAbstract {
  static getBatchId() {
    return moment().format('YYYYMMDDHHmmss') + new Date().getMilliseconds();
  }

  constructor(config, request) {
    super({
      service: null,
      clientid: null,
      password: null,
      sign: null, // 必需
    });
    this.setConfig(config);
    this.request = request;
  }

  // 签名要后置
  autoSignContext(str) {
    let con = str;
    if (con && (con.startsWith(this.config.sign) || con.endsWith(this.config.sign))) {
      con = _.trim(con, this.config.sign);
    }
    return con + this.config.sign;
  }

  sendVcode(mobile, msg) {
    if (!msg || !mobile) {
      throw new InvalidArgumentException('Please specify params: mobile and msg!');
    }

    if (!this.config.vcode_productid) {
      throw new InvalidArgumentException(
        'Please specify the config param: vcode_productid!'
        );
    }

    return this.send({
      api: '/communication/sendSms.ashx',
      mobile,
      msg: this.autoSignContext(msg),
      pid: this.config.vcode_productid,
    });
  }

  sendSms(mobile, msg) {
    if (!msg || !mobile) {
      throw new InvalidArgumentException('Please specify params: mobile and msg!');
    }

    if (!this.config.productid) {
      throw new InvalidArgumentException('Please specify the config param: productid!');
    }

    return this.send({
      api: '/communication/sendSms.ashx',
      mobile,
      msg: this.autoSignContext(msg),
      pid: this.config.productid,
    });
  }

  /**
   * 无线天利不支持多人发送不同内容的短信
   */
  sendPkg(pkg) {
    if (!_.isArray(pkg) || !pkg.length) {
      throw new InvalidArgumentException('Invalid format: pkg!');
    }
    if (pkg.length > 1000) {
      throw new InvalidArgumentException('Every time may not be sent more than 1000 msg');
    }
    const mobiles = new Set();
    let msg = '';
    pkg.map(p => {
      mobiles.add(p.phone);
      msg = this.autoSignContext(p.context);
      return null;
    });
    return this.sendSms(Array.from(mobiles).join(), msg);
  }


  send({ api, mobile, msg, pid }) {
    const batchId = Wuxiantianli.getBatchId();
    const queryData = {
      content: encodeBase64Url(msg),
      mobile: encodeBase64Url(mobile),
      productid: pid,
      ssid: batchId,
      lcode: '',
      format: 32,
      sign: '',
      custom: '',
    };

    Object.assign(queryData, {
      cid: encodeBase64Url(this.config.clientid),
      pwd: encodeBase64Url(this.config.password),
    });

    return this.request({
      url: this.config.service + api,
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      qs: queryData,
      timeout: 10000,
      useQuerystring: true,
    }).then(body => {
      let status = 'failed';
      try {
        const bodyObj = typeof body === 'string' ? JSON.parse(body) : body;
        if (bodyObj.status === '0' || bodyObj.status === 0) {
          status = 'success';
        }
      } catch (e) {
        // ...
      }
      return new SmsResponse({
        ssid: batchId,
        status,
        body,
      });
    });
  }
}
