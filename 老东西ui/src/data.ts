/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MuseumItem } from './types';

export const DEFAULT_FAMILY_INFO = {
  familyName: "老陈家的传家屋",
  myAlias: "小陈 (陈阿敏)",
  myRole: "家庭成员" as const,
  familyRelation: "孙女",
  invitationCode: "LDX-8392-ZN"
};

export const INITIAL_MUSEUM_ITEMS: MuseumItem[] = [
  {
    id: "item-1",
    no: "001",
    title: "未知藏品 No.001",
    originalTitle: "一直没有换的缺口白瓷茶杯",
    imageUrl: "WhitePorcelainTeacup",
    restoration: 20,
    state: "restoring",
    relationPerson: "外公 陈建国",
    keywords: ["1978年", "先进工作者纪念", "景德镇瓷", "磕碰留念"],
    description: "这是外公陈建国最心爱的物品，是一个在杯沿有着浅浅磕碰缺口的白色搪瓷盖釉瓷杯。自1978年以来，外公换过很多新物件，但每天清晨泡茉莉花茶却始终只用这一个，连茶杯把手磨损了也舍不得丢掉。",
    genealogy: "1978年红星公社赠予外公 -> 1995年孙女学会走路时不慎碰翻摔出缺口 -> 2012年被外公带入城里继续使用 -> 2026年被整理并上传微信小程序",
    timeline: [
      {
        id: "chat-1-1",
        type: "question",
        author: "孙女 阿敏",
        role: "member",
        authorRelation: "孙女",
        content: "外公，这个白瓷茶杯边上怎么破了一个小口口呀？看起来很有些年头了。",
        timestamp: "2026-05-30 09:30"
      },
      {
        id: "chat-1-2",
        type: "memory",
        author: "女婿 国强",
        role: "member",
        authorRelation: "爸爸",
        content: "对啊爸，我1998年初次登门拜访的时候，就看你天天端着这杯子。上面的茉莉花茶垢厚厚的一层，你都宝贝得不得了，不让我们帮你拿刷子洗。",
        timestamp: "2026-05-30 10:15"
      }
    ]
  },
  {
    id: "item-2",
    no: "002",
    title: "未知藏品 No.002",
    originalTitle: "嘀嗒响了六十年的绿亮五九式挂钟",
    imageUrl: "WallClock59",
    restoration: 100,
    state: "pending_card",
    relationPerson: "奶奶 张素芬",
    keywords: ["五九式机械钟", "新婚置办", "齿轮作响", "时间守护者"],
    description: "奶奶张素芬在1966年结婚时，全家拼尽全力凑齐了‘三大件’之外，还托人从城里买回了这台大挂钟。它全身是铁皮烤漆的暗粉绿色，走时的时候内部的大黄铜齿轮会发出特别深沉的‘嘀嗒、嘀嗒’声，在夜深人静时尤其清晰。",
    genealogy: "1966年上海置办带回 -> 悬挂于老屋正堂60年 -> 2008年发条老化停摆 -> 2024年小敏托钟表师傅重换机芯重新走动",
    timeline: [
      {
        id: "chat-2-1",
        type: "question",
        author: "孙女 阿敏",
        role: "member",
        authorRelation: "孙女",
        content: "奶奶，这个绿色的大铁钟是从哪里买回来的呀？小时候一去您家，满屋子都是它‘嘀嗒’的声音，晚上睡不着，听着特别安心。",
        timestamp: "2026-05-28 14:00"
      },
      {
        id: "chat-2-2",
        type: "memory",
        author: "爷爷 陈爱国",
        role: "member",
        authorRelation: "爷爷",
        content: "这老钟可是当年拼了老命给你奶奶准备的新婚礼物。当年要买一架上海牌的绿漆机械钟，不仅要攒一年半的工业券，还要大清早去百货大楼站排呢！",
        timestamp: "2026-05-28 15:45"
      },
      {
        id: "chat-2-3",
        type: "voice",
        author: "奶奶 张素芬",
        role: "member",
        authorRelation: "奶奶",
        content: "当年啊，这台挂钟挂在我们老房子堂屋最中间。每次你爸爸调皮，或者你们在堂屋里追逐，我一听老挂钟的时针在整点打鸣，就知道又过了一小时。虽然早些年弦断了，但是摆在客厅里，只要看着它，全家人的日子就觉得是在踏踏实实往前走的。",
        timestamp: "2026-05-28 16:12",
        durationSec: 28
      }
    ]
  },
  {
    id: "item-3",
    no: "003",
    title: "蝴蝶牌脚踏缝纫机", // already has exhibit title
    originalTitle: "承载着三代人新衣的蝴蝶缝纫机",
    imageUrl: "SewingMachine",
    restoration: 100,
    state: "exhibited",
    relationPerson: "妈妈 陈慧梅",
    keywords: ["蝴蝶牌", "拼花台面", "压脚穿针", "母亲做的衣裳"],
    description: "红木色的烤漆拼花木版上，架着一架沉甸甸的黑色黑漆描金蝴蝶图样的铁艺缝纫机。脚底踩着铸铁的大踏板，‘嗒嗒嗒嗒’的皮带翻转声，曾是家里最热闹的交响乐。妈妈曾用这架缝纫机改过爸爸的旧军服，给儿女做过了六一儿童节的演出服。",
    genealogy: "1983年外公作为嫁妆添置给妈妈 -> 1980-90年代包揽全家新衣服及改制补丁 -> 2015年妈妈舍不得丢，放在新家卧室的一隅作为纪念桌",
    timeline: [
      {
        id: "chat-3-1",
        type: "question",
        author: "女儿 阿敏",
        role: "member",
        authorRelation: "女儿",
        content: "妈，我记得小时候我那件红领巾演出裙就是在这个旧木桌上做出来的吧？大铁轮子转起来特别好玩。",
        timestamp: "2026-05-20 18:22"
      },
      {
        id: "chat-3-2",
        type: "voice",
        author: "妈妈 陈慧梅",
        role: "member",
        authorRelation: "妈妈",
        content: "是啊，那裙子还是红洋布，那年布票好不容易才凑够，前脚买回来，当晚我就在上面踩了一夜，‘哒哒哒哒’还怕吵醒你。你转那大轮子我还敲过你的小手丫，哈哈。现在这缝纫机皮带早坏了，可我天天坐在它面前当梳妆台，心里就踏实。",
        timestamp: "2026-05-20 19:10",
        durationSec: 32
      }
    ]
  }
];
