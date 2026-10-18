/*
[rewrite_local]
^https:\/\/api\.ankianki\.com\/banner\/get$ url reject
^https:\/\/(api\.ankianki\.com|search-api\.yisouti\.com)\/(user\/userInfo\/get|search\/(getOcrStatus|ocr2|mixPaper)|kaoShi\/.*|paper\/(home|topErrors)|user\/coupon\/getExpireInfo|mockExam\/config|document\/file|questions\/fetch) url script-response-body https://raw.githubusercontent.com/QAQ60/loon-plugins-public/master/scripts/kaoshibao.js

[mitm]
hostname = api.ankianki.com, search-api.yisouti.com
*/

function unlockSearch(o) {
    // 只放宽"剩余次数"类字段，不动 limit / total_count 这类分页或统计字段
    var LIMIT = /^(times|rest|rest_count|rest_times|free_count|free_times|remain|remain_count|remain_times|left_count|left_times|usable_count|ocr_limit|search_limit|daily_limit|photo_count|pic_count)$/i;
    var FLAG = /^(is_vip|isVip|need_pay|needPay|is_pay|isPay|can_search|canSearch|photo_search_status|need_vip|is_limit)$/i;
    (function walk(v) {
        if (!v || typeof v !== "object") return;
        for (var k in v) {
            var val = v[k];
            if (val && typeof val === "object") { walk(val); continue; }
            if (LIMIT.test(k) && (typeof val === "number" || typeof val === "string")) {
                v[k] = (typeof val === "number") ? 9999 : "9999";
            } else if (FLAG.test(k)) {
                v[k] = (typeof val === "boolean") ? true : (typeof val === "number" ? 1 : "1");
            }
        }
    })(o);
    return o;
}

(function () {
const url = $request.url;
const body = $response.body;

if (!body) {
    try {
        if (/userinfo/i.test($request.url)) {
            $notification.post("考试宝: body 为空", "脚本已执行，但 Loon 未提供响应体", "请对照是否开着抓包");
        }
    } catch (e) {}
    $done({});
    return;
}

function setBuyNumberToZero(obj) {
    if (typeof obj !== "object" || obj === null) return;
    for (let key in obj) {
        if (key === "buy_number") {
            obj[key] = "0";
        } else {
            setBuyNumberToZero(obj[key]);
        }
    }
}

try {
    let obj = JSON.parse(body);

    if (/search-api\.ksedt\.com/i.test(url)) {
        obj = unlockSearch(obj);
    }
    else if (/gw-api\.jxedt\.com\/app\/config/i.test(url)) {
        if (obj.result && obj.result.qstskill && obj.result.qstskill.data) {
            obj.result.qstskill.data.times = 9999;
            if (obj.result.qstskill.data.enable !== undefined) obj.result.qstskill.data.enable = 1;
        }
    }
    else if (/userinfo/i.test(url) && obj.data) {
        obj.data.vip_type = "2";
        obj.data.vip_level = "2";
        obj.data.vip_expiration_time = "2099-09-09 09:09:09";
        obj.data.yst_vip_type = "2";
        obj.data.yst_vip_expiration_time = "2099-09-09 09:09:09";
        obj.data.is_show_ad = "0";
        obj.data.auto_analysis_package = "99999";
        obj.data.remove_error_limit = "99999";
        if (obj.data.rest_exam_count !== undefined) obj.data.rest_exam_count = "9999";
        
        if (!obj.data.feature_vips) {
            obj.data.feature_vips = [{
                "id": "1",
                "name": "高级VIP",
                "expiration_time": "2099-09-09 09:09:09"
            }];
        }

        if (obj.data.vip_config) {
            obj.data.vip_config.alert_title = "尊贵高级VIP";
            obj.data.vip_config.desc = "已解锁所有高级权益";
            for (let key in obj.data.vip_config) {
                if (key.includes("limit")) obj.data.vip_config[key] = "9999999";
            }
        }
    } 
    else if (url.includes("search/getOcrStatus")) {
        obj = {
            "code": "200",
            "data": {
                "limit": "99999",
                "photo_search_status": "1"
            },
            "time": String(Math.floor(Date.now() / 1000))
        };
    } 
    else if (url.includes("search/ocr2")) {
        obj = {
            "code": "200",
            "data": {
                "text": "中国外汇交易中心外汇交易系统提供的交易模式包括().",
                "origin_text": "10、中国外汇交易中心外汇交易系统提供的交易模式包括().\nA、询价交易\nB、中央对手方交易\nC、竞价交易\nD、做市商交易\n11、利率与远期汇率和升水、贴水之间的关系是().\n"
            },
            "time": String(Math.floor(Date.now() / 1000)),
            "encrypt": "pfyH4fnEjUqitg7wTbQ5S7=="
        };
    } 
    else if (url.includes("paper/topErrors")) {
        obj = {
            "code": "200",
            "data": {
                "questions": {},
                "total": "0",
                "page_count": "0"
            },
            "time": String(Math.floor(Date.now() / 1000))
        };
    } 
    else if (url.includes("user/coupon/getExpireInfo")) {
        obj = {
            "code": "200",
            "data": {
                "has_coupon": "1",
                "amount": "999",
                "expired_at": "2099-09-09 09:09:09"
            },
            "time": String(Math.floor(Date.now() / 1000))
        };
    } 
    else if (url.includes("questions/fetch")) {
        if (obj.code === "404" && obj.msg && obj.msg.includes("付费题库")) {
            obj.msg = "顺序练习未解锁，直接用会员功能模拟考试";
        }
    }
    else if (url.includes("document/file")) {
        if (obj.data) {
            obj.data.sell_way = "0";
            obj.data.price = "0";
            obj.data.status = "8";
            obj.data.free_download_num = "999";
            obj.data.have_downed = "1";
            obj.data.is_buy = "1";
            
            if (obj.data.pages) {
                obj.data.preview_page = obj.data.pages;
            }
        }
    }
    else {
        if (obj.data) {
            if (obj.data.hasOwnProperty("sell_way")) obj.data.sell_way = "0";
            if (obj.data.hasOwnProperty("price")) obj.data.price = "0";
            if (obj.data.hasOwnProperty("have_downed")) obj.data.have_downed = "1";
            if (obj.data.hasOwnProperty("status")) obj.data.status = "8";
            if (obj.data.hasOwnProperty("free_download_num")) obj.data.free_download_num = "999"; 
            if (obj.data.hasOwnProperty("is_buy")) obj.data.is_buy = "1";
            if (obj.data.hasOwnProperty("is_expired")) obj.data.is_expired = "0";
            if (obj.data.hasOwnProperty("exercise_vip")) obj.data.exercise_vip = "1";
            if (obj.data.hasOwnProperty("expiration_time")) obj.data.expiration_time = "2099-09-09 09:09:09";
            if (obj.data.hasOwnProperty("need_password")) obj.data.need_password = "0";
            if (obj.data.paid_kaoshi_tip) obj.data.paid_kaoshi_tip = "已解锁";
            if (obj.data.paid_paper_tip) obj.data.paid_paper_tip = "已解锁";

            if (obj.data.kaoshi) {
                obj.data.kaoshi.status = "1";
                obj.data.kaoshi.price = "0";
                obj.data.kaoshi.is_buy = 1;
            }

            if (obj.data.paper) {
                obj.data.paper.price = "0";
                obj.data.paper.status = "1";
                obj.data.paper.show_ad = "0";
                obj.data.paper.enable_download = "1";
                obj.data.paper.is_vip_paper = "1";
                obj.data.paper.forbid_search = "0";
                obj.data.paper.preview_num = "99999"; 
            }

            if (obj.data.papers && Array.isArray(obj.data.papers)) {
                obj.data.papers.forEach(element => {
                    element.price = "0";
                    element.enable_download = "1";
                    element.is_vip_paper = "1";
                    element.sell_way = "0";
                    element.status = "8";
                });
            }
        }
    }

    setBuyNumberToZero(obj);

    $done({ body: JSON.stringify(obj) });
} catch (e) {
    console.log("[kaoshibao] parse failed: " + e + " | body head: " + String(body).slice(0, 120));
    $notification.post("考试宝脚本已命中，但响应不是 JSON", String(body).slice(0, 60), "接口可能加密或改版");
    $done({});
}
})();
