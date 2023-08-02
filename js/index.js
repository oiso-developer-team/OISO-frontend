function getTimeCn() {
    var now = new Date();
    var hour = now.getHours();
    if (hour < 6) {
      return "早上好，";
    } else if (hour < 9) {
      return "早上好，";
    } else if (hour < 12) {
      return "上午好，";
    } else if (hour < 14) {
      return "中午好，";
    } else if (hour < 17) {
      return "下午好，";
    } else if (hour < 19) {
      return "傍晚好，";
    } else if (hour < 22) {
      return "晚上好，";
    } else {
      return "夜里好，";
    }
}

function makeUserButton(data) {
    // var fa = document.getElementById("lbt").parentNode;
    // fa.appendChild(parseElement(`<a id="lbt" mdui-dialog="{target: '#dialog-logout'}" onclick="" href="javascript:void 0"><b class="name">${JSON.parse(data).name}</b><img src="https://cdn.luogu.com.cn/upload/usericon/${JSON.parse(data).uid}.png" alt="${JSON.parse(data).name}" class="avatar"></a>`))
    // document.getElementById("lbt").remove();
    // mdui-dialog="{target: '#dialog-logout'}"
    const userInfoDiv = document.getElementById("userInfo");
    userInfoDiv.innerHTML = `<a id="lbt" mdui-menu="{target: '#user-attr'}" href="javascript:void 0"><img src="https://cdn.luogu.com.cn/upload/usericon/${JSON.parse(data).uid}.png" alt="${JSON.parse(data).name}" class="avatar"></a>
    <ul class="mdui-menu" id="user-attr">
        <li class="mdui-menu-item">
            <a href="javascript:;" class="mdui-ripple" id="userInfo-name" target="_blank" style="font-size: smaller;">欢迎</a>
        </li>
        <li class="mdui-menu-item">
            <a mdui-dialog="{target: '#dialog-vip'}" class="mdui-ripple" id="userInfo-vip" style="font-size: xx-small;">当前计划</a>
        </li>
        <li class="mdui-divider"></li>
        <li class="mdui-menu-item">
            <a href="javascript:;" mdui-dialog="{target: '#dialog-logout'}" class="mdui-ripple" style="color: red;"><i class="mdui-icon material-icons">exit_to_app</i>登出</a>
        </li>
    </ul>
    `;
    const userInfoName = document.getElementById("userInfo-name");
    userInfoName.innerText = getTimeCn() + JSON.parse(data).name;
    userInfoName.setAttribute("href", `https://www.luogu.com.cn/user/${JSON.parse(data).uid}`);
    const userInfoVip = document.getElementById("userInfo-vip");
    const TRAILS = {
        0: "OIso Free",
        1: "OIso Plus",
        2: "OIso Pro",
        3: "OIso Premium"
    }
    userInfoVip.innerText = "当前计划：" + TRAILS[JSON.parse(data).vip.level];
}

try {
    makeUserButton(localStorage.getItem("profile"));
} catch {
    const userInfoDiv = document.getElementById("userInfo");
    userInfoDiv.innerHTML = `<button id="lbt" class="mdui-btn mdui-ripple mdui-ripple-white mdui-color-blue"
        style="color: white!important" mdui-dialog="{target: '#dialog-login'}" onclick="get_key();">Logging</button>`;
}

fetch(window['api'] + "/profile", {
    credentials: 'include'
}).then(function (response) {
    return response.text();
}).then(function (data) {
    if (data == `False`) { // !!!!!!!!!!!!!!
        const userInfoDiv = document.getElementById("userInfo");
        userInfoDiv.innerHTML = `<button id="lbt" class="mdui-btn mdui-ripple mdui-ripple-white mdui-color-blue"
        style="color: white!important" mdui-dialog="{target: '#dialog-login'}" onclick="get_key();"></button>`;
        document.getElementById("lbt").innerHTML = "登录";
        localStorage.removeItem("profile");
        // mdui.snackbar("请登录");
    } else {
        console.log(data);
        // write to localstorage cache
        let data_copy = JSON.parse(data);
        data_copy.cookie = "******";
        localStorage.setItem("profile", JSON.stringify(data_copy));
        document.getElementById("openGPT").setAttribute("onclick", `window.open('https://ikun.oiso.cf/#/?code=${JSON.parse(data).cookie}');`);
        if (JSON.parse(data).vip.level != 0) {
            document.getElementById("openGPT").removeAttribute("disabled");
            document.getElementById("aipaint").removeAttribute("disabled");
        } else {
            document.getElementById("openGPT").innerHTML = `<i class="mdui-icon mdui-icon-left material-icons">chat</i>会员制GPT`;
            document.getElementById("aipaint").innerHTML = `<i class="mdui-icon mdui-icon-left material-icons">sentiment_satisfied</i>会员制AI作图`
        }
        window['uid'] = JSON.parse(data).uid;
        document.getElementById("reflink").innerHTML = ("通过这个链接 →[https://www.oiso.cf/](https://www.oiso.cf?ref=" + String(window["uid"]) + ")← 登录 OIso 官网，免费领取 3 积分，我也能同时获得 3 积分哦！积分可以换会员耶～");
        document.getElementById("avatarimg").src = "https://cdn.luogu.com.cn/upload/usericon/" + JSON.parse(data).uid + ".png";
        const TRAILS = {
            0: "OIso Free",
            1: "OIso Plus",
            2: "OIso Pro",
            3: "OIso Premium"
        }
        document.getElementById("present_trail").innerText = "当前计划：" + TRAILS[JSON.parse(data).vip.level] + "（ 等级" + String(JSON.parse(data).vip.level) + " / 3 ）";
        if (JSON.parse(data).vip.level != 0) {
            document.getElementById("expire_time").innerHTML = `到期时间：${new Date(JSON.parse(data).vip.expire * 1000).toLocaleString()}`;
        } else {
            document.getElementById("expire_time").innerHTML += `只要服务器不挂，就可以永久免费使用！`;
        }
        if (JSON.parse(data).vip == false) {
            document.getElementById("present_trail").innerText = "当前计划：OIso Free（ 等级0 / 3 ）";
            document.getElementById("expire_time").innerHTML = `到期时间：只要服务器不挂，就可以永久免费使用！`;
        }
        get_benben();
        namespace = '/Socket';
        var socket = io.connect(window['api'] + namespace, {
            transportOptions: {
                polling: {
                    extraHeaders: {
                        token: JSON.parse(data).cookie
                    }
                }
            }
        });
        // 初始化完成后,发送一条消息
        socket.emit("message", { "data": "hello lyshark" });
        // 收到数据后,执行输出
        socket.on('response', function (recv) {
            var data = recv.Data;
            window['shit'] = recv;
            console.log(recv);
            console.log(data);
            // update chat_msg
            parse_benben(data.chat_msg);
            parse_music(data.song_msg);
            parse_spiderstatus(data.spider_status);
            if (window['live_chosen'] == undefined) {
                parse_stream(data.live);
            }
        });

        document.getElementById("updown").removeAttribute("hidden");
        try {
            makeUserButton(data);
        } catch {
            document.getElementById("lbt").innerHTML = "登出";
        }
        // document.getElementById("lbt").setAttribute("mdui-dialog", "{target: '#dialog-logout'}");
        document.getElementById("lbt").setAttribute("onclick", "");
        document.getElementById("happy").removeAttribute("hidden");
        window['stream'] = undefined;
        window['isPlaying'] = false;
    }
}).catch(function () {
    // mdui.snackbar("服务器错误：" + data);
    document.getElementById("lbt").innerHTML = "未登录";
});

function check_playing(url) {
    setTimeout(function () {
        vElement = document.getElementById('videoElement');
        if (vElement.paused) {
            setup_stream(url);
            check_playing(url);
        }
    }, 1000);
}

function parse_stream(data) {
    j = (data);
    if (j.isLiving) {
        document.getElementById("stream_title").innerText = j.data.title;
        if (window['stream'] == false || window['stream'] == undefined) {
            window['stream'] = true;
            document.getElementById("mediadiv").innerHTML = `<div class="mainContainer" id="mainContain">
                <video id="videoElement" class="centeredVideo" controls 
                style="height: 333px; width: 100%; object-fit: fill;"
                >Your browser is too old to
                    support HTML5 video.</video>
            </div>`;
            setTimeout(function () {
                setup_stream(j.urls.flv);
            }, 100);
            setTimeout(function () {
                if (document.getElementById("videoElement").paused) {
                    mdui.snackbar({
                        message: '播放不通畅？试试刷新页面！',
                        buttonText: '立即刷新',
                        onButtonClick: function () {
                            window.location.reload();
                        }
                    });
                }
            }, 5000);
        }
    } else {
        if (window['stream'] == true || window['stream'] == undefined) {
            window['stream'] = false;
            document.getElementById("mediadiv").innerHTML = `<div class="mainContainer" id="mainContain">
                <video id="videoElement" class="centeredVideo" controls>Your browser is too old to
                    support HTML5 video.</video>
            </div>`;
            document.getElementById("stream_title").innerText = "主播正在摸🐟……";
            setup_stream2('https://www.oiso.cf/img/fishing.mp4');
        }
    }
}

// 等待页面渲染完成
window.onload = function () {
    var vElement = document.getElementById('videoElement');
    var width = document.getElementById('mediadiv').offsetWidth;
    console.log(width);
    vElement.style.height = '333px';
};

function setup_stream2(stream_url) {
    var vElement = document.getElementById('videoElement');
    // 等待视频加载完成
    vElement.addEventListener('loadedmetadata', function () {
        // 获取mediadiv的宽度
        var width = document.getElementById('mediadiv').offsetWidth;
        // 获取视频长宽比
        var videoRatio = vElement.videoWidth / vElement.videoHeight;
        // 高度为mediadiv的宽度按视频长宽比计算
        vElement.style.height = width / videoRatio + 'px';
    });
    // 当窗口大小发生改变
    window.onresize = function () {
        // 获取mediadiv的宽度
        var width = document.getElementById('mediadiv').offsetWidth;
        // 获取视频长宽比
        var videoRatio = vElement.videoWidth / vElement.videoHeight;
        // 高度为mediadiv的宽度按视频长宽比计算
        vElement.style.height = width / videoRatio + 'px';
    };
    // 设置视频地址
    vElement.src = stream_url;
    // 设置视频自动播放
    vElement.autoplay = true;
}

function setup_stream(stream_url) {
    var vElement = document.getElementById('videoElement');
    // 等待视频加载完成
    vElement.addEventListener('loadedmetadata', function () {
        // 获取mediadiv的宽度
        var width = document.getElementById('mediadiv').offsetWidth;
        // 获取视频长宽比
        var videoRatio = vElement.videoWidth / vElement.videoHeight;
        // 高度为mediadiv的宽度按视频长宽比计算
        vElement.style.height = width / videoRatio + 'px';
    });
    // 当窗口大小发生改变
    window.onresize = function () {
        // 获取mediadiv的宽度
        var width = document.getElementById('mediadiv').offsetWidth;
        // 获取视频长宽比
        var videoRatio = vElement.videoWidth / vElement.videoHeight;
        // 高度为mediadiv的宽度按视频长宽比计算
        vElement.style.height = width / videoRatio + 'px';
    }

    if (flvjs.isSupported()) {
        var videoElement = document.getElementById('videoElement');
        var flvPlayer = flvjs.createPlayer({
            type: 'flv',
            url: stream_url
        });
        flvPlayer.attachMediaElement(videoElement);
        flvPlayer.load();
        // vElement.autoplay = true;
        vElement.addEventListener('canplay', function () {
            var promise = vElement.play();
            if (promise !== undefined) {
                promise.catch(error => {
                    console.log(error);
                    // 无法自动播放，设置静音
                    vElement.muted = true;
                    vElement.play();
                    mdui.snackbar({
                        message: '由于浏览器政策，直播已静音，请手动打开',
                        position: 'bottom'
                    });
                }).then(() => {
                    // Auto-play started
                });
            }
        });

    }

}

function parse_benben(odata) {
    // console.log(odata);
    odata = (odata);
    var data = odata.msg;
    var onlineNum = odata.online_num;
    var onlinePeople = odata.online;
    document.getElementById("onlinenumber").innerHTML = `<i class="mdui-icon mdui-icon-left material-icons">people</i>` + "在线 " + String(onlineNum) + " 人";
    document.getElementById("show_number").innerText = "有 " + String(onlineNum) + " 人正在👋🐟";
    document.getElementById("show_people").innerHTML = "";
    for (var i = 0; i < onlineNum; i++) {
        document.getElementById("show_people").innerHTML += `<li class="mdui-list-item mdui-ripple">${onlinePeople[i].username}</li>`;
    }
    j = (data);
    // 按时间排序
    j.sort(function (a, b) {
        return b.time - a.time;
    });
    var tmptxt = '';
    for (i in j) {
        var msg = j[i];
        // 防止注入
        msg.user = msg.user.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        msg.msg = msg.msg.replace(/</g, "&lt;").replace(/>/g, "&gt;");

        var hasLink = false;

        if ("tag" in msg) {
            msg.tag.content = msg.tag.content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            msg.tag.content = msg.tag.content.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
            msg.tag.content = msg.tag.content.replace(/\*(.*?)\*/g, "<i>$1</i>");
            msg.tag.content = msg.tag.content.replace(/__(.*?)__/g, "<u>$1</u>");
            msg.tag.content = msg.tag.content.replace(/~~(.*?)~~/g, "<del>$1</del>");
            // 如果有超链接，记录为true
            if (/\[(.*?)\]\((.*?)\)/g.test(msg.tag.content)) {
                hasLink = true;
            }
            // msg.tag.content = msg.tag.content.replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' target='_blank'>$1</a>");
            // 超链接 但是要window.open 不要用a标签
            msg.tag.content = msg.tag.content.replace(/\[(.*?)\]\((.*?)\)/g, "<span onclick='window.open(\"$2\")'>$1</span>");
        }

        var originMsg = msg.msg
        // msg markdown 转为 html 用正则
        msg.msg = msg.msg.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
        msg.msg = msg.msg.replace(/\*(.*?)\*/g, "<i>$1</i>");
        msg.msg = msg.msg.replace(/__(.*?)__/g, "<u>$1</u>");
        msg.msg = msg.msg.replace(/~~(.*?)~~/g, "<del>$1</del>");
        msg.msg = msg.msg.replace(/`(.*?)`/g, "<code>$1</code>");
        // 图片 限制宽度长度
        msg.msg = msg.msg.replace(/!\[(.*?)\]\((.*?)\)/g, "<img src='$2' alt='$1' style='max-width:100%;max-height:100%;' />");
        // 超链接
        msg.msg = msg.msg.replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' target='_blank'>$1</a>");
        // 添加 latex 支持
        msg.msg = msg.msg.replace(/\$\$(.*?)\$\$/g, "<img src='https://latex.codecogs.com/svg.latex?$1'>");
        msg.msg = msg.msg.replace(/\$(.*?)\$/g, "<img src='https://latex.codecogs.com/svg.latex?$1'>");
        // 引用
        msg.msg = msg.msg.replace(/&gt;(.*)/g, "<blockquote>$1</blockquote>");
        // 表情：如 :kk: 换成图片地址： https://xn--9zr.tk/kk
        // msg.msg = msg.msg.replace(/:(.*?):/g, "<img src='https://xn--9zr.tk/$1' alt='$1' style='max-width:100%;max-height:100%;' />");

        var timeChinese = new Date(msg.time * 1000).toLocaleString();
        timeChinese = timeChinese.substr(5);
        var lgurl = "https://www.luogu.com.cn/user/" + msg.uid;
        var iptag;
        if ("geo" in msg) {
            iptag = `<span class="tag" style="color: rgb(255, 255, 255); background: rgb(255, 0, 128);">` + msg.geo + `</span>`
        } else {
            iptag = ``
        }
        var tag;
        if ("tag" in msg) {
            tag = `<span class="tag" style="color: ` + msg.tag.fontcolor + `; background: ` + msg.tag.background + `">` + msg.tag.content + `</span>`
            // 如果 hasLink 为 true，那么设置tag鼠标的样式为pointer
            if (hasLink) {
                tag = `<span class="tag" style="color: ` + msg.tag.fontcolor + `; background: ` + msg.tag.background + `;cursor:pointer;" onclick="window.open('` + msg.tag.link + `')">` + msg.tag.content + `</span>`
            }
        } else {
            tag = ``
        }
        var needhidden = "";
        if (String(window['uid']) != String(msg.uid)) {
            needhidden = "hidden='hidden'";
        }
        txt = `<div class="mdui-typo">
            <div class="am-comment-main">
                <header class="am-comment-hd">
                    <div class="am-comment-meta">
                        <!-- 头像 圆的 -->
                        <a href="` + lgurl + `" target="_blank" class="am-comment-author" style="display: inline-block;">
                            <img src="https://cdn.luogu.com.cn/upload/usericon/` + msg.uid + `.png" alt="" style="border-radius:100%; overflow:hidden;" class="am-comment-avatar" width="30" height="30">
                        </a>
                        <span class="feed-username">
                            <a href="`+ lgurl + `" target="_blank">@` + msg.user + `</a>
                        </span> 
                        `+ iptag + `
                        `+ tag + `
                        `+ timeChinese + `
                        <a href="javascript:void(0);" class="am-fr" onclick="replyto('@`+ msg.user + ` ：` + originMsg.replace('\n', '') + `')">回复</a>
                        <a href="javascript:void(0);" class="am-fr" onclick="msgdel('${String(msg.time)}')" ${needhidden}>删除</a>
                    </div>
                </header>
                <div class="am-comment-bd">
                    `+ msg.msg + `
                </div>
            </div>
        </div>`
        tmptxt += txt;
    }
    if (document.querySelector("#benben").innerHTML != tmptxt) {
        document.querySelector("#benben").innerHTML = tmptxt;
    }
}

function parse_music(data) {
    // console.log(data);
    if (data == false) {
        window['isPlaying'] = false;
        if (window['music'] != 'none') {
            try {
                document.getElementById("liveimg").remove();
            } catch (e) { }
            try {
                document.getElementById("live").remove();
            } catch (e) { }
            try {
                document.getElementById("livebot").remove();
            } catch (e) { }
            document.getElementById("media").innerHTML += `<iframe id="livebot" src="/musicPlayer/index.html"  width="100%" frameborder="no" border="0" marginwidth="0" marginheight="0" scrolling="no"></iframe>`;
            // document.getElementById("sub").innerText = "云听歌 - 暂无歌曲";
            document.getElementById("livebot").style.height = getWindowHeight() * 0.23 + "px";
            window['music'] = 'none';
        } else {
            window['music'] = "none";
            try {
                document.getElementById("liveimg").remove();
            } catch (e) { }
            try {
                document.getElementById("live").remove();
            } catch (e) { }
        }
    } else {
        if (window['isPlaying']) {
            return;
        } else {
            window['isPlaying'] = true;
        }
        j = (data);
        // console.log(j);
        window['musicUrls'] = [j['url'].replace("http://", "https://")];
        // window['musicUrls'] = ['/musicPlayer/music1.mp3'];
        window['artistNameData'] = [j['artist'] + "（@" + j['username'] + "）"];
        window['musicNameData'] = [j['title']];
        originimg = j['img'].replace("http://", "https://");
        // origin:https://p1.music.126.net/0eBConsur4ghIhTfNLU3MA==/109951167611318783.jpg
        // proxy:https://163pic.oiso.cf/0eBConsur4ghIhTfNLU3MA==/109951167611318783.jpg
        // proxyimg=originimg.replace("https://p1.music.126.net/","https://163pic.oiso.cf/");
        window['musicImgsData'] = [originimg];
        try {
            document.getElementById("liveimg").remove();
        } catch (e) { }
        try {
            document.getElementById("live").remove();
        } catch (e) { }
        try {
            document.getElementById("livebot").remove();
        } catch (e) { }
        window['music'] = 'true';
        setTimeout(function () {
            document.getElementById("media").innerHTML += `<iframe id="live" src="/musicPlayer/index.html"  width="100%" frameborder="no" border="0" marginwidth="0" marginheight="0" scrolling="no"></iframe>`;
            document.getElementById("live").style.height = getWindowHeight() * 0.23 + "px";
        }, 10);
    }
}

function parse_spiderstatus(data) {
    document.querySelector("#spider-status").innerHTML = data + `<div class="mdui-progress">
<div class="mdui-progress-indeterminate"></div>
</div>`;
}

function get_benben() {
    fetch(window['api'] + "/getmsg", {
        credentials: 'include'
    }).then(function (response) {
        return response.text();
    }).then(function (odata) {
        // console.log(odata);
        odata = JSON.parse(odata);
        var data = odata.msg;
        var onlineNum = odata.onlinenum;
        var onlinePeople = odata.online;
        document.getElementById("onlinenumber").innerHTML = `<i class="mdui-icon mdui-icon-left material-icons">people</i>` + "在线 " + String(onlineNum) + " 人";
        document.getElementById("show_number").innerText = "有 " + String(onlineNum) + " 人正在👋🐟";
        document.getElementById("show_people").innerHTML = "";
        for (var i = 0; i < onlineNum; i++) {
            document.getElementById("show_people").innerHTML += `<li class="mdui-list-item mdui-ripple">${onlinePeople[i]}</li>`;
        }
        j = (data);
        // 按时间排序
        j.sort(function (a, b) {
            return b.time - a.time;
        });
        var tmptxt = '';
        for (i in j) {
            var msg = j[i];
            // 防止注入
            msg.user = msg.user.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            msg.msg = msg.msg.replace(/</g, "&lt;").replace(/>/g, "&gt;");

            var hasLink = false;

            if ("tag" in msg) {
                msg.tag.content = msg.tag.content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                msg.tag.content = msg.tag.content.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
                msg.tag.content = msg.tag.content.replace(/\*(.*?)\*/g, "<i>$1</i>");
                msg.tag.content = msg.tag.content.replace(/__(.*?)__/g, "<u>$1</u>");
                msg.tag.content = msg.tag.content.replace(/~~(.*?)~~/g, "<del>$1</del>");
                // 如果有超链接，记录为true
                if (/\[(.*?)\]\((.*?)\)/g.test(msg.tag.content)) {
                    hasLink = true;
                }
                // msg.tag.content = msg.tag.content.replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' target='_blank'>$1</a>");
                // 超链接 但是要window.open 不要用a标签
                msg.tag.content = msg.tag.content.replace(/\[(.*?)\]\((.*?)\)/g, "<span onclick='window.open(\"$2\")'>$1</span>");
            }

            var originMsg = msg.msg
            // msg markdown 转为 html 用正则
            msg.msg = msg.msg.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
            msg.msg = msg.msg.replace(/\*(.*?)\*/g, "<i>$1</i>");
            msg.msg = msg.msg.replace(/__(.*?)__/g, "<u>$1</u>");
            msg.msg = msg.msg.replace(/~~(.*?)~~/g, "<del>$1</del>");
            msg.msg = msg.msg.replace(/`(.*?)`/g, "<code>$1</code>");
            // 图片 限制宽度长度
            msg.msg = msg.msg.replace(/!\[(.*?)\]\((.*?)\)/g, "<img src='$2' alt='$1' style='max-width:100%;max-height:100%;' />");
            // 超链接
            msg.msg = msg.msg.replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' target='_blank'>$1</a>");
            // 添加 latex 支持
            msg.msg = msg.msg.replace(/\$\$(.*?)\$\$/g, "<img src='https://latex.codecogs.com/svg.latex?$1'>");
            msg.msg = msg.msg.replace(/\$(.*?)\$/g, "<img src='https://latex.codecogs.com/svg.latex?$1'>");
            // 引用
            msg.msg = msg.msg.replace(/&gt;(.*)/g, "<blockquote>$1</blockquote>");
            // 表情：如 :kk: 换成图片地址： https://xn--9zr.tk/kk
            // msg.msg = msg.msg.replace(/:(.*?):/g, "<img src='https://xn--9zr.tk/$1' alt='$1' style='max-width:100%;max-height:100%;' />");

            var timeChinese = new Date(msg.time * 1000).toLocaleString();
            timeChinese = timeChinese.substr(5)
            var lgurl = "https://www.luogu.com.cn/user/" + msg.uid;
            var iptag;
            if ("geo" in msg) {
                iptag = `<span class="tag" style="color: rgb(255, 255, 255); background: rgb(255, 0, 128);">` + msg.geo + `</span>`
            } else {
                iptag = ``
            }
            var tag;
            if ("tag" in msg) {
                tag = `<span class="tag" style="color: ` + msg.tag.fontcolor + `; background: ` + msg.tag.background + `">` + msg.tag.content + `</span>`
                // 如果 hasLink 为 true，那么设置tag鼠标的样式为pointer
                if (hasLink) {
                    tag = `<span class="tag" style="color: ` + msg.tag.fontcolor + `; background: ` + msg.tag.background + `;cursor:pointer;" onclick="window.open('` + msg.tag.link + `')">` + msg.tag.content + `</span>`
                }
            } else {
                tag = ``
            }
            var needhidden = "";
            if (String(window['uid']) != String(msg.uid)) {
                needhidden = "hidden='hidden'";
            }
            txt = `<div class="mdui-typo">
                <div class="am-comment-main">
                    <header class="am-comment-hd">
                        <div class="am-comment-meta">
                            <!-- 头像 圆的 -->
                            <a href="` + lgurl + `" target="_blank" class="am-comment-author" style="display: inline-block;">
                                <img src="https://cdn.luogu.com.cn/upload/usericon/` + msg.uid + `.png" alt="" style="border-radius:100%; overflow:hidden;" class="am-comment-avatar" width="30" height="30">
                            </a>
                            <span class="feed-username">
                                <a href="`+ lgurl + `" target="_blank">@` + msg.user + `</a>
                            </span> 
                            `+ iptag + `
                            `+ tag + `
                            `+ timeChinese + `
                            <a href="javascript:void(0);" class="am-fr" onclick="replyto('@`+ msg.user + ` ：` + originMsg.replace('\n', '') + `')">回复</a>
                            <a href="javascript:void(0);" class="am-fr" onclick="msgdel('${String(msg.time)}')" ${needhidden}>删除</a>
                            </div>
                    </header>
                    <div class="am-comment-bd">
                        `+ msg.msg + `
                    </div>
                </div>
            </div>`
            tmptxt += txt;

            // var txt = `<div class="mdui-typo">`;
            // var timeChinese = new Date(msg.time * 1000).toLocaleString();
            // var lgurl = "https://www.luogu.com.cn/user/" + msg.uid;
            // txt += `<a href="` + lgurl + `" mdui-tooltip="{content: '发表于 ` + timeChinese + `', delay: 0}">@` + msg.user + `</a>：` + msg.msg + ``;
            // txt += `</div>`;
            // tmptxt += txt;
        }
        document.querySelector("#benben").innerHTML = tmptxt;
    }).catch(function () {
        mdui.snackbar("更新犇犇失败：" + error);
    });
}

function msgdel(time) {
    mdui.confirm("确定删除这条犇犇吗？", "删除犇犇", function () {
        // https://api.oiso.cf:2096/msg/delete?time=1674726448.608633
        var url = window['api'] + "/msg/delete?time=" + time;
        fetch(url, {
            method: "GET",
            mode: "cors",
            credentials: "include"
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            if (data.code == 200) {
                mdui.snackbar("删除成功！");
            } else {
                mdui.snackbar("删除失败：" + data.msg);
            }
        }).catch(function (error) {
            mdui.snackbar("删除失败：" + error);
        });
    });
}