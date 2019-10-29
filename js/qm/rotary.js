// 引入 时间转换 模块
var time2HSEB = require('./time2HSEB');


// -------------------------------- Constant --------------------------------

// 旋转位：宫位 —— 巽4宫为起点（无 中5宫）
const loc_palace_dict = {0: 4, 1: 9, 2: 2, 3: 7, 4: 6, 5: 1, 6: 8, 7: 3};

// 宫位：旋转位
const pa_location_dict = {1: 5, 2: 2, 3: 7, 4: 0, 6: 4, 7: 3, 8: 6, 9: 1};

// 元
const yuan_Solar_Terms = [  // [上,中,下]
    [8,5,2],    [9,6,3],    [1,7,4],
    [3,9,6],    [4,1,7],    [5,2,8],
    [4,1,7],    [5,2,8],    [6,3,9],
    [9,3,6],    [8,2,5],    [7,1,4],
    [2,5,8],    [1,4,7],    [9,3,6],
    [7,1,4],    [6,9,3],    [5,8,2],
    [6,9,3],    [5,8,2],    [4,7,1],
    [1,7,4],    [2,8,5],    [3,9,6]
];

// 阴阳
const gender_dict = {0:"阴", 1:"阳"};

//驿马：（规则）申子辰 马在 寅，寅午戌 马在 申，亥卯未 马在 巳，巳酉丑 马在 亥
const horse_dict =  {0: 6, 1: 3, 2: 12, 3: 9};

// 地支：宫ID
const EB_dict = {
    1: 1, 2: 8, 3: 8, 4: 3, 5: 4, 6: 4,
    7: 9, 8: 2, 9: 2, 10: 7, 11: 6, 12: 6
};



// -------------------------------- Function --------------------------------

// 数组位移 输入须为 数组！
function array_shift(arr_in, p_o, p_g) {
    var n = p_g - p_o;
    if (n == 0) {
        return arr_in;
    } else {
        var arr_out = [];
        var len = arr_in.length;
        if (n < 0) {
            // 左移
            arr_out = arr_in.slice( -(len - n), len);
            arr_out = arr_out.concat(arr_in.slice(0, - n));
            arr_out = arr_out.slice( -len, arr_out.length);
        } else {
            // 右移 n > 0
            arr_out = arr_in.slice( -n, len);
            arr_out = arr_out.concat(arr_in.slice(0, len - n));
            arr_out = arr_out.slice( 0, len);
        }
        // console.log("\nSequence after Rotate:", arr_out);
        return arr_out;
    }
}

// 旋转，返回的数组按宫序排列
function rotary_shift(pa_dict, pa_o, pa_g) {

    var loc_arr = new Array(8);
    var id_loc = 0;
    // 八宫序 -> 旋转序
    for (var id_pa = 1; id_pa <= 9; id_pa++) {
        if (id_pa == 5) {
            continue;   // 中5宫 跳过
        } else {
            id_loc = pa_location_dict[id_pa];
            loc_arr[id_loc] = pa_dict[id_pa];
        }
    }
    // console.log("\nRotary Step 1: palace to location", loc_arr);

    // 旋转序 位移
    pa_o = (pa_o == 5)? 2:pa_o;     // 5宫 寄 2宫
    pa_g = (pa_g == 5)? 2:pa_g;     // 5宫 寄 2宫
    var loc_o = pa_location_dict[pa_o];
    var loc_g = pa_location_dict[pa_g];
    loc_arr = array_shift(loc_arr, loc_o, loc_g);
    // console.log("\nRotary Step 2: location order", loc_arr);

    // 旋转序 -> 八宫序
    var output_pa_dict = {};
    for (var i = 0; i < 8; i++) {
        id_loc = i;
        output_pa_dict[loc_palace_dict[id_loc]] = loc_arr[id_loc];
    }
    // console.log("\nRotary Step 3: palace order", output_pa_dict);
    return output_pa_dict;
}

// 定元
function yuan_decide_ChaiBu(id_day) {
    // 拆补
    var yuan = Math.floor((id_day - 1) % 15 / 5);
    console.log("\nYuan:", yuan, "\ntips: 上 0   中 1   下 2");
    return yuan;
}

// 定局
function scene_decide (id_ST, yuan) {
    var gender = (id_ST > 9 && id_ST < 21)? 0 : 1;
    console.log("\nST ID:", id_ST);
    var scene = yuan_Solar_Terms[id_ST][yuan];
    console.log("\n", gender_dict[gender], "遁", scene, "局");
    var scene_dict = {"gender": gender, "scene": scene};
    return scene_dict;
}

// 空亡 宫 （根据 干支ID）
function palace_empty(id_HSEB) {
    var n = Math.floor((id_HSEB - 1) / 10);
    var id_EB = [11 - n*2, 12 - n*2];
    console.log("\n空亡 地支ID:", id_EB[0], id_EB[1]);

    var id_palace = [ EB_dict[id_EB[0]], EB_dict[id_EB[1]] ];
    console.log("\n空亡 宫ID:", id_palace[0], id_palace[1]);

    return id_palace;
}

// 驿马
function palace_horse(id_EB) {
    var n = Math.floor(id_EB % 4);
    var id_palace_horse = EB_dict[horse_dict[n]];

    console.log("\n驿马 宫ID:", id_palace_horse);
    return id_palace_horse;
}

// 遁甲之 干
function HS_hideout(id_HSEB) {
    var n = Math.floor((id_HSEB - 1) / 10);
    var id_HS_hideout = 5 + n;  // 戊 ID：5
    console.log("\n遁甲之 天干ID:", id_HS_hideout);
    return id_HS_hideout;
}

// 地盘（主）
function table_host(scene_dict) {
    var id_HS_arr = [5, 6, 7, 8, 9, 10, 4, 3, 2];
    var id_HS_pa_arr = [];
    if (scene_dict["gender"] == 1) {
        id_HS_pa_arr = array_shift(id_HS_arr, 1, scene_dict["scene"]);
    } else {
        id_HS_arr = id_HS_arr.reverse();
        id_HS_pa_arr = array_shift(id_HS_arr, 9, scene_dict["scene"]);
    }

    var HS_pa_dict = {};
    for (var i = 1; i <= 9; i++) {
        HS_pa_dict[i] = id_HS_pa_arr[i - 1];
    }

    console.log("\n地盘 宫:天干 ", HS_pa_dict);
    return HS_pa_dict;
}

// 值符星、值使门 所出之 宫
function palace_ruler (pa_HS_dict, id_HS_hideout) {
    var id_ruler = 0;
    for (var i = 1; i <= 9; i++) {
        if (pa_HS_dict[i] == id_HS_hideout) {
            id_ruler = i;
            break;
        }
    }
    console.log("\n值符 所在 宫ID:", id_ruler);
    return id_ruler;
}

// 时干 地盘落宫
function palace_hourHS (table_host_dict, id_HS) {
    var id_pa = 0;
    for (var i = 1; i <= 9; i++) {
        id_pa = (table_host_dict[i] == id_HS) ? i : id_pa;
    }
    id_pa = (id_pa == 5) ? 2 : id_pa;
    console.log("\n时干 地盘落宫 :", id_pa);
    return id_pa;
}

// 人盘（门）
function table_door(scene_dict, id_HSEB, id_ruler_pa) {
    // console.log("\nDoor input:", scene_dict, id_HSEB, id_ruler_pa);
    // 飞宫 阳顺阴逆
    var steps = 0;
    for (var i = 1; i <= 6 ; i++) {
        if ((id_HSEB - i*10) <= 0) {
            steps = id_HSEB - ((i - 1)*10 + 1);
            break;
        }
    }
    if (scene_dict["gender"] == 0) {
        steps = - steps;
    }
    console.log("\n飞宫步数:", steps);

    var id_pa_o = id_ruler_pa;
    var id_pa_g = id_pa_o + steps;
    id_pa_g = (id_pa_g > 9)? (id_pa_g - 9) : id_pa_g;
    id_pa_g = (id_pa_g < 1)? (id_pa_g + 9) : id_pa_g;

    id_pa_g = (id_pa_g == 5)? 2 : id_pa_g;
    console.log("\n八门飞宫 ", id_pa_o,"->", id_pa_g);

    var door_dict = rotary_shift( {1: 1, 2: 2, 3: 3, 4: 4, 6: 6, 7: 7, 8: 8, 9: 9}, id_pa_o, id_pa_g);
    console.log("\n人盘 宫：八门", door_dict);
    return door_dict;
}

// 天盘（客）
function table_guest(table_host_dict, id_pa_Hhs, id_pa_o) {
    var id_pa_g = id_pa_Hhs;
    var guest_dict = rotary_shift(table_host_dict, id_pa_o, id_pa_g);
    console.log("\n天盘 宫：天干", guest_dict);
    return guest_dict;
}

// 星盘
function table_star(id_pa_Hhs, id_pa_o) {
    var id_pa_g = id_pa_Hhs;
    var star_dict = rotary_shift( {1: 1, 2: 2, 3: 3, 4: 4, 6: 6, 7: 7, 8: 8, 9: 9}, id_pa_o, id_pa_g);
    console.log("\n九星 宫：九星", star_dict);
    return star_dict;
}

// 神盘（8神）
function table_god(scene_dict, id_pa_Hhs) {
    var god_dict = {};
    // 八神排布，阳顺阴逆
    for (var i = 0; i < 8; i++) {
        god_dict[loc_palace_dict[i]] = (scene_dict["gender"] == 1)? (i + 1):(8 - i);
    }

    var id_pa_o = (scene_dict["gender"] == 1)? 4:3;
    var id_pa_g = id_pa_Hhs;
    god_dict = rotary_shift(god_dict, id_pa_o, id_pa_g);
    console.log("\n神盘 宫：八神", god_dict);
    return god_dict;
}

// 主函数
function getTable(time_str ) {
    var HSEB_dict = time2HSEB(time_str);
    console.log("being");
    var yuan = yuan_decide_ChaiBu(HSEB_dict["id_day"]);
    var scene_dict = scene_decide(HSEB_dict["id_ST"], yuan);
    var id_palace_empty = palace_empty(HSEB_dict["id_hour"]);
    var id_palace_horse = palace_horse(HSEB_dict["Heb"]);
    var id_HS_hideout = HS_hideout(HSEB_dict["id_hour"]);

    // 地盘：局
    var table_host_dict = table_host(scene_dict);

    // 地盘旬首天干落宫：地盘、
    var id_pa_ruler = palace_ruler(table_host_dict, id_HS_hideout);

    // 地盘时干落宫
    var id_pa_Hhs = palace_hourHS (table_host_dict, HSEB_dict["Hhs"]);

    // 人盘：阴/阳遁、时干支、值符原始宫
    var table_door_dict = table_door(scene_dict, HSEB_dict["id_hour"], id_pa_ruler);

    // 天盘：地盘、地盘时干落宫、值符原始宫
    var table_guest_dict = table_guest(table_host_dict, id_pa_Hhs, id_pa_ruler);

    // 星盘：地盘时干落宫、值符原始宫
    var table_star_dict = table_star(id_pa_Hhs, id_pa_ruler);

    // 神盘
    var table_god_dict = table_god(scene_dict, id_pa_Hhs);

    console.log("\nMain function complete!");
    return table_god_dict[2].toString();
}

module.exports = getTable;


// -------------------------------- Test Code --------------------------------
// var HSEB_dict = time2HSEB("2019-10-12 17:10:00");
// getTable("2019-10-12 17:10:00");
// rotary_shift({1: 1, 2: 2, 3: 3, 4: 4, 6: 6, 7: 7, 8: 8, 9: 9}, 2, 1);
