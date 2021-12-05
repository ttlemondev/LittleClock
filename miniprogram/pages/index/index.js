//index.js
const app = getApp()
const regeneratorRuntime = app.regeneratorRuntime;

Page({
  data: {
    ready: false,
    worklist: [],
    worksum: 0,
    bgclasslist: ['bgorange', 'bgrose', 'bggreen', 'bgblue'],
    textclasslist: ['textorange', 'textrose', 'textgreen', 'textblue'],
    colorsum: 4,
    onWork: false,
    workname: '',
    elapsedTime: {}
  },
  onLoad: async function(){
    wx.showLoading({
      title: '加载中',
      mask: true
    });

    const openid = await app.getUserOpenid();
    const db = wx.cloud.database();
    const user = db.collection('user');
    const usercollectionCount = await user.where({
      _openid: openid
    }).count();
    console.log('[CloudDatabase/usercount] result: ', usercollectionCount);

    var worklist = [];
    if(usercollectionCount.total <= 0) {
      const usercollectionResult = await user.add({
        data: {
          worksum: 3,
          CreateTime: new Date(),
          worklist: ["运动", "学习", "娱乐"],
          worklist: [{
            workname: "运动",
            workid: 1,
            available: true
          }, {
            workname: "学习",
            workid: 2,
            available: true
          }, {
            workname: "娱乐",
            workid: 3,
            available: true
          }],
          onwork: false
        }
      });
      console.log('[CloudDatabase/usercreate] result: ', usercollectionResult);
      worklist = ["运动", "学习", "娱乐"];
    } else {
      /*const usercollentionResult = await user.where({
        _openid: openid
      }).get();
      console.log('[CloudDatabase/user] result: ', usercollentionResult);
      //worklist = usercollentionResult.data[0].worklist;
      for (let i of usercollentionResult.data[0].worklist) {
        console.log(i)
        worklist.push(i.workname)
      }*/
      worklist = await app.getAvailableWorklist();
    }

    console.log('[userinfo] worklist: ', worklist);

    if(await app.getUserOnWorkStatus()) {
      const currentinfo = await app.getUserCurrentWork();
      this.setData({
        ready: true,
        worklist: worklist,
        onWork: true,
        workname: currentinfo.workname,
        startAt: currentinfo.startAt
      })
      this.setTimeInterval();
    } else {
      this.setData({
        ready: true,
        worklist: worklist,
        onWork: false
      })
    }
    wx.hideLoading({});
  },
  setTimeInterval: async function() {
    const intervalNumber = setInterval(this.hanldeTimeUpdate, 1000);
    console.log('[Helper/setTimeInterval] result:', intervalNumber);
    this.setData({
      intervalNumber: intervalNumber
    })
  },
  hanldeTimeUpdate: async function() {
    if(this.data.onWork == false) {
      clearInterval(this.data.intervalNumber);
      return
    }
    //const currentWork = app.getUserCurrentWork();
    const currentTime = new Date();
    var milsec = currentTime - this.data.startAt;
    console.log('[Helper/handleTimeUpdate] milsec:', milsec);
    const Hour = Math.floor(milsec / (60 * 60 * 1000));
    milsec = milsec - Hour * (60 * 60 * 1000);
    const Minute = Math.floor(milsec / (60 * 1000));
    milsec = milsec - Minute * (60 * 1000);
    const Second = Math.floor(milsec / (1000));
    console.log('[Helper/handleTimeUpdate] Hour:', Hour, ', Minute:', Minute, ', Second:', Second);
    this.setData({
      elapsedTime: {
        hour: Hour,
        minute: Minute,
        second: Second
      }
    })
  },
  onStartWork: async function(event) {
    const workid = event.target.dataset.workid
    console.log('[Event/onStartWork] : ', event);
    console.log('[Event/onStartWork] workid: ', workid);
    const openid = await app.getUserOpenid();
    console.log(openid);
    if(await app.getUserOnWorkStatus()) {
      //TODO
    } else {
      await app.setUserOnWorkStatus(true);
      const db = wx.cloud.database();
      const current = db.collection('current');
      const now = new Date();
      const currentcollectionResult = await current.add({
        data: {
          workid: workid,
          startAt: now
        }
      });
      console.log('[CloudDatabase/startwork] result:', currentcollectionResult);

      const currentWorkInfo = await app.getUserCurrentWork();
      //const userinfo = await app.getUserInfo();
      const workname = currentWorkInfo.workname;

      this.setData({
        onWork: true,
        workname: workname,
        startAt: now
      });
      this.setTimeInterval();
    }
  },
  onStopWork: async function() {
    const db = wx.cloud.database();
    const current = db.collection('current');
    const openid = app.getUserOpenid();
    const getresult = await current.where({
      _openid: openid
    }).get();
    const currentwork = getresult.data[0];
    const removeresult = await current.where({
      _openid: openid
    }).remove();
    const history = db.collection('history');
    const addresult = await history.add({
      data:{
        startAt: currentwork.startAt,
        workid: currentwork.workid,
        stopAt: new Date()
      }
    });
    this.setData({
      onWork: false
    });
    await app.setUserOnWorkStatus(false);
  }
})
