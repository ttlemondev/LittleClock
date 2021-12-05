// pages/setting/setting.js

const app = getApp()
const regeneratorRuntime = app.regeneratorRuntime;


Page({

    /**
     * 页面的初始数据
     */
    data: {
        ready: false,
        worklist: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: async function (options) {
        wx.showLoading({
            title: '加载中',
            mask: true
          });
        const userinfo = await app.getUserInfo();
        console.log('[Dev/SettingOnload] userinfo:', userinfo); 
        if(userinfo.onwork) {
            wx.hideLoading({});
            wx.showToast({
                title: '请结束计时后再更改设置',
                icon: 'none',
                duration: 2500,
                mask: true
            });
            setTimeout(() => {
                wx.switchTab({
                  url: '/pages/index/index'
                })
            }, 2500)
        } else {
            this.setData({
                ready: true,
                worklist: userinfo.worklist,
              })
            wx.hideLoading({});
        }
    },
    onDeleteWork: async function(event) {
        const workid = event.target.dataset.workid;
        console.log('[Dev/onDeleteWork] event:', event);
        const userinfo = await app.getUserInfo();
        //console.log('[Dev/onDeleteWork] oldlist:', userinfo.worklist)
        //const workpos = userinfo.worklist.indexOf(userinfo.worklist[workid]);
        //const newworklist = userinfo.worklist.splice(workpos, 1);
        var newworklist = userinfo.worklist;
        //newworklist[workpos] = "##DELETE##";
        for(let i in userinfo.worklist) {
            if(userinfo.worklist[i].workid == workid) {
                newworklist[i].available = false
            }
        }
        console.log('[Dev/onDeleteWork] newlist:', newworklist);
        const openid = app.getUserOpenid();
        const db = wx.cloud.database();
        const user = db.collection('user');
        const userresult = await user.where({
            _openid: openid
        }).update({
            data: {
                worklist: newworklist
            }
        });
        console.log('[CloudDatabase/onDeleteWork] result:', userresult);

        /*Delete history*/
        /*const history = db.collection('history');
        const historyresult = await history.where({
            _openid: openid,
            workid: workid
        }).remove();
        console.log('[CloudDatabase/onDeleteWork] result:', historyresult);*/
        
        await this.onLoad();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})