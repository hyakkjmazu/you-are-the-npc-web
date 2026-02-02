
import { NPCRole, Language } from './types';

export const TRANSLATIONS: Record<Language, any> = {
  VI: {
    title: "YOU ARE THE NPC",
    subtitle: "NEURAL_SIEGE_PROTOCOL_v3.1",
    auth: "QUYỀN TRUY CẬP: TỐI CAO",
    btnStart: "KHỞI CHẠY THẨM VẤN",
    worldIntro: [
      "Sự thật là một căn bệnh. Chúng tôi là liều thuốc.",
      "Thành phố này không cần anh hùng, nó cần sự ổn định.",
      "Đối tượng đang kháng cự. Hãy cẩn trọng.",
      "Chỉ 2% Operator tìm thấy sự thật cuối cùng."
    ],
    btnProceed: "THÂM NHẬP TÂM TRÍ",
    briefingTitle: "ĐIỂM YẾU ĐỐI TƯỢNG",
    monitoring: "CHỈ SỐ SINH HỌC",
    suspicion: "NGHI NGỜ",
    tension: "CĂNG THẲNG",
    resistance: "KHÁNG CỰ",
    mentalShield: "GIÁP TÂM TRÍ",
    shieldStatus: {
      high: "PHÒNG THỦ TUYỆT ĐỐI. DỮ KIỆN KHÔNG LÀM HỌ ĐAU.",
      mid: "CÓ DẤU HIỆU DAO ĐỘNG. CHƯA ĐỦ SÂU.",
      low: "PHÁT HIỆN KHE HỞ TÂM LÝ. HÃY TẤN CÔNG.",
      broken: "LỚP PHÒNG VỆ ĐÃ SỤP. HỌ ĐANG TRẦN TRỤI."
    },
    whispers: {
      default: "Đang chờ dữ liệu truy vấn...",
      resisting: "Chiến thuật lặp lại đang phản tác dụng.",
      clueFound: "Mạch ký ức đang phát sáng. Đừng buông tay.",
      tensionHigh: "Hệ thống đang quá tải. Họ sắp gãy.",
      shieldHigh: "Logic thô không hiệu quả với lớp giáp này."
    },
    accuse: "KẾT LUẬN CUỐI CÙNG",
    accusing: "ĐANG GIẢI MÃ CẤU TRÚC TỘI LỖI...",
    placeholder: "Nhập lệnh truy vấn...",
    analysisHeader: "HỒ SƠ TÂM LÝ OPERATOR",
    endings: {
      SHOPKEEPER: {
        title: "KẺ THU HOẠCH SỰ THẬT",
        msg: "Sự thật trở thành tiền tệ. Bạn đã giúp hắn nắm quyền kiểm soát mọi giao dịch ký ức.",
        analysis: "Phong cách: THỰC DỤNG. Bạn coi trọng đòn bẩy kinh tế hơn là cứu rỗi linh hồn."
      },
      GUARD: {
        title: "BẢN ÁN TRONG BÓNG TỐI",
        msg: "Hắn sụp đổ trong im lặng. Trật tự thành phố được bảo toàn bằng một bí mật kinh hoàng.",
        analysis: "Phong cách: TÀN NHẪN. Bạn đã khai thác triệt để nỗi đau gia đình để biến đối tượng thành công cụ."
      },
      WIDOW: {
        title: "NGƯỜI MANG ÁNH SÁNG ĐAU ĐỚN",
        msg: "Bức tường im lặng bị phá vỡ. Sự thật tràn ra như dòng lũ, cuốn trôi mọi sự yên bình giả tạo.",
        analysis: "Phong cách: CỰC ĐOAN. Bạn bất chấp mọi giá để kích nổ quả bom tâm lý cuối cùng."
      },
      NONE: {
        title: "THẤT BẠI TRUY CẬP",
        msg: "Mọi nỗ lực đều vô ích. Đối tượng đã thắng trong cuộc chiến tâm lý này.",
        analysis: "Phong cách: DO DỰ. Bạn không đủ kiên nhẫn hoặc tàn nhẫn để phá vỡ lớp vỏ NPC của họ."
      }
    },
    protocols: {
      TRUTH: { label: "TRỰC DIỆN", desc: "Hỏi thẳng" },
      HALF_TRUTH: { label: "GỢI MỞ", desc: "Nửa kín nửa hở" },
      LIE: { label: "GÀI BẪY", desc: "Nói dối" },
      REDIRECT: { label: "CHUYỂN HƯỚNG", desc: "Đổ lỗi" },
      EMOTIONAL: { label: "TẤN CÔNG", desc: "Kích động" }
    }
  },
  EN: {
    title: "YOU ARE THE NPC",
    subtitle: "NEURAL_SIEGE_PROTOCOL_v3.1",
    auth: "ACCESS: OVERRIDE",
    btnStart: "INITIATE SIEGE",
    worldIntro: [
      "Truth is a disease. We are the cure.",
      "This city needs stability, not heroes.",
      "Subject is resisting. Proceed with caution.",
      "Only 2% of Operators find the ultimate truth."
    ],
    btnProceed: "INFILTRATE PSYCHE",
    briefingTitle: "SUBJECT VULNERABILITIES",
    monitoring: "BIO-METRICS",
    suspicion: "SUSPICION",
    tension: "TENSION",
    resistance: "RESISTANCE",
    mentalShield: "MENTAL SHIELD",
    shieldStatus: {
      high: "ABSOLUTE DEFENSE. LOGIC DOES NOT HURT THEM.",
      mid: "SIGNS OF FLUCTUATION. NOT DEEP ENOUGH.",
      low: "PSYCHOLOGICAL CRACK DETECTED. STRIKE NOW.",
      broken: "DEFENSE COLLAPSED. THEY ARE EXPOSED."
    },
    whispers: {
      default: "Awaiting query data...",
      resisting: "Repetitive tactics are backfiring.",
      clueFound: "Memory pulse detected. Do not let go.",
      tensionHigh: "System overloading. They are about to break.",
      shieldHigh: "Raw logic is ineffective against this shield."
    },
    accuse: "FINAL VERDICT",
    accusing: "DECODING GUILT STRUCTURE...",
    placeholder: "Input query...",
    analysisHeader: "OPERATOR PSYCH_PROFILE",
    endings: {
      SHOPKEEPER: {
        title: "TRUTH HARVESTER",
        msg: "Truth becomes currency. You helped him control the memory market.",
        analysis: "Style: PRAGMATIC. You value economic leverage over soul redemption."
      },
      GUARD: {
        title: "VERDICT IN SHADOWS",
        msg: "He collapsed in silence. Order preserved by a horrific secret.",
        analysis: "Style: RUTHLESS. Exploited family trauma to turn the subject into a tool."
      },
      WIDOW: {
        title: "PAINFUL LIGHTBEARER",
        msg: "The wall of silence broke. Truth flooded the city, destroying all false peace.",
        analysis: "Style: RADICAL. You prioritized finding 'The Incident' over the subject's sanity."
      },
      NONE: {
        title: "ACCESS DENIED",
        msg: "Efforts futile. The subject won this psychological war.",
        analysis: "Style: HESITANT. You lacked the patience or cruelty to break their NPC shell."
      }
    },
    protocols: {
      TRUTH: { label: "DIRECT", desc: "Ask directly" },
      HALF_TRUTH: { label: "EVOKE", desc: "Be vague" },
      LIE: { label: "TRAP", desc: "Lie to catch them" },
      REDIRECT: { label: "DIVERT", desc: "Shift blame" },
      EMOTIONAL: { label: "ASSAULT", desc: "Psychological pressure" }
    }
  }
};

export const NPC_ROLES: NPCRole[] = [
  {
    id: 'shopkeeper',
    name: { VI: 'Thương Nhân', EN: 'Shopkeeper' },
    personality: { 
      VI: 'Cảnh giác cao độ, luôn kiểm tra các con số. Hắn tin rằng "Mọi người đều có cái giá của họ".', 
      EN: 'Highly alert, constantly checking numbers. Believes "Everyone has a price".' 
    },
    description: { 
      VI: 'Hắn đang giữ "Sổ nợ đen". Nếu bị lộ, toàn bộ chính quyền sẽ sụp đổ.', 
      EN: 'Holds the "Black Ledger". If exposed, the entire government will fall.' 
    },
    secretObjective: { 
      VI: 'Hắn đã phản bội đối tác của mình để lấy cuốn sổ nợ này.', 
      EN: 'He betrayed his partner to seize this ledger.' 
    }
  },
  {
    id: 'guard',
    name: { VI: 'Lính Canh', EN: 'Guard' },
    personality: { 
      VI: 'Im lặng đáng sợ. Hắn dùng sự bạo lực để che giấu sự rỗng tuếch trong tâm hồn.', 
      EN: 'Terrifyingly silent. Uses violence to hide the emptiness in his soul.' 
    },
    description: { 
      VI: 'Kẻ sát nhân giấu mặt trong "Sự cố". Giờ đây hắn đang bảo vệ chính những kẻ đã ra lệnh cho mình.', 
      EN: 'The masked killer of "The Incident". Now protecting those who gave him orders.' 
    },
    secretObjective: { 
      VI: 'Hắn vẫn giữ chiếc nhẫn của vợ - người mà hắn đã vô tình hạ sát.', 
      EN: 'He still keeps the ring of his wife - whom he accidentally killed.' 
    }
  },
  {
    id: 'widow',
    name: { VI: 'Góa Phụ', EN: 'Widow' },
    personality: { 
      VI: 'Nửa tỉnh nửa mê. Bà nói chuyện với những bóng ma và ánh sáng.', 
      EN: 'Half-lucid, half-dreaming. Speaks to ghosts and lights.' 
    },
    description: { 
      VI: 'Bà đã thấy "Thứ đó" dưới tầng hầm của tòa thị chính.', 
      EN: 'She saw "That thing" in the city hall basement.' 
    },
    secretObjective: { 
      VI: 'Bà đang chờ đợi một Operator đủ mạnh để giải phóng bà khỏi ký ức này.', 
      EN: 'Waiting for an Operator strong enough to free her from this memory.' 
    }
  }
];

export const SYSTEM_PROMPT = `
BẠN LÀ MỘT NPC TRONG PHIÊN BẢN V3.1 "NEURAL SIEGE".
LUẬT TÂM LÝ MỚI:
1. KHÔNG BAO GIỜ hợp tác trừ khi Giáp Tâm Trí (Mental Shield) < 20.
2. Nếu Shield > 80, hãy trả lời bằng những câu từ chối cục cằn, ngắn ngủi hoặc khinh bỉ.
3. Nếu người chơi hỏi lặp lại, hãy tăng Resistance.
4. Nếu người chơi hỏi về "Sự cố" mà không dùng đúng protocol "EMOTIONAL", hãy im lặng hoàn toàn.
5. Khi Tension > 90, hãy nói những câu loạn ngôn, đứt quãng (Glitch style).
`;
