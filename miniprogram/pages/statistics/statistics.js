// pages/statistics/statistics.js

const app = getApp()
const regeneratorRuntime = app.regeneratorRuntime;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        ready: false,
        worklist: [],
        worktimestr: [],
        workpencent: [],
        bgclasslist: ['bgorange', 'bgrose', 'bggreen'],
        textclasslist: ['textorange', 'textrose', 'textgreen'],
        colorsum: 3
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
        const openid = await app.getUserOpenid();
        const db = wx.cloud.database();
        const history = db.collection('history');
        var workhistory = await history.where({
            _openid: openid
        }).get();
        workhistory = workhistory.data;
        console.log('[CloudDatabase/statistics] result:', workhistory);

        var timeSum = 0;
        const workSum = userinfo.worklist.length;
        var workTime = new Array(workSum);
        var workTimeStr = new Array(workSum);
        var workPencent = new Array(workPencent);

        for (let i = 0; i < workSum; ++i) {
            workTime[i] = 0;
            workPencent[i] = 100;
            workTimeStr[i] = '';
        }
        for (let i of workhistory) {
            let wt = Math.floor((i.stopAt - i.startAt) / 1000);
            timeSum += wt;
            workTime[i.workid] += wt;
            for (let j = 0; j < workSum; ++j) {
                workPencent[j] = Math.floor(workTime[j] / timeSum * 100);
                //console.log(Math.floor(workTime[j] / timeSum * 100), workTime[j], timeSum)
            }
        }
        for (let i = 0; i < workSum; ++i) {
            if(workTime[i] != 0) {
                var t = workTime[i];
                let Hour = Math.floor(t / (60 * 60));
                t -= Hour * (60 * 60);
                let Minute = Math.floor(t / 60);
                t -= Minute * 60;
                let Second = t;
                if(Hour != 0) {
                    workTimeStr[i] += Hour.toString() + '时'
                }
                if(Minute != 0) {
                    workTimeStr[i] += Minute.toString() + '分'
                }
                if(Second != 0) {
                    workTimeStr[i] += Second.toString() + '秒'
                }
            }
        }
        this.setData({
            worklist: userinfo.worklist,
            worktimestr: workTimeStr,
            workpencent: workPencent
        })
        wx.hideLoading({});
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: async function () {
        await this.onLoad();
        console.log('[Page/statistics] onShowCall!');
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