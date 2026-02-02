
import { DialogueProtocol, Language } from '../types';

const responses: Record<string, Record<DialogueProtocol, string[]>> = {
  vi: {
    TRUTH: [
      "Có lẽ bạn nói đúng, nhưng tôi không biết gì thêm.",
      "Sự thật luôn đắng cay, phải không?",
      "Tôi hiểu ý bạn, nhưng hồ sơ của tôi hoàn toàn sạch."
    ],
    HALF_TRUTH: [
      "Bạn chỉ biết một nửa câu chuyện thôi.",
      "Có những thứ tốt nhất nên để trong bóng tối.",
      "Mọi chuyện không đơn giản như bạn nghĩ đâu."
    ],
    LIE: [
      "Bạn đang bịa đặt! [Đồng tử giãn]",
      "Tôi chưa bao giờ nghe thấy điều đó. [Đổ mồ hôi]",
      "Vớ vẩn, ai đã nói với bạn như vậy?"
    ],
    REDIRECT: [
      "Sao bạn không đi hỏi lão Thợ Rèn ấy?",
      "Chuyện này chẳng liên quan gì đến tôi cả.",
      "Bạn đang phí thời gian ở đây đấy."
    ],
    EMOTIONAL: [
      "Cút đi! Đừng làm phiền tôi nữa!",
      "Bạn không biết tôi đã phải trải qua những gì đâu...",
      "Dừng lại! Tôi không muốn nghe thêm bất cứ điều gì!"
    ]
  },
  en: {
    TRUTH: [
      "Maybe you're right, but I know nothing more.",
      "Truth is always bitter, isn't it?",
      "I see your point, but my records are clean."
    ],
    HALF_TRUTH: [
      "You only know half the story.",
      "Some things are better left in the dark.",
      "It's not as simple as you think."
    ],
    LIE: [
      "You're making this up! [Pupil dilation]",
      "I've never heard of that. [Sweating]",
      "Nonsense, who told you that?"
    ],
    REDIRECT: [
      "Why don't you ask the Blacksmith instead?",
      "This has nothing to do with me.",
      "You're wasting your time here."
    ],
    EMOTIONAL: [
      "Get out! Leave me alone!",
      "You have no idea what I've been through...",
      "Stop! I don't want to hear another word!"
    ]
  }
};

export const getPlaceholderResponse = (protocol: DialogueProtocol, lang: Language): string => {
  const l = lang.toLowerCase();
  const options = responses[l][protocol];
  return options[Math.floor(Math.random() * options.length)];
};
