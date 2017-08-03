import test from 'ava';
import { Yuntongxin } from '../../src/smsers';
import SmsResponse from '../../src/sms_response';
import sinon from 'sinon';

test('smser yuntongxin', async t => {
  const rp = () => {
    return Promise.resolve(null);
  };
  const requestSpy = sinon.spy(rp);
  const demoConfig = {
    sandbox: true,
    account_sid: '00000000000000000000000000000000',
    auth_token: '00000000000000000000000000000000',
    app_id: '00000000000000000000000000000000',
    vcode_template_id: 1,
    vcode_timeout_min: 10,
  };
  const smser = new Yuntongxin(demoConfig, requestSpy);
  const mobile = '11111111111';
  const msg = '【测试】test';
  t.is(smser.config.sign, demoConfig.sign);

  const res = await smser.sendSms(mobile, msg);
  t.true(res instanceof SmsResponse);
  // ssid为生成的uuid
  t.true(14 === res.ssid.length);

  const vcodeRes = await smser.sendVcode(mobile, msg);
  t.true(vcodeRes instanceof SmsResponse);
  // ssid为生成的uuid
  t.true(14 === vcodeRes.ssid.length);

  // 被调用三次
  t.true(2 === requestSpy.callCount);
});


test('Yuntongxin sendVoiceVcode', t => {
  const rp = () => {
    return Promise.resolve(null);
  };
  const requestSpy = sinon.spy(rp);
  const demoConfig = {
    sandbox: true,
    account_sid: '00000000000000000000000000000000',
    auth_token: '00000000000000000000000000000000',
    app_id: '00000000000000000000000000000000',
    vcode_template_id: 1,
    vcode_timeout_min: 10,
  };
  const smser = new Yuntongxin(demoConfig, requestSpy);
  const mobile = '11111111111';
  const vcode = '【测试】123456';
  smser.sendVoiceVcode(mobile,vcode)
});

