//index.js
const app = getApp()
const regeneratorRuntime = app.regeneratorRuntime;

Page({
  data: {
    ready: false,
    worklist: [],
    bgclasslist: ['bgorange', 'bgrose', 'bggreen'],
    textclasslist: ['textorange', 'textrose', 'textgreen'],
    colorsum: 3
  },
  onLoad: async function(){
    wx.showLoading({
      title: '加载中',
      mask: true
    });

    const userinfo = await wx.cloud.callFunction({
      name: 'getuserinfo'
    });
    console.log('[CloudFunction/getuserinfo] result: ', userinfo);
    const openid = userinfo.result.openid;
    console.log('[CloudFunction/getuserinfo] openid: ', openid);
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
          worklist: ["运动", "学习", "娱乐"]
        }
      });
      console.log('[CloudDatabase/usercreate] result: ', usercollectionResult);
      worklist = ["运动", "学习", "娱乐"];
    } else {
      const usercollentionResult = await user.where({
        _openid: openid
      }).get();
      console.log('[CloudDatabase/user] result: ', usercollentionResult);
      worklist = usercollentionResult.data[0].worklist;
    }

    console.log('[userinfo] worklist: ', worklist);
    this.setData({
      ready: true,
      worklist: worklist
    })
    wx.hideLoading({});
  }
})
