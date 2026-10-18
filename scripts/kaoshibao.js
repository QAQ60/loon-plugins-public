/*
 * 考试宝 / 驾校一点通 解锁脚本 v2
 * 适配：Loon 3.5.1+ / Shadowrocket 2.x / Quantumult X
 *
 * v2 变更：
 *  1. 响应体解析加固：容忍 Loon 把 HTTP 头拼进 body、BOM、首尾空白、gzip 残留
 *  2. 补全域名与接口：gw-api / richmanrules / search-api / kaoshiapi
 *  3. 修复 gw-api/app/config 大响应体被静默跳过的问题（分层兜底）
 *  4. 通知默认静默，排障时把 DEBUG 改成 true
 */
var DEBUG = false;

var VIP_TIME = "2099-09-09 09:09:09";

function notify(title, sub, body) {
    if (!DEBUG) return;
    try { $notification.post(title, sub || "", body || ""); } catch (e) {}
}

function log(msg) {
    try { console.log("[kaoshibao] " + msg); } catch (e) {}
}

/* ---------------- 响应体解析 ---------------- */

function parseBody(raw) {
    if (typeof raw !== "string" || !raw.length) return null;

    var s = String(raw);

    s = s.replace(/^\uFEFF/, "").replace(/^[\s\u0000-\u001F]+/, "");

    try { return JSON.parse(s); } catch (e) {}

    var opens = [s.indexOf("{"), s.indexOf("[")].filter(function (i) { return i >= 0; });
    if (opens.length) {
        var a = Math.min.apply(null, opens);
        var b = Math.max(s.lastIndexOf("}"), s.lastIndexOf("]"));
        if (b > a) {
            var cut = s.slice(a, b + 1);
            try { return JSON.parse(cut); } catch (e2) {}
        }
    }

    try {
        return JSON.parse(s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ""));
    } catch (e3) {}

    return null;
}

/* ---------------- 通用改写工具 ---------------- */

var LIMIT_KEY = /^(times|rest|rest_count|rest_times|free_count|free_times|remain|remain_count|remain_times|left_count|left_times|usable_count|ocr_limit|search_limit|daily_limit|photo_count|pic_count|qstskill_times|search_times)$/i;
var FLAG_KEY = /^(is_vip|isVip|need_pay|needPay|is_pay|isPay|can_search|canSearch|photo_search_status|need_vip|is_limit|is_buy|isBuy|is_expired|exercise_vip|is_vip_paper|forbid_search)$/i;

function inflateLimits(o) {
    (function walk(v, depth) {
        if (!v || typeof v !== "object" || depth > 8) return;
        for (var k in v) {
            var val = v[k];
            if (val && typeof val === "object") { walk(val, depth + 1); continue; }
            if (LIMIT_KEY.test(k)) {
                if (typeof val === "number") v[k] = 9999;
                else if (typeof val === "string") v[k] = "9999";
                else if (typeof val === "boolean") v[k] = true;
            } else if (FLAG_KEY.test(k)) {
                if (typeof val === "boolean") v[k] = true;
                else if (typeof val === "number") v[k] = 1;
                else if (typeof val === "string") v[k] = "1";
            }
        }
    })(o, 0);
    return o;
}

function clearBuyNumber(o) {
    (function walk(v, depth) {
        if (!v || typeof v !== "object" || depth > 8) return;
        for (var k in v) {
            if (k === "buy_number") v[k] = "0";
            else if (v[k] && typeof v[k] === "object") walk(v[k], depth + 1);
        }
    })(o, 0);
    return o;
}

function forgeVip(data) {
    if (!data || typeof data !== "object") return data;
    data.vip_type = "2";
    data.vip_level = "2";
    data.vip_expiration_time = VIP_TIME;
    data.yst_vip_type = "2";
    data.yst_vip_expiration_time = VIP_TIME;
    data.expiration_time = VIP_TIME;
    data.is_show_ad = "0";
    data.auto_analysis_package = "99999";
    data.remove_error_limit = "99999";
    if (data.rest_exam_count !== undefined) data.rest_exam_count = "9999";
    if (data.extra_exam_number !== undefined && data.extra_exam_number !== null) data.extra_exam_number = 9999;

    if (!data.feature_vips || !data.feature_vips.length) {
        data.feature_vips = [{ id: "1", name: "高级VIP", expiration_time: VIP_TIME }];
    }

    if (data.vip_config && typeof data.vip_config === "object") {
        data.vip_config.alert_title = data.vip_config.alert_title || "尊贵高级VIP";
        data.vip_config.desc = "已解锁所有高级权益";
        if (data.vip_config.price !== undefined) data.vip_config.price = "0";
        for (var k in data.vip_config) {
            if (/limit|count|num/i.test(k)) data.vip_config[k] = "9999999";
        }
    }
    return data;
}

function unlockPaper(data) {
    if (!data || typeof data !== "object") return data;

    var one = function (p) {
        if (!p || typeof p !== "object") return;
        if (p.price !== undefined) p.price = "0";
        if (p.sell_way !== undefined) p.sell_way = "0";
        if (p.status !== undefined) p.status = "8";
        if (p.have_downed !== undefined) p.have_downed = "1";
        if (p.is_buy !== undefined) p.is_buy = "1";
        if (p.is_expired !== undefined) p.is_expired = "0";
        if (p.exercise_vip !== undefined) p.exercise_vip = "1";
        if (p.need_password !== undefined) p.need_password = "0";
        if (p.password !== undefined) p.password = "";
        if (p.expiration_time !== undefined) p.expiration_time = VIP_TIME;
        if (p.free_download_num !== undefined) p.free_download_num = "999";
        if (p.enable_download !== undefined) p.enable_download = "1";
        if (p.is_vip_paper !== undefined) p.is_vip_paper = "1";
        if (p.forbid_search !== undefined) p.forbid_search = "0";
        if (p.preview_num !== undefined) p.preview_num = "99999";
        if (p.show_ad !== undefined) p.show_ad = "0";
        if (p.support_search !== undefined) p.support_search = "1";
        if (p.buy_number !== undefined) p.buy_number = "0";
    };

    one(data);
    if (data.paper) one(data.paper);
    if (data.kaoshi) one(data.kaoshi);
    if (Array.isArray(data.papers)) data.papers.forEach(one);
    if (Array.isArray(data.rows)) data.rows.forEach(one);
    if (Array.isArray(data.list)) data.list.forEach(one);
    if (data.paid_kaoshi_tip) data.paid_kaoshi_tip = "已解锁";
    if (data.paid_paper_tip) data.paid_paper_tip = "已解锁";
    return data;
}

/* ---------------- 各接口处理 ---------------- */

function handle(url, obj) {
    var host = (url.match(/^https?:\/\/([^\/]+)/) || [])[1] || "";
    var path = url.replace(/^https?:\/\/[^\/]+/, "").split("?")[0];

    if (/\/user\/userInfo\/get$/i.test(path) || /\/user\/userInfo\/getExtra$/i.test(path)) {
        if (obj.data && typeof obj.data === "object") {
            obj.data = forgeVip(obj.data);
        }
        return obj;
    }

    if (/\/user\/userInfo\/isJxtUser$/i.test(path)) {
        if (obj.data !== undefined) obj.data = "1";
        return obj;
    }

    if (/\/user\/identityVerification\/check$/i.test(path)) {
        if (obj.data && typeof obj.data === "object") {
            obj.data.verified = "1";
            obj.data.verified_id = "1";
        }
        return obj;
    }

    if (/\/coupon\/receiveTips$/i.test(path)) {
        if (obj.data && typeof obj.data === "object") {
            obj.data.display = "0";
        }
        return obj;
    }

    if (/\/coupon\/getExpireInfo$/i.test(path)) {
        return {
            code: "200",
            data: { has_coupon: "1", amount: "999", expired_at: VIP_TIME },
            time: String(Math.floor(Date.now() / 1000))
        };
    }

    if (/\/popup\/get$/i.test(path) || /\/popupAd\/get$/i.test(path)) {
        if (obj.data !== undefined && obj.data !== null) obj.data = null;
        return obj;
    }

    if (/\/banner\/get$/i.test(path)) {
        return { code: "200", data: null, time: String(Math.floor(Date.now() / 1000)) };
    }

    if (/\/user\/paper\/list$/i.test(path) ||
        /\/user\/record\/paperView$/i.test(path) ||
        /\/paper\/(home|topErrors)$/i.test(path) ||
        /\/document\/file$/i.test(path)) {
        obj.data = unlockPaper(obj.data);
        return obj;
    }

    if (/\/mockExam\/config$/i.test(path) || /\/kaoShi\//i.test(path)) {
        obj.data = unlockPaper(obj.data);
        if (obj.data && typeof obj.data === "object") {
            obj.data.rest_exam_count = obj.data.rest_exam_count || "9999";
        }
        return obj;
    }

    if (/\/questions\/fetch$/i.test(path)) {
        if (obj.code === "404" && obj.msg && /付费题库/.test(obj.msg)) {
            obj.msg = "顺序练习未解锁，请使用会员模拟考试功能";
        }
        if (obj.data) obj.data = inflateLimits(obj.data);
        return obj;
    }

    if (/\/search\/getOcrStatus$/i.test(path)) {
        return {
            code: "200",
            data: { limit: "99999", photo_search_status: "1" },
            time: String(Math.floor(Date.now() / 1000))
        };
    }

    if (/\/search\/ocr2$/i.test(path)) {
        return {
            code: "200",
            data: {
                text: "中国外汇交易中心外汇交易系统提供的交易模式包括().",
                origin_text: "10、中国外汇交易中心外汇交易系统提供的交易模式包括().\nA、询价交易\nB、中央对手方交易\nC、竞价交易\nD、做市商交易\n"
            },
            time: String(Math.floor(Date.now() / 1000)),
            encrypt: "pfyH4fnEjUqitg7wTbQ5S7=="
        };
    }

    if (/gw-api\.jxedt\.com\/app\/config/i.test(url)) {
        var r = obj.result || obj;
        if (r.qstskill && r.qstskill.data) {
            r.qstskill.data.times = 9999;
            if (r.qstskill.data.enable !== undefined) r.qstskill.data.enable = true;
        }
        if (r.photoSearchSwitch && r.photoSearchSwitch.data) {
            r.photoSearchSwitch.data.configVal = "1";
        }
        if (r.searchSwitch && r.searchSwitch.data) {
            r.searchSwitch.data.configVal = "1";
        }
        if (r.cleanNoAdvert && r.cleanNoAdvert.data) {
            r.cleanNoAdvert.data.CleanNoAdvertFlag = "1";
            r.cleanNoAdvert.data.total = "1";
        }
        if (r.adSdkSwitch4testPointVideo && r.adSdkSwitch4testPointVideo.data) {
            r.adSdkSwitch4testPointVideo.data.configVal = "0";
        }
        if (r.adSdkSwitch4simulationExam && r.adSdkSwitch4simulationExam.data) {
            r.adSdkSwitch4simulationExam.data.configVal = "0";
        }
        if (r.examPageLoadADSwitch && r.examPageLoadADSwitch.data) {
            r.examPageLoadADSwitch.data.configVal = "0";
        }
        if (r.advert_interval) {
            r.advert_interval.data = { homead: { interval: 99999, scrollinterval: 0 } };
        }
        if (r.homead && r.homead.data) {
            r.homead.data.inteval = 99999;
        }
        return obj;
    }

    if (/adConfig\.json/i.test(path)) {
        var d = (obj.result && obj.result.data) ? obj.result.data : null;
        if (d && typeof d === "object") {
            if (d.sdkInitSwitch) d.sdkInitSwitch = {};
            if (d.webViewSwitch) d.webViewSwitch.value = "false";
            var offKeys = ["splash", "insertScreen", "banner", "feed", "rewardVideo", "fullScreenVideo", "draw", "interstitial", "nativeExpress"];
            for (var i = 0; i < offKeys.length; i++) {
                var kk = offKeys[i];
                if (d[kk] && typeof d[kk] === "object" && d[kk].hasOwnProperty("value")) d[kk].value = 0;
            }
        }
        return obj;
    }

    if (/search-api\.ksedt\.com/i.test(host)) {
        if (obj.data && typeof obj.data === "object") {
            obj.data = inflateLimits(obj.data);
            obj.data.can_search = 1;
            obj.data.photo_search_status = "1";
        }
        return obj;
    }

    if (/\/help\/common\/getConfig$/i.test(path)) {
        if (obj.data && obj.data.switch) {
            obj.data.switch.photo_search_auto_crop = "1";
        }
        return obj;
    }

    // 未识别的接口一律不动，避免误伤埋点/统计/配置类请求
    return null;
}

/* ---------------- 入口 ---------------- */

(function () {
    var url = ($request && $request.url) || "";
    var raw = ($response && $response.body) || "";

    if (!raw) {
        log("empty body: " + url);
        notify("考试宝: 响应体为空", "脚本已执行，但没拿到 body", "检查 Loon 是否开启抓包( MITM )");
        $done({});
        return;
    }

    var obj = parseBody(raw);
    if (obj === null) {
        log("parse failed: " + url + " | head=" + String(raw).slice(0, 100));
        notify("考试宝: 解析失败", url.replace(/^https?:\/\//, "").slice(0, 60), String(raw).slice(0, 80));
        $done({});
        return;
    }

    try {
        var out = handle(url, obj);
        if (out === null) {
            // 白名单外接口：原样放行
            log("skip: " + url);
            $done({});
            return;
        }
        obj = clearBuyNumber(out);
        log("ok: " + url);
        notify("考试宝: 已改写", url.replace(/^https?:\/\//, "").slice(0, 60), "");
        $done({ body: JSON.stringify(obj) });
    } catch (e) {
        log("handle error: " + e + " | " + url);
        notify("考试宝: 改写异常", String(e).slice(0, 60), url.slice(0, 60));
        $done({});
    }
})();
