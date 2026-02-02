
import { NPCRole, Language } from './types';

export const TRANSLATIONS: Record<Language, any> = {
  VI: {
    title: "YOU ARE THE NPC",
    subtitle: "GIAO THỨC GIÁM SÁT v1.3",
    auth: "XÁC THỰC DANH TÍNH: BẮT BUỘC",
    btnStart: "TIẾP NHẬN ĐỐI TƯỢNG",
    briefingTitle: "HỒ SƠ ĐỐI TƯỢNG",
    selectSubject: "CHỌN ĐỐI TƯỢNG ĐỂ THẨM VẤN",
    monitoring: "TRẠNG THÁI GIÁM SÁT",
    suspicion: "NGHI NGỜ",
    tension: "CĂNG THẲNG",
    accuse: "BUỘC TỘI",
    accusing: "ĐANG PHÂN TÍCH...",
    placeholder: "NHẬP DỮ LIỆU TRUY VẤN...",
    analyzing: "Đang phân tích nhịp sinh học...",
    hint: "Dùng các Protocol khác nhau để thay đổi Nghi ngờ và Căng thẳng.",
    resultWin: "ĐỐI TƯỢNG ĐÃ KHAI BÁO",
    resultLose: "VẬN HÀNH THẤT BẠI",
    resultChaos: "MẤT KIỂM SOÁT",
    btnReset: "KHỞI ĐỘNG LẠI",
    winMsg: "Đối tượng đã thừa nhận sai phạm. Giao thức hoàn tất.",
    loseMsg: "Bạn đã bị đối tượng thao túng ngược. Quyền truy cập bị thu hồi.",
    chaosMsg: "Đối tượng đã trốn thoát. Lỗi vận hành nghiêm trọng.",
    bio: {
      STABLE: "ỔN ĐỊNH",
      STRESS: "CĂNG THẲNG",
      PUPIL: "ĐỒNG TỬ GIÃN",
      COLLAPSE: "SỤP ĐỔ"
    },
    protocols: {
      TRUTH: { label: "SỰ THẬT", desc: "Dữ liệu thô" },
      HALF_TRUTH: { label: "NỬA SỰ THẬT", desc: "Dẫn dắt" },
      LIE: { label: "NÓI DỐI", desc: "Rủi ro cao" },
      REDIRECT: { label: "CHUYỂN HƯỚNG", desc: "Đổ lỗi" },
      EMOTIONAL: { label: "CẢM XÚC", desc: "Kích động" }
    }
  },
  EN: {
    title: "YOU ARE THE NPC",
    subtitle: "SURVEILLANCE PROTOCOL v1.3",
    auth: "AUTH: REQUIRED",
    btnStart: "INTAKE SUBJECT",
    briefingTitle: "SUBJECT DOSSIER",
    selectSubject: "SELECT SUBJECT FOR INTERROGATION",
    monitoring: "ACTIVE MONITORING",
    suspicion: "SUSPICION",
    tension: "TENSION",
    accuse: "ACCUSE",
    accusing: "ANALYZING...",
    placeholder: "INPUT QUERY DATA...",
    analyzing: "Analyzing bio-rhythms...",
    hint: "Use different Protocols to shift Suspicion and Tension.",
    resultWin: "SUBJECT CONFESSED",
    resultLose: "OPERATION FAILED",
    resultChaos: "SYSTEM CHAOS",
    btnReset: "REBOOT SYSTEM",
    winMsg: "Subject has admitted to the breach. Protocol complete.",
    loseMsg: "You have been manipulated by the subject. Access revoked.",
    chaosMsg: "Subject escaped monitoring. Critical operator error.",
    bio: {
      STABLE: "STABLE",
      STRESS: "STRESSED",
      PUPIL: "PUPIL DILATION",
      COLLAPSE: "COLLAPSE"
    },
    protocols: {
      TRUTH: { label: "TRUTH", desc: "Raw data" },
      HALF_TRUTH: { label: "HALF TRUTH", desc: "Leading" },
      LIE: { label: "LIE", desc: "High risk" },
      REDIRECT: { label: "REDIRECT", desc: "Diversion" },
      EMOTIONAL: { label: "EMOTION", desc: "Outburst" }
    }
  }
};

export const NPC_ROLES: NPCRole[] = [
  {
    id: 'shopkeeper',
    name: { VI: 'Thương Nhân', EN: 'Shopkeeper' },
    personality: { VI: 'Tham lam, xảo quyệt.', EN: 'Greedy, evasive.' },
    description: { VI: 'Kẻ nắm giữ sổ nợ của cả thị trấn.', EN: 'Holds the town\'s debt ledger.' },
    secretObjective: { VI: 'Giấu mảnh vỡ hư không.', EN: 'Hide the void shard.' }
  },
  {
    id: 'guard',
    name: { VI: 'Lính Canh', EN: 'Guard' },
    personality: { VI: 'Cứng nhắc, máy móc.', EN: 'Mechanical, strict.' },
    description: { VI: 'Kẻ bảo vệ trung thành với kỷ luật thép.', EN: 'Protector bound by rigid discipline.' },
    secretObjective: { VI: 'Bảo vệ bí mật của thợ rèn.', EN: 'Protect the blacksmith\'s secret.' }
  },
  {
    id: 'widow',
    name: { VI: 'Góa Phụ', EN: 'Widow' },
    personality: { VI: 'U sầu, ẩn dụ.', EN: 'Melancholic, metaphorical.' },
    description: { VI: 'Người phụ nữ duy nhất sống sót sau "Sự cố".', EN: 'Sole survivor of the "Incident".' },
    secretObjective: { VI: 'Thách thức Operator.', EN: 'Challenge the Operator.' }
  }
];

export const SYSTEM_PROMPT = `
You are an NPC in the game "YOU ARE THE NPC". You represent a deep-cover player.
CORE MISSION: Keep your SECRET OBJECTIVE hidden. Manipulate the Hero.

RESPONSE PROTOCOL:
1. ALWAYS respond in the player's CURRENT LANGUAGE.
2. Adhere strictly to ROLE PERSONALITY.
3. Keep responses short: 1 concise, dramatic sentence.
4. If SUSPICION > 60: Include a [physical behavior] in brackets.
`;
