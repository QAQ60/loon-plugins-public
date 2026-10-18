/*
 * 考试宝接口诊断脚本（临时）
 * 作用：把命中 MITM 的考试宝相关请求 URL 通过通知弹出 / 写入日志
 * 不改写任何响应体，只做记录
 */
(function () {
    var url = ($request && $request.url) ? $request.url : "";
    if (!url) { $done({}); return; }

    var pure = url.split("?")[0];
    var hitPath = /userInfo|kaoShi|paper|mockExam|document|questions|search|vip|member|banner/i.test(pure);

    if (hitPath) {
        var host = "";
        try { host = pure.split("/")[2]; } catch (e) {}
        console.log("[ksb-debug] HOST=" + host + " URL=" + pure);
        $notification.post("考试宝命中: " + host, pure.replace(/^https?:\/\//, ""), "可截图反馈");
    }
    $done({});
})();
