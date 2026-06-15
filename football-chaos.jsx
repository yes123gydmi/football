import { useState, useEffect, useRef, useCallback } from "react";

// ================================================================
// 足球大亂鬥 ─ Football Chaos Battle
// Pure frontend card football game with localStorage save
// ================================================================

// ─── QUALITY SYSTEM ──────────────────────────────────────────────
const QUALITIES = {
  white:  { id:"white",  name:"白卡", color:"#9CA3AF", glow:"rgba(156,163,175,0.6)", bg:"#0f172a", weight:40,  mult:1.00 },
  green:  { id:"green",  name:"綠卡", color:"#4ade80", glow:"rgba(74,222,128,0.6)",  bg:"#052e16", weight:25,  mult:1.15 },
  blue:   { id:"blue",   name:"藍卡", color:"#60a5fa", glow:"rgba(96,165,250,0.6)",  bg:"#0c1a3d", weight:18,  mult:1.30 },
  purple: { id:"purple", name:"紫卡", color:"#c084fc", glow:"rgba(192,132,252,0.6)", bg:"#2d1854", weight:10,  mult:1.45 },
  orange: { id:"orange", name:"橙卡", color:"#fb923c", glow:"rgba(251,146,60,0.6)",  bg:"#431407", weight:5,   mult:1.60 },
  red:    { id:"red",    name:"紅卡", color:"#f87171", glow:"rgba(248,113,113,0.6)", bg:"#450a0a", weight:1.5, mult:1.80 },
  myth:   { id:"myth",   name:"神話", color:"#fde047", glow:"rgba(253,224,71,0.9)",  bg:"#1a1100", weight:0.5, mult:2.10 },
};
const Q_ORDER = ["white","green","blue","purple","orange","red","myth"];

// ─── PLAYER FACTIONS ─────────────────────────────────────────────
const PLAYER_FACTIONS = [
  { id:"shaolin", name:"少林足球", icon:"🥋", color:"#d97706", dark:"#78350f",
    desc:"剛猛霸道，鐵頭功攻門無人能擋。", trait:"力量+15%  速度-5%",
    lore:"少林寺武僧下山，以佛門至剛之力踢出天下無敵的足球，一腳射門如炮彈轟鳴。" },
  { id:"wudang",  name:"武當足球", icon:"☯️", color:"#3b82f6", dark:"#1e3a8a",
    desc:"以柔克剛，太極控球行雲流水。",   trait:"技術+15%  控球+10%",
    lore:"武當玄門，太極妙法化百練鋼為繞指柔，球在腳下如行雲流水，令對手無從捉摸。" },
  { id:"beggar",  name:"丐幫足球", icon:"🏒", color:"#78716c", dark:"#44403c",
    desc:"打狗棒法，纏鬥不休永不放棄。",   trait:"體力+20%  愈戰愈強",
    lore:"天下第一大幫，幫眾遍布天下，雖衣衫襤褸卻鬥志昂揚，永不言敗。" },
  { id:"emei",    name:"峨眉足球", icon:"🌸", color:"#ec4899", dark:"#9d174d",
    desc:"身法輕盈，速度與技巧的化身。",   trait:"速度+20%  突破+10%",
    lore:"峨眉仙子，輕功絕倫，在球場上如蝴蝶穿花，速度之快令後衛望塵莫及。" },
  { id:"kunlun",  name:"崑崙足球", icon:"❄️", color:"#8b5cf6", dark:"#4c1d95",
    desc:"冰封防線，銅牆鐵壁滴水不漏。",   trait:"防守+20%  穩定+10%",
    lore:"崑崙山巔，寒冰功法護體，防線如銅牆鐵壁，任何攻勢都如石沉大海。" },
  { id:"huashan", name:"華山足球", icon:"⚔️", color:"#22c55e", dark:"#14532d",
    desc:"劍宗氣宗，攻守兼備全面均衡。",   trait:"全屬性+8%  完美均衡",
    lore:"華山論劍之地，劍氣縱橫四海，攻守兼備乃天下正道，無論何種局面皆能應對。" },
];

// ─── ENEMY FACTIONS ──────────────────────────────────────────────
const ENEMY_FACTIONS = [
  { id:"bloodblade", name:"血刀足球", icon:"🗡️", color:"#dc2626", power:55, league:"bronze",
    desc:"招招見血，殺傷力極強",   style:"aggressive" },
  { id:"fivepoison", name:"五毒足球", icon:"☠️", color:"#65a30d", power:62, league:"bronze",
    desc:"詭計多端，防不勝防",     style:"tricky" },
  { id:"mingjiao",   name:"明教足球", icon:"🔥", color:"#f97316", power:70, league:"silver",
    desc:"聖火令下，萬眾一心",     style:"power" },
  { id:"scythe",     name:"鐮刀足球", icon:"⚒️", color:"#b45309", power:68, league:"silver",
    desc:"刀法凌厲，速攻無比",     style:"speed" },
  { id:"bloodsha",   name:"血煞足球", icon:"💢", color:"#991b1b", power:76, league:"gold",
    desc:"血海滔天，銅皮鐵骨",     style:"tank" },
  { id:"demon",      name:"魔教足球", icon:"👿", color:"#7c3aed", power:82, league:"gold",
    desc:"邪功大成，難以匹敵",     style:"magic" },
  { id:"evil",       name:"邪派足球", icon:"💀", color:"#be185d", power:73, league:"gold",
    desc:"陰險狡詐，無所不用其極", style:"dirty" },
  { id:"insect",     name:"蟲族足球", icon:"🦂", color:"#4d7c0f", power:85, league:"master",
    desc:"蟲海戰術，數量取勝",     style:"swarm" },
];

// ─── CARD POOL ───────────────────────────────────────────────────
const CARD_TEMPLATES = [
  // SHAOLIN
  { id:"s01", name:"空見大師",   faction:"shaolin", pos:"GK",  q:"purple", icon:"🧘", spd:58, pow:72, ski:65, def:88 },
  { id:"s02", name:"阿星",       faction:"shaolin", pos:"ST",  q:"orange", icon:"⚽", spd:82, pow:90, ski:78, def:42 },
  { id:"s03", name:"鐵頭功",     faction:"shaolin", pos:"CB",  q:"blue",   icon:"🥋", spd:55, pow:82, ski:58, def:85 },
  { id:"s04", name:"鐵腿功",     faction:"shaolin", pos:"CM",  q:"blue",   icon:"🦵", spd:68, pow:78, ski:72, def:65 },
  { id:"s05", name:"鐵臂功",     faction:"shaolin", pos:"CB",  q:"green",  icon:"💪", spd:52, pow:75, ski:55, def:80 },
  { id:"s06", name:"金剛羅漢",   faction:"shaolin", pos:"CDM", q:"purple", icon:"🛕", spd:60, pow:80, ski:68, def:82 },
  { id:"s07", name:"達摩祖師",   faction:"shaolin", pos:"CAM", q:"myth",   icon:"☀️", spd:75, pow:95, ski:92, def:75 },
  { id:"s08", name:"掃地僧",     faction:"shaolin", pos:"CM",  q:"red",    icon:"🧹", spd:88, pow:95, ski:95, def:88 },
  { id:"s09", name:"空智大師",   faction:"shaolin", pos:"RB",  q:"green",  icon:"🎯", spd:70, pow:65, ski:68, def:72 },
  { id:"s10", name:"空性大師",   faction:"shaolin", pos:"LB",  q:"green",  icon:"🎭", spd:70, pow:65, ski:68, def:72 },
  { id:"s11", name:"覺遠",       faction:"shaolin", pos:"LW",  q:"blue",   icon:"🌟", spd:80, pow:70, ski:78, def:48 },
  { id:"s12", name:"少林小僧",   faction:"shaolin", pos:"RW",  q:"white",  icon:"🐒", spd:72, pow:60, ski:65, def:45 },
  // WUDANG
  { id:"w01", name:"張三豐",     faction:"wudang",  pos:"CAM", q:"myth",   icon:"☯️", spd:78, pow:85, ski:98, def:78 },
  { id:"w02", name:"張無忌",     faction:"wudang",  pos:"ST",  q:"orange", icon:"🌊", spd:85, pow:82, ski:88, def:55 },
  { id:"w03", name:"太極真人",   faction:"wudang",  pos:"CM",  q:"purple", icon:"🌀", spd:72, pow:70, ski:85, def:68 },
  { id:"w04", name:"宋遠橋",     faction:"wudang",  pos:"CB",  q:"blue",   icon:"🛡️", spd:60, pow:72, ski:68, def:82 },
  { id:"w05", name:"殷梨亭",     faction:"wudang",  pos:"LW",  q:"blue",   icon:"⚡", spd:82, pow:65, ski:80, def:48 },
  { id:"w06", name:"莫聲谷",     faction:"wudang",  pos:"CDM", q:"green",  icon:"🌿", spd:65, pow:68, ski:72, def:75 },
  { id:"w07", name:"俞蓮舟",     faction:"wudang",  pos:"GK",  q:"purple", icon:"💧", spd:60, pow:68, ski:70, def:88 },
  { id:"w08", name:"俞岱岩",     faction:"wudang",  pos:"RB",  q:"blue",   icon:"🏃", spd:72, pow:65, ski:68, def:74 },
  { id:"w09", name:"武當紫霞",   faction:"wudang",  pos:"LB",  q:"purple", icon:"🌸", spd:78, pow:62, ski:75, def:72 },
  { id:"w10", name:"武當玄武",   faction:"wudang",  pos:"CB",  q:"orange", icon:"🐢", spd:58, pow:75, ski:72, def:90 },
  { id:"w11", name:"武當小俠",   faction:"wudang",  pos:"CM",  q:"white",  icon:"🗡️", spd:65, pow:60, ski:70, def:62 },
  { id:"w12", name:"武當金鐘",   faction:"wudang",  pos:"RW",  q:"green",  icon:"🔔", spd:75, pow:65, ski:72, def:50 },
  // BEGGAR SECT
  { id:"b01", name:"洪七公",     faction:"beggar",  pos:"CAM", q:"myth",   icon:"🍗", spd:80, pow:88, ski:92, def:80 },
  { id:"b02", name:"郭靖",       faction:"beggar",  pos:"CB",  q:"orange", icon:"🦅", spd:65, pow:85, ski:72, def:90 },
  { id:"b03", name:"黃蓉",       faction:"beggar",  pos:"CM",  q:"orange", icon:"🌺", spd:78, pow:68, ski:92, def:65 },
  { id:"b04", name:"魯智深",     faction:"beggar",  pos:"CDM", q:"purple", icon:"⚒️", spd:62, pow:82, ski:68, def:80 },
  { id:"b05", name:"武松",       faction:"beggar",  pos:"LW",  q:"purple", icon:"🐯", spd:85, pow:80, ski:78, def:52 },
  { id:"b06", name:"史進",       faction:"beggar",  pos:"ST",  q:"blue",   icon:"🐉", spd:78, pow:78, ski:72, def:45 },
  { id:"b07", name:"丐幫長老",   faction:"beggar",  pos:"GK",  q:"blue",   icon:"🎋", spd:58, pow:65, ski:62, def:85 },
  { id:"b08", name:"九袋弟子",   faction:"beggar",  pos:"RB",  q:"green",  icon:"💼", spd:70, pow:62, ski:65, def:72 },
  { id:"b09", name:"八袋弟子",   faction:"beggar",  pos:"LB",  q:"green",  icon:"👜", spd:70, pow:62, ski:65, def:72 },
  { id:"b10", name:"降龍十八掌", faction:"beggar",  pos:"CB",  q:"red",    icon:"🐲", spd:65, pow:92, ski:75, def:88 },
  { id:"b11", name:"打狗棒法",   faction:"beggar",  pos:"CM",  q:"red",    icon:"🏒", spd:78, pow:80, ski:85, def:70 },
  { id:"b12", name:"丐幫小弟",   faction:"beggar",  pos:"RW",  q:"white",  icon:"🍖", spd:68, pow:58, ski:62, def:45 },
  // EMEI
  { id:"e01", name:"天山童姥",   faction:"emei",    pos:"ST",  q:"myth",   icon:"👧", spd:92, pow:80, ski:95, def:65 },
  { id:"e02", name:"周芷若",     faction:"emei",    pos:"CAM", q:"red",    icon:"🌹", spd:88, pow:75, ski:90, def:60 },
  { id:"e03", name:"滅絕師太",   faction:"emei",    pos:"CDM", q:"orange", icon:"⚔️", spd:72, pow:80, ski:78, def:82 },
  { id:"e04", name:"小昭",       faction:"emei",    pos:"LW",  q:"purple", icon:"🎵", spd:90, pow:65, ski:85, def:48 },
  { id:"e05", name:"峨眉仙子",   faction:"emei",    pos:"RW",  q:"blue",   icon:"🦋", spd:88, pow:62, ski:82, def:45 },
  { id:"e06", name:"靈蛇島主",   faction:"emei",    pos:"CM",  q:"blue",   icon:"🐍", spd:80, pow:68, ski:78, def:60 },
  { id:"e07", name:"白玉蟾",     faction:"emei",    pos:"GK",  q:"purple", icon:"🐸", spd:65, pow:65, ski:72, def:88 },
  { id:"e08", name:"峨眉神尼",   faction:"emei",    pos:"CB",  q:"green",  icon:"🌙", spd:62, pow:70, ski:65, def:80 },
  { id:"e09", name:"輕靈劍",     faction:"emei",    pos:"LB",  q:"green",  icon:"💫", spd:82, pow:60, ski:75, def:68 },
  { id:"e10", name:"玉女劍法",   faction:"emei",    pos:"RB",  q:"blue",   icon:"💖", spd:82, pow:60, ski:75, def:70 },
  { id:"e11", name:"峨眉快腿",   faction:"emei",    pos:"ST",  q:"green",  icon:"⚡", spd:85, pow:72, ski:70, def:42 },
  { id:"e12", name:"峨眉小師妹", faction:"emei",    pos:"CM",  q:"white",  icon:"🎀", spd:70, pow:58, ski:68, def:55 },
  // KUNLUN
  { id:"k01", name:"崑崙掌門",   faction:"kunlun",  pos:"CB",  q:"orange", icon:"🏔️", spd:62, pow:82, ski:72, def:92 },
  { id:"k02", name:"冰晶神功",   faction:"kunlun",  pos:"GK",  q:"red",    icon:"❄️", spd:62, pow:70, ski:75, def:95 },
  { id:"k03", name:"雪山門主",   faction:"kunlun",  pos:"CM",  q:"orange", icon:"🌬️", spd:72, pow:72, ski:78, def:78 },
  { id:"k04", name:"白雪仙子",   faction:"kunlun",  pos:"LW",  q:"purple", icon:"⛄", spd:85, pow:65, ski:80, def:52 },
  { id:"k05", name:"玄冰護體",   faction:"kunlun",  pos:"CB",  q:"purple", icon:"🧊", spd:58, pow:75, ski:65, def:92 },
  { id:"k06", name:"崑崙長老",   faction:"kunlun",  pos:"CDM", q:"blue",   icon:"🌨️", spd:62, pow:70, ski:68, def:85 },
  { id:"k07", name:"冰魄銀針",   faction:"kunlun",  pos:"CAM", q:"blue",   icon:"🔮", spd:75, pow:65, ski:78, def:62 },
  { id:"k08", name:"崑崙弟子",   faction:"kunlun",  pos:"LB",  q:"green",  icon:"🏔️", spd:68, pow:62, ski:62, def:78 },
  { id:"k09", name:"崑崙劍客",   faction:"kunlun",  pos:"RB",  q:"green",  icon:"🗡️", spd:68, pow:62, ski:62, def:78 },
  { id:"k10", name:"崑崙神鷹",   faction:"kunlun",  pos:"ST",  q:"blue",   icon:"🦅", spd:80, pow:75, ski:72, def:48 },
  { id:"k11", name:"寒冰真氣",   faction:"kunlun",  pos:"CM",  q:"white",  icon:"🌀", spd:65, pow:62, ski:68, def:70 },
  { id:"k12", name:"冰霜護衛",   faction:"kunlun",  pos:"RW",  q:"green",  icon:"🛡️", spd:72, pow:62, ski:65, def:75 },
  // HUASHAN
  { id:"h01", name:"令狐沖",     faction:"huashan", pos:"ST",  q:"myth",   icon:"⚔️", spd:90, pow:88, ski:96, def:72 },
  { id:"h02", name:"風清揚",     faction:"huashan", pos:"CDM", q:"red",    icon:"🌊", spd:85, pow:85, ski:95, def:80 },
  { id:"h03", name:"岳不群",     faction:"huashan", pos:"CAM", q:"red",    icon:"🎭", spd:80, pow:82, ski:90, def:72 },
  { id:"h04", name:"任盈盈",     faction:"huashan", pos:"CM",  q:"orange", icon:"🎸", spd:78, pow:72, ski:88, def:68 },
  { id:"h05", name:"獨孤九劍",   faction:"huashan", pos:"RW",  q:"orange", icon:"✨", spd:88, pow:80, ski:90, def:52 },
  { id:"h06", name:"岳靈珊",     faction:"huashan", pos:"LW",  q:"blue",   icon:"🌸", spd:82, pow:68, ski:80, def:50 },
  { id:"h07", name:"華山劍宗",   faction:"huashan", pos:"CB",  q:"purple", icon:"🗡️", spd:65, pow:78, ski:72, def:85 },
  { id:"h08", name:"華山劍氣",   faction:"huashan", pos:"CB",  q:"blue",   icon:"💨", spd:62, pow:72, ski:68, def:82 },
  { id:"h09", name:"勞德諾",     faction:"huashan", pos:"GK",  q:"green",  icon:"🛡️", spd:60, pow:65, ski:65, def:82 },
  { id:"h10", name:"高根明",     faction:"huashan", pos:"RB",  q:"green",  icon:"🏃", spd:72, pow:65, ski:65, def:75 },
  { id:"h11", name:"天下第一劍", faction:"huashan", pos:"CM",  q:"purple", icon:"🌟", spd:75, pow:78, ski:82, def:68 },
  { id:"h12", name:"華山小弟子", faction:"huashan", pos:"LB",  q:"white",  icon:"🌱", spd:65, pow:60, ski:62, def:70 },
];

// ─── FORMATION ───────────────────────────────────────────────────
const FORMATION = [
  { slot:0,  label:"GK",  matchPos:["GK"],          x:50, y:87 },
  { slot:1,  label:"RB",  matchPos:["RB"],          x:80, y:72 },
  { slot:2,  label:"CB",  matchPos:["CB"],          x:62, y:72 },
  { slot:3,  label:"CB",  matchPos:["CB"],          x:38, y:72 },
  { slot:4,  label:"LB",  matchPos:["LB"],          x:20, y:72 },
  { slot:5,  label:"CM",  matchPos:["CM","CDM"],    x:75, y:50 },
  { slot:6,  label:"CM",  matchPos:["CM","CDM","CAM"], x:50, y:48 },
  { slot:7,  label:"CM",  matchPos:["CM","CAM"],    x:25, y:50 },
  { slot:8,  label:"RW",  matchPos:["RW","ST","CAM"], x:82, y:28 },
  { slot:9,  label:"ST",  matchPos:["ST","CF"],     x:50, y:22 },
  { slot:10, label:"LW",  matchPos:["LW","ST","CAM"], x:18, y:28 },
];

// ─── LEAGUES ─────────────────────────────────────────────────────
const LEAGUES = [
  { id:"bronze", name:"青銅聯賽", icon:"🥉", color:"#cd7f32", matches:50,  min:48, max:65 },
  { id:"silver", name:"白銀聯賽", icon:"🥈", color:"#c0c0c0", matches:100, min:63, max:76 },
  { id:"gold",   name:"黃金聯賽", icon:"🥇", color:"#ffd700", matches:300, min:72, max:86 },
  { id:"master", name:"宗師聯賽", icon:"👑", color:"#e040fb", matches:500, min:80, max:96 },
];

// ─── COMMENTARY ──────────────────────────────────────────────────
const GOAL_LINES = [
  "一腳勁射！球如閃電般撕裂防線！⚡","妙傳！射門！球入網了！🎉",
  "個人突破！過掉三名後衛，輕鬆推射！","頭球攻門！勢不可擋！",
  "遠射！守門員完全沒有反應！💥","絕妙的角度，皮球入網！",
  "一對一！冷靜地將球塞入遠角！","助攻精準，補射得分！⚽",
  "任意球直接射門，壁壘牆毫無用處！","反擊速攻，一劍封喉！🗡️",
];
const ENEMY_GOAL_LINES = [
  "對手強力射門，守門員措手不及！","對手抓住空隙，打入反擊球！",
  "失誤！防守出現漏洞！對方得分！","角球頭球，防守失職！",
  "遠射球飛進，守門員撲救不及！","對手前鋒輕鬆破門！",
  "點球！冷靜罰入！","對手個人突破，射門得分！",
];
const EVENT_LINES = [
  "黃牌！雙方局勢緊張！🟨","精彩配合，但射偏了！",
  "守門員神勇撲救，保住了比分！🧤","角球進攻，但被清除了！",
  "中場混戰，雙方寸土必爭！","替補球員即將上場！",
  "裁判吹停比賽，醫療人員入場！","精彩鏟球，化解危機！",
  "橫樑！差一點就進了！","對方撲救，球打在柱子上彈出！🏒",
];
const SAVE_LINES = [
  "守門員神勇出擊！擊球出界！🧤","飛身救球！精彩！",
  "雙手撲住強力射門！","撲出點球！守門員英雄！",
];

// ─── UTILITIES ───────────────────────────────────────────────────
function rollQuality() {
  const total = Object.values(QUALITIES).reduce((s,q) => s + q.weight, 0);
  let r = Math.random() * total;
  for (const q of Q_ORDER) {
    r -= QUALITIES[q].weight;
    if (r <= 0) return q;
  }
  return "white";
}

function calcOverall(card) {
  return Math.round((card.spd + card.pow + card.ski + card.def) / 4);
}

function buildCard(tmpl, quality) {
  const q = quality || tmpl.q;
  const mult = QUALITIES[q].mult;
  const spd = Math.min(99, Math.round(tmpl.spd * mult));
  const pow = Math.min(99, Math.round(tmpl.pow * mult));
  const ski = Math.min(99, Math.round(tmpl.ski * mult));
  const def = Math.min(99, Math.round(tmpl.def * mult));
  return { ...tmpl, quality: q, spd, pow, ski, def,
           overall: Math.round((spd+pow+ski+def)/4),
           uid: tmpl.id + "_" + Date.now() + "_" + Math.random().toString(36).slice(2,6) };
}

function drawCards(n, faction) {
  // Pity: in 10-pull guarantee at least 1 blue+
  const pool = CARD_TEMPLATES.filter(t => t.faction === faction || Math.random() < 0.3);
  const results = [];
  let hasBlue = false;
  for (let i = 0; i < n; i++) {
    const tmpl = pool[Math.floor(Math.random() * pool.length)];
    let q = rollQuality();
    if (i === n-1 && n === 10 && !hasBlue) {
      const blueIdx = Q_ORDER.indexOf("blue");
      if (Q_ORDER.indexOf(q) < blueIdx) q = "blue";
    }
    if (Q_ORDER.indexOf(q) >= Q_ORDER.indexOf("blue")) hasBlue = true;
    results.push(buildCard(tmpl, q));
  }
  return results;
}

function teamRating(lineup) {
  const cards = lineup.filter(Boolean);
  if (!cards.length) return 50;
  return Math.round(cards.reduce((s,c) => s + c.overall, 0) / cards.length);
}

function simulateMatch(rating, enemy, faction) {
  const f = PLAYER_FACTIONS.find(f => f.id === faction) || PLAYER_FACTIONS[5];
  const eRating = enemy.power + Math.floor(Math.random() * 10 - 5);
  const events = [];
  const score = { p:0, e:0 };

  // chance per minute
  const pRate = (rating / (rating + eRating)) * 0.09;
  const eRate = (eRating / (rating + eRating)) * 0.08;

  for (let m = 1; m <= 90; m++) {
    const r = Math.random();
    if (r < pRate) {
      score.p++;
      events.push({ min:m, type:"pGoal", text: GOAL_LINES[Math.floor(Math.random()*GOAL_LINES.length)] });
    } else if (r < pRate + eRate) {
      score.e++;
      events.push({ min:m, type:"eGoal", text: ENEMY_GOAL_LINES[Math.floor(Math.random()*ENEMY_GOAL_LINES.length)] });
    } else if (r < pRate + eRate + 0.06) {
      events.push({ min:m, type:"event", text: EVENT_LINES[Math.floor(Math.random()*EVENT_LINES.length)] });
    }
  }

  const result = score.p > score.e ? "win" : score.p < score.e ? "lose" : "draw";
  const pts = result === "win" ? 3 : result === "draw" ? 1 : 0;
  const coins = result === "win" ? 150 + Math.floor(Math.random()*100) : result === "draw" ? 80 : 40;
  return { score, events, result, pts, coins, rating, eRating };
}

// ─── SAVE / LOAD ─────────────────────────────────────────────────
const SAVE_KEY = "football_chaos_v1";
function saveGame(state) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch(e) {}
}
function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return null;
}
function newGame(factionId) {
  const faction = PLAYER_FACTIONS.find(f => f.id === factionId);
  const fCards = CARD_TEMPLATES.filter(t => t.faction === factionId);
  // Starter pack: 5 cards at white/green
  const startCards = fCards.slice(0,5).map((t,i) => buildCard(t, i < 2 ? "green" : "white"));
  // Auto fill lineup with best cards per slot
  const lineup = autoFillLineup(startCards);
  return {
    faction: factionId,
    coins: 1200,
    cards: startCards,
    lineup, // array of 11 card uids or null
    bench: [],  // array of card uids
    subs: 5,
    league: { current:0, wins:0, draws:0, losses:0, points:0, totalMatches:0, history:[] },
    stats: { totalGoals:0, totalWins:0 },
  };
}

function autoFillLineup(cards) {
  const lineup = Array(11).fill(null);
  const used = new Set();
  FORMATION.forEach((slot, idx) => {
    const best = cards
      .filter(c => !used.has(c.uid) && slot.matchPos.includes(c.pos))
      .sort((a,b) => b.overall - a.overall)[0];
    if (best) { lineup[idx] = best; used.add(best.uid); }
  });
  // Fill remaining slots with any unused card
  FORMATION.forEach((slot, idx) => {
    if (!lineup[idx]) {
      const any = cards.filter(c => !used.has(c.uid))[0];
      if (any) { lineup[idx] = any; used.add(any.uid); }
    }
  });
  return lineup;
}

// ─── COMPONENTS ──────────────────────────────────────────────────
function QBadge({ q }) {
  const qd = QUALITIES[q];
  return (
    <span style={{ fontSize:10, fontWeight:700, padding:"1px 5px", borderRadius:4,
      background: qd.bg, color: qd.color, border: `1px solid ${qd.color}`, letterSpacing:1 }}>
      {qd.name}
    </span>
  );
}

function StatBar({ label, val, color="#f87171" }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
      <span style={{ width:22, fontSize:10, color:"#9ca3af", fontWeight:700 }}>{label}</span>
      <div style={{ flex:1, height:6, background:"#1f2937", borderRadius:3, overflow:"hidden" }}>
        <div style={{ width:`${val}%`, height:"100%", background:color, borderRadius:3,
          boxShadow:`0 0 6px ${color}` }} />
      </div>
      <span style={{ width:22, textAlign:"right", fontSize:10, color:"#e5e7eb", fontWeight:700 }}>{val}</span>
    </div>
  );
}

function CardDisplay({ card, small, selected, onClick }) {
  if (!card) return null;
  const qd = QUALITIES[card.quality];
  const faction = PLAYER_FACTIONS.find(f => f.id === card.faction);
  const fc = faction?.color || "#9ca3af";
  return (
    <div onClick={onClick} style={{
      position:"relative", cursor: onClick ? "pointer" : "default",
      background: `linear-gradient(160deg, ${qd.bg} 0%, #0a0a14 100%)`,
      border: `2px solid ${selected ? "#fde047" : qd.color}`,
      borderRadius: small ? 10 : 14,
      padding: small ? "8px 10px" : "12px",
      width: small ? 90 : 130,
      boxShadow: selected ? `0 0 16px #fde047` : `0 0 12px ${qd.glow}`,
      transition:"all 0.2s",
      transform: selected ? "scale(1.06)" : "scale(1)",
      userSelect:"none",
    }}>
      <div style={{ textAlign:"center", fontSize: small ? 22 : 32, marginBottom: small?2:4 }}>{card.icon}</div>
      <div style={{ textAlign:"center", fontSize: small?9:11, fontWeight:700,
        color: qd.color, marginBottom:2, letterSpacing:0.5 }}>
        {card.name}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom: small?2:4 }}>
        <span style={{ fontSize:9, color:fc, fontWeight:700 }}>{card.pos}</span>
        <span style={{ fontSize:9, color:"#fde047", fontWeight:700 }}>⭐{card.overall}</span>
      </div>
      {!small && <>
        <StatBar label="速" val={card.spd} color="#60a5fa" />
        <StatBar label="力" val={card.pow} color="#f87171" />
        <StatBar label="術" val={card.ski} color="#4ade80" />
        <StatBar label="守" val={card.def} color="#a78bfa" />
      </>}
      {small && <div style={{ textAlign:"center", fontSize:10, color:qd.color, fontWeight:700 }}>
        OVR {card.overall}
      </div>}
      <div style={{ position:"absolute", top:5, right:5 }}><QBadge q={card.quality} /></div>
    </div>
  );
}

// ─── SCREEN: HOME ────────────────────────────────────────────────
function HomeScreen({ onStart, onContinue, hasSave }) {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 900);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ minHeight:"100vh", background:"#080810",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      fontFamily:"'Segoe UI',sans-serif", padding:24, position:"relative", overflow:"hidden" }}>
      {/* Background orbs */}
      <div style={{ position:"absolute", top:"10%", left:"15%", width:200, height:200,
        background:"radial-gradient(circle, rgba(192,57,43,0.15) 0%, transparent 70%)", borderRadius:"50%" }} />
      <div style={{ position:"absolute", bottom:"15%", right:"10%", width:250, height:250,
        background:"radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)", borderRadius:"50%" }} />
      {/* Logo */}
      <div style={{ textAlign:"center", marginBottom:8 }}>
        <div style={{ fontSize:52, marginBottom:6 }}>⚽</div>
        <h1 style={{ fontSize:38, fontWeight:900, letterSpacing:4,
          background:"linear-gradient(135deg, #c0392b 0%, #f39c12 50%, #c0392b 100%)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          margin:0, marginBottom:4, textShadow:"none" }}>
          足球大亂鬥
        </h1>
        <div style={{ fontSize:13, color:"#9ca3af", letterSpacing:6, marginBottom:4 }}>
          FOOTBALL · CHAOS · BATTLE
        </div>
        <div style={{ width:120, height:2, background:"linear-gradient(90deg,transparent,#c0392b,transparent)",
          margin:"0 auto 16px" }} />
        <p style={{ color:"#6b7280", fontSize:13, letterSpacing:2, margin:0 }}>
          武俠卡牌足球對決
        </p>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:12, marginTop:40, width:"100%", maxWidth:240 }}>
        {hasSave && (
          <button onClick={onContinue} style={{
            padding:"14px 0", borderRadius:12, border:"2px solid #c0392b",
            background:"linear-gradient(135deg,#2d0a0a,#1a0a0a)",
            color:"#f87171", fontSize:16, fontWeight:700, cursor:"pointer",
            letterSpacing:3, transition:"all 0.2s",
            boxShadow:"0 0 20px rgba(192,57,43,0.3)",
          }}
          onMouseEnter={e=>e.target.style.boxShadow="0 0 30px rgba(192,57,43,0.6)"}
          onMouseLeave={e=>e.target.style.boxShadow="0 0 20px rgba(192,57,43,0.3)"}>
            ⚔️ 繼續遊戲
          </button>
        )}
        <button onClick={onStart} style={{
          padding:"14px 0", borderRadius:12, border:"2px solid #d4af37",
          background:"linear-gradient(135deg,#3d2a00,#1a1200)",
          color:"#fde047", fontSize:16, fontWeight:700, cursor:"pointer",
          letterSpacing:3, transition:"all 0.2s",
          boxShadow: pulse ? "0 0 30px rgba(212,175,55,0.5)" : "0 0 15px rgba(212,175,55,0.2)",
        }}>
          🏆 {hasSave ? "新遊戲" : "開始遊戲"}
        </button>
      </div>

      <div style={{ position:"absolute", bottom:20, color:"#374151", fontSize:11, letterSpacing:2 }}>
        六大正派 vs 八大邪派 · 江湖爭霸
      </div>
    </div>
  );
}

// ─── SCREEN: FACTION SELECT ───────────────────────────────────────
function FactionSelectScreen({ onSelect }) {
  const [hover, setHover] = useState(null);
  return (
    <div style={{ minHeight:"100vh", background:"#080810", fontFamily:"'Segoe UI',sans-serif",
      padding:"20px 16px 40px", overflowY:"auto" }}>
      <div style={{ textAlign:"center", marginBottom:24 }}>
        <h2 style={{ fontSize:26, fontWeight:900, color:"#fde047", letterSpacing:4, margin:0 }}>
          選擇你的門派
        </h2>
        <p style={{ color:"#6b7280", fontSize:13, marginTop:6, letterSpacing:2 }}>
          每個門派風格不同，先選一個入門
        </p>
        <div style={{ width:80, height:2, background:"linear-gradient(90deg,transparent,#c0392b,transparent)",
          margin:"10px auto 0" }} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, maxWidth:520, margin:"0 auto" }}>
        {PLAYER_FACTIONS.map(f => (
          <div key={f.id}
            onClick={() => onSelect(f.id)}
            onMouseEnter={() => setHover(f.id)}
            onMouseLeave={() => setHover(null)}
            style={{
              background: hover===f.id
                ? `linear-gradient(160deg, ${f.dark} 0%, #0d0d20 100%)`
                : "linear-gradient(160deg,#111121 0%,#080810 100%)",
              border: `2px solid ${hover===f.id ? f.color : "#1f2937"}`,
              borderRadius:16, padding:16, cursor:"pointer",
              transition:"all 0.25s",
              boxShadow: hover===f.id ? `0 0 24px ${f.color}44` : "none",
              transform: hover===f.id ? "scale(1.03)" : "scale(1)",
            }}>
            <div style={{ fontSize:36, textAlign:"center", marginBottom:8 }}>{f.icon}</div>
            <div style={{ fontWeight:800, fontSize:15, color: f.color, textAlign:"center",
              marginBottom:6, letterSpacing:1 }}>{f.name}</div>
            <div style={{ fontSize:12, color:"#9ca3af", textAlign:"center", lineHeight:1.5,
              marginBottom:8 }}>{f.desc}</div>
            <div style={{ fontSize:11, color:"#4ade80", textAlign:"center",
              background:"#052e1688", borderRadius:6, padding:"4px 8px" }}>
              {f.trait}
            </div>
          </div>
        ))}
      </div>

      {hover && (
        <div style={{ maxWidth:520, margin:"20px auto 0", background:"#0d0d20",
          border:"1px solid #1f2937", borderRadius:12, padding:"14px 18px" }}>
          <p style={{ color:"#9ca3af", fontSize:12, lineHeight:1.7, margin:0 }}>
            {PLAYER_FACTIONS.find(f => f.id===hover)?.lore}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── SCREEN: MAIN HUB ────────────────────────────────────────────
function MainHubScreen({ gs, navigate }) {
  const faction = PLAYER_FACTIONS.find(f => f.id === gs.faction);
  const l = LEAGUES[gs.league.current];
  const ov = teamRating(gs.lineup);
  const progress = gs.league.current < LEAGUES.length
    ? gs.league.totalMatches / l.matches : 1;

  const menuItems = [
    { icon:"🃏", label:"我的卡牌", sub:`${gs.cards.length} 張`, screen:"cards" },
    { icon:"✨", label:"抽卡招募", sub:`${gs.coins} 金幣`, screen:"draw" },
    { icon:"⚔️", label:"出征比賽", sub:`OVR ${ov}`, screen:"league" },
    { icon:"🏟️", label:"戰隊陣容", sub:"修改陣容", screen:"team" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#080810",
      fontFamily:"'Segoe UI',sans-serif", padding:16, overflowY:"auto" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20,
        background:"linear-gradient(135deg,#111121,#0d0d20)",
        border:"1px solid #1f2937", borderRadius:16, padding:"14px 18px" }}>
        <div style={{ fontSize:36 }}>{faction?.icon}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:800, fontSize:17, color:faction?.color }}>{faction?.name}</div>
          <div style={{ fontSize:12, color:"#9ca3af" }}>江湖等級: OVR {ov}</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:14, color:"#fde047", fontWeight:700 }}>💰 {gs.coins}</div>
          <div style={{ fontSize:11, color:"#9ca3af" }}>金幣</div>
        </div>
      </div>

      {/* League Progress */}
      <div style={{ background:"#0d0d20", border:"1px solid #1f2937", borderRadius:14,
        padding:"14px 18px", marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ color:l.color, fontWeight:700, fontSize:14 }}>{l.icon} {l.name}</span>
          <span style={{ color:"#9ca3af", fontSize:12 }}>
            {gs.league.wins}勝 {gs.league.draws}平 {gs.league.losses}敗
          </span>
        </div>
        <div style={{ background:"#1f2937", borderRadius:6, height:8, overflow:"hidden" }}>
          <div style={{ width:`${Math.min(progress*100,100)}%`, height:"100%",
            background:`linear-gradient(90deg,${l.color},${l.color}88)`,
            transition:"width 0.5s" }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
          <span style={{ fontSize:11, color:"#6b7280" }}>場次進度</span>
          <span style={{ fontSize:11, color:l.color }}>
            {gs.league.totalMatches}/{l.matches}
          </span>
        </div>
        <div style={{ display:"flex", gap:12, marginTop:10 }}>
          {[{label:"積分",val:gs.league.points},{label:"總場次",val:gs.league.totalMatches},{label:"勝率",val: gs.league.totalMatches ? Math.round(gs.league.wins/gs.league.totalMatches*100)+"%" : "0%"}].map(s=>(
            <div key={s.label} style={{ flex:1, textAlign:"center", background:"#111121",
              borderRadius:8, padding:"6px 0" }}>
              <div style={{ fontSize:15, fontWeight:700, color:"#fde047" }}>{s.val}</div>
              <div style={{ fontSize:10, color:"#6b7280" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {menuItems.map(m => (
          <button key={m.screen} onClick={() => navigate(m.screen)}
            style={{ background:"linear-gradient(160deg,#111121,#080810)",
              border:"1px solid #1f2937", borderRadius:14, padding:"20px 16px",
              cursor:"pointer", transition:"all 0.2s", textAlign:"center" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="#c0392b"; e.currentTarget.style.background="linear-gradient(160deg,#1a0a0a,#080810)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="#1f2937"; e.currentTarget.style.background="linear-gradient(160deg,#111121,#080810)";}}>
            <div style={{ fontSize:30, marginBottom:8 }}>{m.icon}</div>
            <div style={{ fontWeight:700, fontSize:14, color:"#e5e7eb", marginBottom:4 }}>{m.label}</div>
            <div style={{ fontSize:12, color:"#9ca3af" }}>{m.sub}</div>
          </button>
        ))}
      </div>

      {/* Recent match history */}
      {gs.league.history.length > 0 && (
        <div style={{ marginTop:16, background:"#0d0d20", border:"1px solid #1f2937",
          borderRadius:14, padding:"12px 16px" }}>
          <div style={{ fontWeight:700, color:"#9ca3af", fontSize:12, marginBottom:10, letterSpacing:1 }}>
            最近戰績
          </div>
          {gs.league.history.slice(-3).reverse().map((h,i) => {
            const enemy = ENEMY_FACTIONS.find(e => e.id === h.enemyId);
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6,
                padding:"6px 10px", background:"#111121", borderRadius:8 }}>
                <span style={{ fontSize:18 }}>{h.result==="win"?"🏆":h.result==="draw"?"🤝":"💔"}</span>
                <span style={{ flex:1, fontSize:12, color:"#9ca3af" }}>vs {enemy?.name}</span>
                <span style={{ fontSize:13, fontWeight:700,
                  color:h.result==="win"?"#4ade80":h.result==="draw"?"#fde047":"#f87171" }}>
                  {h.score.p} - {h.score.e}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── SCREEN: CARDS ───────────────────────────────────────────────
function CardsScreen({ gs, onBack }) {
  const [filter, setFilter] = useState("all");
  const [selCard, setSelCard] = useState(null);
  const factions = ["all", ...PLAYER_FACTIONS.map(f=>f.id)];
  const filtered = gs.cards.filter(c => filter==="all" || c.faction===filter);
  const sorted = [...filtered].sort((a,b) => {
    const qi = c => Q_ORDER.indexOf(c.quality);
    return qi(b) - qi(a) || b.overall - a.overall;
  });

  return (
    <div style={{ minHeight:"100vh", background:"#080810",
      fontFamily:"'Segoe UI',sans-serif", padding:16, overflowY:"auto" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
        <button onClick={onBack} style={{ background:"none", border:"1px solid #374151",
          color:"#9ca3af", borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:13 }}>
          ← 返回
        </button>
        <h2 style={{ fontSize:18, fontWeight:800, color:"#fde047", margin:0, flex:1 }}>🃏 我的卡牌</h2>
        <span style={{ color:"#6b7280", fontSize:13 }}>{gs.cards.length} 張</span>
      </div>

      {/* Quality summary */}
      <div style={{ display:"flex", gap:6, marginBottom:12, flexWrap:"wrap" }}>
        {Q_ORDER.map(q => {
          const cnt = gs.cards.filter(c=>c.quality===q).length;
          if (!cnt) return null;
          return (
            <span key={q} style={{ fontSize:11, padding:"3px 8px", borderRadius:6,
              background: QUALITIES[q].bg, color: QUALITIES[q].color,
              border:`1px solid ${QUALITIES[q].color}`, fontWeight:700 }}>
              {QUALITIES[q].name} ×{cnt}
            </span>
          );
        })}
      </div>

      {/* Filter */}
      <div style={{ display:"flex", gap:8, marginBottom:16, overflowX:"auto", paddingBottom:4 }}>
        {factions.map(fid => {
          const f = PLAYER_FACTIONS.find(x=>x.id===fid);
          return (
            <button key={fid} onClick={() => setFilter(fid)}
              style={{ padding:"6px 12px", borderRadius:20, border:`1px solid ${filter===fid?"#c0392b":"#374151"}`,
                background: filter===fid ? "#2d0a0a" : "transparent",
                color: filter===fid ? "#f87171" : "#9ca3af",
                cursor:"pointer", fontSize:12, whiteSpace:"nowrap",
                fontWeight: filter===fid ? 700 : 400 }}>
              {fid==="all" ? "全部" : (f?.icon + " " + f?.name)}
            </button>
          );
        })}
      </div>

      {/* Card Grid */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:12, justifyContent:"center" }}>
        {sorted.map(card => (
          <CardDisplay key={card.uid} card={card} small
            selected={selCard?.uid===card.uid}
            onClick={() => setSelCard(selCard?.uid===card.uid ? null : card)} />
        ))}
      </div>

      {/* Selected Card Detail */}
      {selCard && (
        <div style={{ position:"fixed", bottom:0, left:0, right:0,
          background:"#0d0d20", border:"1px solid #1f2937", borderRadius:"20px 20px 0 0",
          padding:20, zIndex:100 }}>
          <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
            <CardDisplay card={selCard} />
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:800, fontSize:17, color: QUALITIES[selCard.quality].color,
                marginBottom:4 }}>{selCard.name}</div>
              <div style={{ fontSize:12, color:"#9ca3af", marginBottom:12 }}>
                {PLAYER_FACTIONS.find(f=>f.id===selCard.faction)?.name} · {selCard.pos}
              </div>
              <StatBar label="速" val={selCard.spd} color="#60a5fa" />
              <StatBar label="力" val={selCard.pow} color="#f87171" />
              <StatBar label="術" val={selCard.ski} color="#4ade80" />
              <StatBar label="守" val={selCard.def} color="#a78bfa" />
              <div style={{ marginTop:10, fontSize:11, color:"#fde047",
                background:"#1a1100", borderRadius:8, padding:"6px 10px", textAlign:"center",
                fontWeight:700 }}>
                綜合評分 OVR {selCard.overall}
              </div>
            </div>
          </div>
          <button onClick={()=>setSelCard(null)} style={{
            marginTop:14, width:"100%", padding:"10px 0", borderRadius:10,
            border:"1px solid #374151", background:"transparent", color:"#6b7280",
            fontSize:14, cursor:"pointer" }}>
            收起
          </button>
        </div>
      )}
    </div>
  );
}

// ─── SCREEN: DRAW ────────────────────────────────────────────────
function DrawScreen({ gs, onDraw, onBack }) {
  const [drawing, setDrawing] = useState(false);
  const [results, setResults] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [flipIdx, setFlipIdx] = useState(-1);

  const DRAW_COSTS = { single:300, ten:1000 };

  async function doDraw(n) {
    const cost = n===1 ? DRAW_COSTS.single : DRAW_COSTS.ten;
    if (gs.coins < cost) return;
    setDrawing(true);
    setResults(null);
    setFlipIdx(-1);
    setShowAll(false);
    await new Promise(r => setTimeout(r, 600));
    const cards = drawCards(n, gs.faction);
    setResults(cards);
    setDrawing(false);
    // Flip animation
    for (let i=0; i<cards.length; i++) {
      await new Promise(r => setTimeout(r, n===1 ? 0 : 150));
      setFlipIdx(i);
    }
    onDraw(cards, cost);
  }

  const bestQ = results ? Q_ORDER.reduce((best,q) =>
    results.some(c=>c.quality===q) ? q : best, "white") : null;

  return (
    <div style={{ minHeight:"100vh", background:"#080810",
      fontFamily:"'Segoe UI',sans-serif", padding:16, overflowY:"auto" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
        <button onClick={onBack} style={{ background:"none", border:"1px solid #374151",
          color:"#9ca3af", borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:13 }}>
          ← 返回
        </button>
        <h2 style={{ fontSize:18, fontWeight:800, color:"#fde047", margin:0 }}>✨ 招募武將</h2>
        <span style={{ marginLeft:"auto", fontSize:14, color:"#fde047", fontWeight:700 }}>
          💰 {gs.coins}
        </span>
      </div>

      {/* Banner */}
      <div style={{ background:"linear-gradient(135deg,#1a0800,#2d1500)",
        border:"1px solid #d4af3744", borderRadius:16, padding:"20px 18px",
        textAlign:"center", marginBottom:20, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
          fontSize:80, opacity:0.08 }}>⚔️</div>
        <div style={{ fontSize:22, marginBottom:6 }}>🎴</div>
        <div style={{ fontSize:16, fontWeight:800, color:"#fde047", letterSpacing:2 }}>武將徵召令</div>
        <div style={{ fontSize:12, color:"#9ca3af", marginTop:4 }}>
          10連招保底一張藍卡以上
        </div>
        <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:12 }}>
          {Q_ORDER.slice(0,5).map(q => (
            <div key={q} style={{ textAlign:"center" }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:QUALITIES[q].color,
                margin:"0 auto 2px", boxShadow:`0 0 6px ${QUALITIES[q].color}` }} />
              <div style={{ fontSize:9, color:QUALITIES[q].color }}>{QUALITIES[q].name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Draw Buttons */}
      <div style={{ display:"flex", gap:12, marginBottom:24 }}>
        <button onClick={() => doDraw(1)} disabled={drawing || gs.coins < DRAW_COSTS.single}
          style={{ flex:1, padding:"16px 0", borderRadius:14,
            border:"2px solid #374151", background:"linear-gradient(135deg,#1f2937,#111121)",
            color: gs.coins>=DRAW_COSTS.single ? "#e5e7eb" : "#4b5563",
            fontSize:14, fontWeight:700, cursor: gs.coins>=DRAW_COSTS.single?"pointer":"not-allowed",
            transition:"all 0.2s" }}
          onMouseEnter={e=>{if(gs.coins>=DRAW_COSTS.single)e.currentTarget.style.borderColor="#c0392b";}}
          onMouseLeave={e=>e.currentTarget.style.borderColor="#374151"}>
          <div>單抽一次</div>
          <div style={{ fontSize:12, color:"#fde047", marginTop:4 }}>💰 {DRAW_COSTS.single}</div>
        </button>
        <button onClick={() => doDraw(10)} disabled={drawing || gs.coins < DRAW_COSTS.ten}
          style={{ flex:1, padding:"16px 0", borderRadius:14,
            border:"2px solid #d4af37",
            background: gs.coins>=DRAW_COSTS.ten
              ? "linear-gradient(135deg,#3d2a00,#1a1200)" : "linear-gradient(135deg,#1f2937,#111121)",
            color: gs.coins>=DRAW_COSTS.ten ? "#fde047" : "#4b5563",
            fontSize:14, fontWeight:800, cursor: gs.coins>=DRAW_COSTS.ten?"pointer":"not-allowed",
            transition:"all 0.2s", boxShadow: gs.coins>=DRAW_COSTS.ten?"0 0 20px #d4af3733":"none" }}>
          <div>十連抽</div>
          <div style={{ fontSize:12, marginTop:4 }}>💰 {DRAW_COSTS.ten}</div>
        </button>
      </div>

      {/* Drawing animation */}
      {drawing && (
        <div style={{ textAlign:"center", padding:40 }}>
          <div style={{ fontSize:48, animation:"spin 0.6s linear infinite" }}>✨</div>
          <div style={{ color:"#fde047", marginTop:12, fontSize:14 }}>施展招募術...</div>
          <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {/* Results */}
      {results && !drawing && (
        <div>
          {bestQ && Q_ORDER.indexOf(bestQ) >= Q_ORDER.indexOf("purple") && (
            <div style={{ textAlign:"center", marginBottom:14,
              fontSize:18, fontWeight:800,
              color: QUALITIES[bestQ].color,
              textShadow: `0 0 20px ${QUALITIES[bestQ].glow}` }}>
              ✨ 恭喜獲得 {QUALITIES[bestQ].name}！✨
            </div>
          )}
          <div style={{ display:"flex", flexWrap:"wrap", gap:10, justifyContent:"center" }}>
            {results.map((card, i) => (
              <div key={card.uid} style={{
                opacity: i <= flipIdx ? 1 : 0,
                transform: i <= flipIdx ? "scale(1)" : "scale(0.5) rotateY(90deg)",
                transition: "all 0.3s ease",
              }}>
                <CardDisplay card={card} small />
              </div>
            ))}
          </div>
          <button onClick={() => { setResults(null); setFlipIdx(-1); }}
            style={{ marginTop:20, width:"100%", padding:"12px 0", borderRadius:12,
              border:"1px solid #374151", background:"transparent", color:"#9ca3af",
              fontSize:14, cursor:"pointer" }}>
            收起結果
          </button>
        </div>
      )}
    </div>
  );
}

// ─── SCREEN: TEAM BUILDER ────────────────────────────────────────
function TeamBuilderScreen({ gs, onSave, onBack }) {
  const [lineup, setLineup] = useState([...gs.lineup]);
  const [selSlot, setSelSlot] = useState(null);
  const [selCard, setSelCard] = useState(null);

  const usedUids = new Set(lineup.filter(Boolean).map(c=>c.uid));
  const ov = teamRating(lineup);

  function assignCard(slotIdx, card) {
    const newLineup = [...lineup];
    // Remove card from its current slot if any
    const existingSlot = newLineup.findIndex(c => c?.uid === card.uid);
    if (existingSlot !== -1) newLineup[existingSlot] = null;
    // If slot had a card, swap it back
    if (newLineup[slotIdx]) {
      if (existingSlot !== -1) newLineup[existingSlot] = lineup[slotIdx];
    }
    newLineup[slotIdx] = card;
    setLineup(newLineup);
    setSelSlot(null);
    setSelCard(null);
  }

  function removeCard(slotIdx) {
    const newLineup = [...lineup];
    newLineup[slotIdx] = null;
    setLineup(newLineup);
    setSelSlot(null);
  }

  function handleAutoFill() {
    setLineup(autoFillLineup(gs.cards));
  }

  const availCards = gs.cards.filter(c => !usedUids.has(c.uid) ||
    (selSlot !== null && lineup[selSlot]?.uid === c.uid));

  return (
    <div style={{ minHeight:"100vh", background:"#080810",
      fontFamily:"'Segoe UI',sans-serif", padding:16, overflowY:"auto", paddingBottom:100 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
        <button onClick={onBack} style={{ background:"none", border:"1px solid #374151",
          color:"#9ca3af", borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:13 }}>
          ← 返回
        </button>
        <h2 style={{ fontSize:17, fontWeight:800, color:"#fde047", margin:0, flex:1 }}>
          ⚽ 陣容配置
        </h2>
        <span style={{ fontSize:13, color:"#4ade80", fontWeight:700 }}>OVR {ov}</span>
      </div>

      <button onClick={handleAutoFill} style={{
        width:"100%", marginBottom:14, padding:"10px 0", borderRadius:10,
        border:"1px solid #374151", background:"#1f2937", color:"#9ca3af",
        fontSize:13, cursor:"pointer", fontWeight:600 }}>
        🤖 自動最優陣容
      </button>

      {/* Football pitch */}
      <div style={{ position:"relative", background:"linear-gradient(180deg,#052e16 0%,#14532d 50%,#052e16 100%)",
        borderRadius:16, border:"2px solid #15803d", overflow:"hidden",
        paddingBottom:"140%", marginBottom:16 }}>
        {/* Pitch markings */}
        <div style={{ position:"absolute", top:"50%", left:"10%", right:"10%", height:1,
          background:"rgba(255,255,255,0.2)" }} />
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
          width:"25%", paddingBottom:"25%", borderRadius:"50%",
          border:"1px solid rgba(255,255,255,0.2)" }} />
        {/* Goal boxes */}
        <div style={{ position:"absolute", top:0, left:"30%", right:"30%", height:"15%",
          border:"1px solid rgba(255,255,255,0.2)", borderTop:"none" }} />
        <div style={{ position:"absolute", bottom:0, left:"30%", right:"30%", height:"15%",
          border:"1px solid rgba(255,255,255,0.2)", borderBottom:"none" }} />

        {FORMATION.map((slot, idx) => {
          const card = lineup[idx];
          const isSelected = selSlot === idx;
          const q = card ? QUALITIES[card.quality] : null;
          return (
            <div key={idx} onClick={() => {
              if (selCard) { assignCard(idx, selCard); return; }
              setSelSlot(isSelected ? null : idx);
            }} style={{
              position:"absolute",
              left:`${slot.x}%`, top:`${slot.y}%`,
              transform:"translate(-50%,-50%)",
              cursor:"pointer",
              zIndex:10,
            }}>
              <div style={{
                width:48, height:48, borderRadius:"50%",
                background: card ? (q.bg) : "#0d0d20",
                border: `2px solid ${isSelected ? "#fde047" : card ? q.color : "#374151"}`,
                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                boxShadow: isSelected ? "0 0 16px #fde047" : card ? `0 0 10px ${q.glow}` : "none",
                transition:"all 0.2s",
              }}>
                {card
                  ? <><div style={{ fontSize:16 }}>{card.icon}</div>
                      <div style={{ fontSize:7, color:q.color, fontWeight:700 }}>{card.overall}</div></>
                  : <div style={{ fontSize:10, color:"#6b7280", fontWeight:700 }}>{slot.label}</div>
                }
              </div>
              <div style={{ textAlign:"center", fontSize:8, color: card ? "#e5e7eb" : "#6b7280",
                marginTop:2, maxWidth:50, overflow:"hidden", textOverflow:"ellipsis",
                whiteSpace:"nowrap" }}>
                {card ? card.name : slot.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Card picker when slot selected */}
      {selSlot !== null && (
        <div style={{ background:"#0d0d20", border:"1px solid #1f2937", borderRadius:14, padding:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
            <span style={{ color:"#fde047", fontWeight:700, fontSize:14 }}>
              選擇 {FORMATION[selSlot].label} 位置球員
            </span>
            {lineup[selSlot] && (
              <button onClick={() => removeCard(selSlot)} style={{
                background:"none", border:"1px solid #f87171", color:"#f87171",
                borderRadius:6, padding:"3px 8px", cursor:"pointer", fontSize:12 }}>
                移除
              </button>
            )}
          </div>
          <div style={{ display:"flex", gap:10, overflowX:"auto", paddingBottom:8 }}>
            {gs.cards
              .filter(c => !usedUids.has(c.uid) || c.uid === lineup[selSlot]?.uid)
              .sort((a,b) => b.overall-a.overall)
              .map(card => (
                <div key={card.uid} onClick={() => assignCard(selSlot, card)}
                  style={{ flexShrink:0 }}>
                  <CardDisplay card={card} small selected={lineup[selSlot]?.uid===card.uid} />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, padding:"12px 16px",
        background:"#080810", borderTop:"1px solid #1f2937" }}>
        <button onClick={() => onSave(lineup)} style={{
          width:"100%", padding:"14px 0", borderRadius:12,
          border:"none", background:"linear-gradient(135deg,#c0392b,#922b21)",
          color:"white", fontSize:16, fontWeight:800, cursor:"pointer",
          letterSpacing:2 }}>
          確認陣容 (OVR {ov})
        </button>
      </div>
    </div>
  );
}

// ─── SCREEN: LEAGUE ──────────────────────────────────────────────
function LeagueScreen({ gs, onMatch, onBack }) {
  const currentLeague = LEAGUES[gs.league.current] || LEAGUES[LEAGUES.length-1];
  const progress = Math.min(gs.league.totalMatches / currentLeague.matches, 1);
  const enemies = ENEMY_FACTIONS;

  return (
    <div style={{ minHeight:"100vh", background:"#080810",
      fontFamily:"'Segoe UI',sans-serif", padding:16, overflowY:"auto" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
        <button onClick={onBack} style={{ background:"none", border:"1px solid #374151",
          color:"#9ca3af", borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:13 }}>
          ← 返回
        </button>
        <h2 style={{ fontSize:18, fontWeight:800, color:"#fde047", margin:0 }}>⚔️ 聯賽出征</h2>
      </div>

      {/* League tiers */}
      <div style={{ display:"flex", gap:8, marginBottom:16, overflowX:"auto", paddingBottom:4 }}>
        {LEAGUES.map((l, i) => (
          <div key={l.id} style={{
            padding:"8px 14px", borderRadius:20, flexShrink:0,
            border:`2px solid ${i===gs.league.current ? l.color : "#374151"}`,
            background: i===gs.league.current ? `${l.color}22` : "transparent",
            color: i===gs.league.current ? l.color : "#6b7280",
            fontSize:12, fontWeight: i===gs.league.current ? 700 : 400,
          }}>
            {l.icon} {l.name}
          </div>
        ))}
      </div>

      {/* Progress */}
      <div style={{ background:"#0d0d20", border:`1px solid ${currentLeague.color}44`,
        borderRadius:14, padding:"14px 18px", marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ color:currentLeague.color, fontWeight:700 }}>
            {currentLeague.icon} {currentLeague.name}
          </span>
          <span style={{ color:"#9ca3af", fontSize:12 }}>
            {gs.league.wins}W {gs.league.draws}D {gs.league.losses}L
          </span>
        </div>
        <div style={{ background:"#1f2937", borderRadius:6, height:10, overflow:"hidden" }}>
          <div style={{ width:`${progress*100}%`, height:"100%",
            background:`linear-gradient(90deg,${currentLeague.color},${currentLeague.color}88)`,
            transition:"width 0.8s", boxShadow:`0 0 10px ${currentLeague.color}` }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
          <span style={{ fontSize:11, color:"#6b7280" }}>
            積分: {gs.league.points}
          </span>
          <span style={{ fontSize:11, color:currentLeague.color }}>
            {gs.league.totalMatches}/{currentLeague.matches} 場
          </span>
        </div>
      </div>

      {/* Enemy Selection */}
      <div style={{ fontWeight:700, color:"#9ca3af", fontSize:12, letterSpacing:1, marginBottom:12 }}>
        選擇對手
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {enemies.map(enemy => {
          const ov = teamRating(gs.lineup);
          const diff = enemy.power - ov;
          const diffColor = diff > 10 ? "#f87171" : diff < -10 ? "#4ade80" : "#fde047";
          return (
            <div key={enemy.id} onClick={() => onMatch(enemy)}
              style={{ background:"linear-gradient(135deg,#111121,#080810)",
                border:`1px solid ${enemy.color}44`, borderRadius:14, padding:"14px 16px",
                cursor:"pointer", display:"flex", alignItems:"center", gap:14,
                transition:"all 0.2s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=enemy.color; e.currentTarget.style.background=`linear-gradient(135deg,${enemy.color}11,#080810)`;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=`${enemy.color}44`; e.currentTarget.style.background="linear-gradient(135deg,#111121,#080810)";}}>
              <div style={{ fontSize:32 }}>{enemy.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:800, fontSize:14, color:enemy.color }}>{enemy.name}</div>
                <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>{enemy.desc}</div>
                <div style={{ display:"flex", gap:8, marginTop:6 }}>
                  <span style={{ fontSize:10, padding:"2px 8px", borderRadius:4,
                    background:"#1f2937", color:enemy.color }}>
                    戰力 {enemy.power}
                  </span>
                  <span style={{ fontSize:10, padding:"2px 8px", borderRadius:4,
                    background:"#1f2937", color:diffColor }}>
                    {diff > 0 ? `挑戰 +${diff}` : diff < 0 ? `勝算 ${Math.abs(diff)}` : "勢均力敵"}
                  </span>
                </div>
              </div>
              <div style={{ color:"#c0392b", fontSize:18 }}>▶</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SCREEN: MATCH ───────────────────────────────────────────────
function MatchScreen({ gs, enemy, onFinish }) {
  const [phase, setPhase] = useState("kickoff"); // kickoff|playing|result
  const [events, setEvents] = useState([]);
  const [score, setScore] = useState({p:0,e:0});
  const [minute, setMinute] = useState(0);
  const [matchData, setMatchData] = useState(null);
  const [visibleEvents, setVisibleEvents] = useState([]);
  const eventsRef = useRef(null);
  const faction = PLAYER_FACTIONS.find(f => f.id === gs.faction);
  const ov = teamRating(gs.lineup);

  useEffect(() => {
    if (phase === "kickoff") {
      const timer = setTimeout(() => {
        const data = simulateMatch(ov, enemy, gs.faction);
        setMatchData(data);
        setPhase("playing");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing" || !matchData) return;
    let evtIdx = 0;
    let currentMin = 0;
    const allEvts = matchData.events;

    const interval = setInterval(() => {
      currentMin += 3;
      setMinute(Math.min(currentMin, 90));

      // Show events that happened up to this minute
      while (evtIdx < allEvts.length && allEvts[evtIdx].min <= currentMin) {
        const evt = allEvts[evtIdx];
        if (evt.type === "pGoal") setScore(s => ({...s, p: s.p+1}));
        if (evt.type === "eGoal") setScore(s => ({...s, e: s.e+1}));
        setVisibleEvents(v => [{...evt, id:evtIdx}, ...v.slice(0,19)]);
        evtIdx++;
      }

      if (currentMin >= 90) {
        clearInterval(interval);
        setTimeout(() => setPhase("result"), 800);
      }
    }, 120);

    return () => clearInterval(interval);
  }, [phase, matchData]);

  useEffect(() => {
    if (eventsRef.current) eventsRef.current.scrollTop = 0;
  }, [visibleEvents]);

  if (phase === "kickoff") {
    return (
      <div style={{ minHeight:"100vh", background:"#080810",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        fontFamily:"'Segoe UI',sans-serif", gap:24 }}>
        <div style={{ fontSize:20, color:"#9ca3af", letterSpacing:3 }}>⚽ 比賽開始 ⚽</div>
        <div style={{ display:"flex", alignItems:"center", gap:24 }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:40 }}>{faction?.icon}</div>
            <div style={{ color:faction?.color, fontWeight:800, fontSize:14 }}>{faction?.name}</div>
            <div style={{ color:"#4ade80", fontSize:12 }}>OVR {ov}</div>
          </div>
          <div style={{ fontSize:32, color:"#c0392b", fontWeight:900 }}>VS</div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:40 }}>{enemy.icon}</div>
            <div style={{ color:enemy.color, fontWeight:800, fontSize:14 }}>{enemy.name}</div>
            <div style={{ color:"#f87171", fontSize:12 }}>戰力 {enemy.power}</div>
          </div>
        </div>
        <div style={{ width:40, height:40, border:"3px solid #c0392b",
          borderTopColor:"transparent", borderRadius:"50%",
          animation:"spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (phase === "result" && matchData) {
    const result = matchData.result;
    const rColor = result==="win"?"#4ade80":result==="draw"?"#fde047":"#f87171";
    const rText = result==="win"?"勝利！":"draw"?"平局":"失敗";
    return (
      <div style={{ minHeight:"100vh", background:"#080810",
        fontFamily:"'Segoe UI',sans-serif", padding:20, overflowY:"auto" }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>
            {result==="win"?"🏆":result==="draw"?"🤝":"💔"}
          </div>
          <div style={{ fontSize:28, fontWeight:900, color:rColor, marginBottom:4 }}>
            {rText}
          </div>
          <div style={{ fontSize:42, fontWeight:900, color:"#e5e7eb", letterSpacing:6 }}>
            {score.p} - {score.e}
          </div>
          <div style={{ color:"#6b7280", fontSize:13, marginTop:4 }}>
            {faction?.name} vs {enemy.name}
          </div>
        </div>

        {/* Rewards */}
        <div style={{ background:"#0d0d20", border:`1px solid ${rColor}44`,
          borderRadius:14, padding:"16px 18px", marginBottom:20, textAlign:"center" }}>
          <div style={{ color:"#9ca3af", fontSize:12, marginBottom:10 }}>獎勵</div>
          <div style={{ display:"flex", justifyContent:"center", gap:20 }}>
            <div>
              <div style={{ fontSize:20, color:"#fde047", fontWeight:800 }}>
                +{matchData.coins} 💰
              </div>
              <div style={{ fontSize:11, color:"#6b7280" }}>金幣</div>
            </div>
            <div>
              <div style={{ fontSize:20, color:rColor, fontWeight:800 }}>
                +{matchData.pts} 分
              </div>
              <div style={{ fontSize:11, color:"#6b7280" }}>積分</div>
            </div>
          </div>
        </div>

        {/* Event log */}
        <div style={{ background:"#0d0d20", border:"1px solid #1f2937",
          borderRadius:14, padding:"14px 16px", maxHeight:280, overflowY:"auto",
          marginBottom:20 }}>
          <div style={{ color:"#9ca3af", fontSize:12, marginBottom:10, fontWeight:700 }}>比賽回顧</div>
          {matchData.events.slice().reverse().map((evt,i) => (
            <div key={i} style={{ display:"flex", gap:10, marginBottom:8,
              padding:"6px 10px", background:"#111121", borderRadius:8 }}>
              <span style={{ fontSize:11, color:"#6b7280", minWidth:28 }}>{evt.min}'</span>
              <span style={{ fontSize:11,
                color: evt.type==="pGoal"?"#4ade80":evt.type==="eGoal"?"#f87171":"#9ca3af" }}>
                {evt.type==="pGoal"?"⚽ ":evt.type==="eGoal"?"🚨 ":"📋 "}{evt.text}
              </span>
            </div>
          ))}
        </div>

        <button onClick={() => onFinish(matchData)} style={{
          width:"100%", padding:"14px 0", borderRadius:12,
          border:"none", background:`linear-gradient(135deg,${rColor === "#4ade80" ? "#14532d" : "#1a0a0a"},#080810)`,
          color:rColor, fontSize:16, fontWeight:800, cursor:"pointer",
          border:`2px solid ${rColor}`, letterSpacing:2 }}>
          確認結果
        </button>
      </div>
    );
  }

  // Playing phase
  return (
    <div style={{ minHeight:"100vh", background:"#080810",
      fontFamily:"'Segoe UI',sans-serif", padding:16, overflowY:"auto" }}>
      {/* Scoreboard */}
      <div style={{ background:"linear-gradient(135deg,#0d0d20,#111121)",
        border:"1px solid #1f2937", borderRadius:16, padding:"16px 20px",
        textAlign:"center", marginBottom:16 }}>
        <div style={{ color:"#6b7280", fontSize:11, marginBottom:8, letterSpacing:3 }}>
          {minute}'  比賽進行中
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:22 }}>{faction?.icon}</div>
            <div style={{ fontSize:12, color:faction?.color, fontWeight:700 }}>{faction?.name}</div>
          </div>
          <div style={{ fontSize:48, fontWeight:900, color:"#e5e7eb", letterSpacing:8 }}>
            {score.p} - {score.e}
          </div>
          <div>
            <div style={{ fontSize:22 }}>{enemy.icon}</div>
            <div style={{ fontSize:12, color:enemy.color, fontWeight:700 }}>{enemy.name}</div>
          </div>
        </div>
        {/* Time bar */}
        <div style={{ marginTop:12, background:"#1f2937", borderRadius:4, height:4 }}>
          <div style={{ width:`${(minute/90)*100}%`, height:"100%",
            background:"linear-gradient(90deg,#c0392b,#f39c12)", transition:"width 0.1s" }} />
        </div>
      </div>

      {/* Live events */}
      <div ref={eventsRef} style={{ background:"#0d0d20", border:"1px solid #1f2937",
        borderRadius:14, padding:"12px 14px", maxHeight:"50vh", overflowY:"auto" }}>
        <div style={{ color:"#9ca3af", fontSize:12, marginBottom:10, fontWeight:700 }}>直播解說</div>
        {visibleEvents.length === 0 && (
          <div style={{ color:"#374151", fontSize:13, textAlign:"center", padding:20 }}>
            等待比賽事件...
          </div>
        )}
        {visibleEvents.map((evt, i) => (
          <div key={evt.id} style={{
            display:"flex", gap:10, marginBottom:8,
            padding:"8px 12px", borderRadius:10,
            background: i===0 ? (evt.type==="pGoal"?"#052e16":evt.type==="eGoal"?"#450a0a":"#111121") : "#111121",
            border: i===0 ? `1px solid ${evt.type==="pGoal"?"#4ade80":evt.type==="eGoal"?"#f87171":"#1f2937"}` : "1px solid transparent",
            transition:"all 0.3s",
            animation: i===0 ? "fadeIn 0.3s ease" : "none",
          }}>
            <span style={{ fontSize:11, color:"#6b7280", minWidth:28 }}>{evt.min}'</span>
            <span style={{ fontSize:12,
              color: evt.type==="pGoal"?"#4ade80":evt.type==="eGoal"?"#f87171":"#9ca3af" }}>
              {evt.type==="pGoal"?"⚽ ":evt.type==="eGoal"?"🚨 ":"📋 "}{evt.text}
            </span>
          </div>
        ))}
        <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────
const SCREENS = {
  HOME:"home", FACTION:"faction", HUB:"hub",
  CARDS:"cards", DRAW:"draw", TEAM:"team",
  LEAGUE:"league", MATCH:"match",
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.HOME);
  const [gs, setGs] = useState(null);
  const [matchEnemy, setMatchEnemy] = useState(null);
  const hasSave = !!loadGame();

  function navigate(s) { setScreen(s); }

  function handleContinue() {
    const saved = loadGame();
    if (saved) { setGs(saved); setScreen(SCREENS.HUB); }
  }

  function handleStartNew() {
    setScreen(SCREENS.FACTION);
  }

  function handleFactionSelect(fid) {
    const state = newGame(fid);
    setGs(state);
    saveGame(state);
    setScreen(SCREENS.HUB);
  }

  function updateGs(updater) {
    setGs(prev => {
      const next = updater(prev);
      saveGame(next);
      return next;
    });
  }

  function handleDraw(cards, cost) {
    updateGs(prev => ({
      ...prev,
      coins: prev.coins - cost,
      cards: [...prev.cards, ...cards],
    }));
  }

  function handleSaveTeam(lineup) {
    updateGs(prev => ({ ...prev, lineup }));
    setScreen(SCREENS.HUB);
  }

  function handleStartMatch(enemy) {
    setMatchEnemy(enemy);
    setScreen(SCREENS.MATCH);
  }

  function handleMatchFinish(matchData) {
    updateGs(prev => {
      const league = { ...prev.league };
      league.wins   += matchData.result === "win"  ? 1 : 0;
      league.draws  += matchData.result === "draw" ? 1 : 0;
      league.losses += matchData.result === "lose" ? 1 : 0;
      league.points += matchData.pts;
      league.totalMatches += 1;
      league.history = [...(league.history||[]), {
        enemyId: matchEnemy.id, score: matchData.score, result: matchData.result,
      }];
      // Promote league if enough matches
      if (league.current < LEAGUES.length-1 &&
          league.totalMatches >= LEAGUES[league.current].matches &&
          league.wins / league.totalMatches >= 0.4) {
        league.current += 1;
        league.wins = 0; league.draws = 0; league.losses = 0;
        league.totalMatches = 0;
      }
      return {
        ...prev,
        coins: prev.coins + matchData.coins,
        league,
        stats: {
          ...prev.stats,
          totalGoals: prev.stats.totalGoals + matchData.score.p,
          totalWins: prev.stats.totalWins + (matchData.result==="win"?1:0),
        },
      };
    });
    setScreen(SCREENS.HUB);
  }

  // ─── RENDER ───────────────────────────────────────────────────
  if (screen === SCREENS.HOME)
    return <HomeScreen onStart={handleStartNew} onContinue={handleContinue} hasSave={hasSave} />;

  if (screen === SCREENS.FACTION)
    return <FactionSelectScreen onSelect={handleFactionSelect} />;

  if (!gs) return null;

  if (screen === SCREENS.HUB)
    return <MainHubScreen gs={gs} navigate={s => {
      if (s==="league") setScreen(SCREENS.LEAGUE);
      else if (s==="cards") setScreen(SCREENS.CARDS);
      else if (s==="draw") setScreen(SCREENS.DRAW);
      else if (s==="team") setScreen(SCREENS.TEAM);
    }} />;

  if (screen === SCREENS.CARDS)
    return <CardsScreen gs={gs} onBack={() => setScreen(SCREENS.HUB)} />;

  if (screen === SCREENS.DRAW)
    return <DrawScreen gs={gs} onDraw={handleDraw} onBack={() => setScreen(SCREENS.HUB)} />;

  if (screen === SCREENS.TEAM)
    return <TeamBuilderScreen gs={gs} onSave={handleSaveTeam} onBack={() => setScreen(SCREENS.HUB)} />;

  if (screen === SCREENS.LEAGUE)
    return <LeagueScreen gs={gs} onMatch={handleStartMatch} onBack={() => setScreen(SCREENS.HUB)} />;

  if (screen === SCREENS.MATCH && matchEnemy)
    return <MatchScreen gs={gs} enemy={matchEnemy} onFinish={handleMatchFinish} />;

  return null;
}
