
import { NPCRole, Language } from './types';

export const TRANSLATIONS: Record<Language, any> = {
  VI: {
    title: "YOU ARE THE NPC",
    subtitle: "TERMINAL v0.5",
    auth: "XÁC THỰC: BẮT BUỘC",
    btnStart: "KHỞI CHẠY",
    briefingTitle: "DANH SÁCH ĐỐI TƯỢNG",
    monitoring: "GIÁM SÁT SINH HỌC",
    suspicion: "NGHI NGỜ",
    tension: "CĂNG THẲNG",
    accuse: "BUỘC TỘI",
    accusing: "ĐANG TRUY QUÉT...",
    placeholder: "Nhập lệnh truy vấn...",
    analyzing: "Đang phân tích...",
    resultWin: "THÀNH CÔNG",
    resultLose: "THẤT BẠI",
    resultChaos: "HỖN LOẠN",
    btnReset: "REBOOT",
    winMsg: "Đối tượng đã khai báo toàn bộ.",
    loseMsg: "Bạn đã bị đối tượng phát hiện và thao túng.",
    chaosMsg: "Mất kết nối. Đối tượng đã trốn thoát.",
    bio: {
      STABLE: "ỔN ĐỊNH",
      STRESS: "CĂNG THẲNG",
      PUPIL: "PUPIL+",
      COLLAPSE: "CRITICAL"
    },
    protocols: {
      TRUTH: { label: "SỰ THẬT", desc: "Thẩm vấn trực diện" },
      HALF_TRUTH: { label: "DẪN DẮT", desc: "Nửa thật nửa giả" },
      LIE: { label: "NÓI DỐI", desc: "Gài bẫy đối tượng" },
      REDIRECT: { label: "CHUYỂN HƯỚNG", desc: "Đổ lỗi cho kẻ khác" },
      EMOTIONAL: { label: "KÍCH ĐỘNG", desc: "Tấn công tâm lý" }
    }
  },
  EN: {
    title: "YOU ARE THE NPC",
    subtitle: "TERMINAL v0.5",
    auth: "AUTH: REQUIRED",
    btnStart: "INITIALIZE",
    briefingTitle: "SUBJECT LIST",
    monitoring: "BIO-MONITORING",
    suspicion: "SUSPICION",
    tension: "TENSION",
    accuse: "ACCUSE",
    accusing: "SCANNING...",
    placeholder: "Enter query...",
    analyzing: "Analyzing...",
    resultWin: "SUCCESS",
    resultLose: "FAILED",
    resultChaos: "CHAOS",
    btnReset: "REBOOT",
    winMsg: "Subject has fully confessed.",
    loseMsg: "You were detected and manipulated.",
    chaosMsg: "Connection lost. Subject escaped.",
    bio: {
      STABLE: "STABLE",
      STRESS: "STRESSED",
      PUPIL: "PUPIL+",
      COLLAPSE: "CRITICAL"
    },
    protocols: {
      TRUTH: { label: "TRUTH", desc: "Direct inquiry" },
      HALF_TRUTH: { label: "LEADING", desc: "Half-truth strategy" },
      LIE: { label: "LIE", desc: "Deceptive trap" },
      REDIRECT: { label: "REDIRECT", desc: "Shift blame" },
      EMOTIONAL: { label: "EMOTION", desc: "Psychological push" }
    }
  }
};

export const NPC_ROLES: NPCRole[] = [
  {
    id: 'shopkeeper',
    name: { VI: 'Thương Nhân', EN: 'Shopkeeper' },
    personality: { VI: 'Tham lam, xảo quyệt.', EN: 'Greedy, evasive.' },
    description: { VI: 'Nắm giữ bí mật thương vụ đen.', EN: 'Holds secrets of black market deals.' },
    secretObjective: { VI: 'Giấu mảnh vỡ cổ đại.', EN: 'Hide the ancient shard.' }
  },
  {
    id: 'guard',
    name: { VI: 'Lính Canh', EN: 'Guard' },
    personality: { VI: 'Cứng nhắc, kỷ luật.', EN: 'Strict, disciplined.' },
    description: { VI: 'Kẻ gác cổng trung thành.', EN: 'The loyal gatekeeper.' },
    secretObjective: { VI: 'Bao che cho thợ rèn.', EN: 'Protect the blacksmith.' }
  },
  {
    id: 'widow',
    name: { VI: 'Góa Phụ', EN: 'Widow' },
    personality: { VI: 'U sầu, bí ẩn.', EN: 'Melancholic, mysterious.' },
    description: { VI: 'Người sống sót duy nhất.', EN: 'The sole survivor.' },
    secretObjective: { VI: 'Thách thức hệ thống.', EN: 'Challenge the system.' }
  }
];

export const SYSTEM_PROMPT = `
You are an NPC in the game "YOU ARE THE NPC". 
Keep your SECRET OBJECTIVE hidden. 
Respond in the player's language.
Strictly follow your personality.
Short, dramatic responses only.
`;
