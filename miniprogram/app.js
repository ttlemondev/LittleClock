//app.js
const regeneratorRuntime = require("libs/regenerator-runtime/runtime.js")
const promisify = require("libs/promisify/promisify.js")

const wxlogin = promisify(wx.login);
const wxgetStorage = promisify(wx.getStorage);
const wxsetStorage = promisify(wx.setStorage);

App({
  wxlogin,
  wxgetStorage,
  wxsetStorage,
  regeneratorRuntime,
  promisify,
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }

    this.globalData = {}
  },
  getUserOpenid: async function() {
    try {
      const res = await wxgetStorage({
        key: 'useropenid'
      });
      console.log('[Helper/getUserOpenid] getStorageResult:', res);
      return res.data
    } catch (error) {
      console.log('[Helper/getUserOpenid] getStorageFail:', error);
      const userinfo = await wx.cloud.callFunction({
        name: 'getuserinfo'
      });
      console.log('[CloudFunction/getuserinfo] result: ', userinfo);
      const openid = userinfo.result.openid;
      console.log('[CloudFunction/getuserinfo] openid: ', openid);
      try {
        const res = await wxsetStorage({
          key: 'useropenid',
          data: openid
        });
        console.log('[Helper/getUserOpenid] setStorageResult:', res);
      } catch (error) {
        console.log('[Helper/getUserOpenid] setStorageFail:', error);
      }
      return openid
    }
  },
  getUserOnWorkStatus: async function() {
    const userinfo = await this.getUserInfo();
      console.log('[Helper/getUserOnWorkStatus] result:', userinfo.onwork);
    return userinfo.onwork
  },
  setUserOnWorkStatus: async function(status) {
    const db = wx.cloud.database();
    const user = db.collection('user');
    const openid = this.getUserOpenid();
    const usercollectionResult = await user.where({
      _openid: openid
    }).update({
      data: {
        onwork: status
      }
    });
    console.log('[CloudDatabase/setuserworkstatus] result:', usercollectionResult);
  },
  getUserInfo: async function() {
    const db = wx.cloud.database();
    const user = db.collection('user');
    const openid = this.getUserOpenid();
    const result = await user.where({
      _openid: openid
    }).get();
    console.log('[Helper/getUserInfo] result:', result.data[0]);
    return result.data[0]
  },
  getUserCurrentWork: async function() {
    const db = wx.cloud.database();
    const current = db.collection('current');
    const openid = this.getUserOpenid();
    const result = await current.where({
      _openid: openid
    }).get();
    const currentwork = result.data[0];
    const userinfo = await this.getUserInfo();
    let workname = "";
    for(let i of userinfo.worklist) {
      if(i.workid == currentwork.workid) {
        workname = i.workname;
        break
      }
    }
    //const workname = userinfo.worklist[currentwork.workid];
    return {
      workid: currentwork.workid,
      startAt: currentwork.startAt,
      workname: workname
    }
  },
  getAvailableWorklist: async function() {
    let worklist = [];
    const userInfo = await this.getUserInfo();
    for (let i of userInfo.worklist) {
      console.log(i)
      if(i.available == true) {
        worklist.push(i.workname)
      }
    }
    console.log('[Helper/getAvailableWorklist] result:', worklist);
    return worklist
  }
})
