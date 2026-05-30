/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ItemState = 'restoring' | 'pending_card' | 'exhibited';

export interface ChatRecord {
  id: string;
  type: 'question' | 'memory' | 'senior_voice';
  author: string;
  role: 'helper' | 'senior';
  content: string;
  timestamp: string;
  durationSec?: number; // for voice (e.g. 15)
  isPlaying?: boolean; // playing simulation
}

export interface FamilyInfo {
  familyName: string;
  myAlias: string;
  myRole: '老东西' | '小东西'; // 老人 / 家人
  familyRelation: string; // 爷爷、奶奶、爸爸、妈妈、孙女、孙子、其他
  invitationCode: string;
}

export interface MuseumItem {
  id: string;
  no: string; // e.g. "001"
  title: string; // e.g. "未知藏品 No.001" or final title
  originalTitle: string; // e.g. "一直是那个缺口的白瓷茶杯" (shown once restored)
  imageUrl: string; // stock image path or Base64
  restoration: number; // 0 to 100
  state: ItemState;
  relationPerson: string; // e.g. "外公 陈建国"
  keywords: string[];
  description: string; // exhibit detailed description card
  genealogy: string; // memory genealogy, e.g. "1978年开会受赠 -> 外公结婚使用 -> 1995年给母亲作喝水杯 -> 如今放在书架积灰"
  timeline: ChatRecord[];
}
