import { Link } from "react-router-dom";
import {
  LucideShieldCheck,
  LucideZap,
  LucideHeadset,
  LucideSmartphone,
  LucideHeadphones,
  LucideSparkles,
  LucideArrowRight,
} from "lucide-react";

const FEATURE_CARDS = [
  {
    icon: <LucideSmartphone className="w-6 h-6" />,
    title: "Thiết bị chính hãng",
    desc: "Điện thoại, laptop, smartwatch từ Apple, Samsung, Sony... nguồn gốc rõ ràng, đầy đủ VAT.",
  },
  {
    icon: <LucideHeadphones className="w-6 h-6" />,
    title: "Phụ kiện đa dạng",
    desc: "Sạc dự phòng, cáp sạc, âm thanh chất lượng cao từ các thương hiệu hàng đầu thế giới.",
  },
  {
    icon: <LucideSparkles className="w-6 h-6" />,
    title: "Ưu đãi hấp dẫn",
    desc: "Flash sale hàng ngày, combo tiết kiệm và freeship toàn quốc cho đơn hàng từ 500k.",
  },
];

const COMMITMENTS = [
  {
    label: "100%",
    title: "Chính hãng",
    desc: "Sản phẩm nhập khẩu chính ngạch.",
    icon: <LucideShieldCheck className="w-5 h-5" />,
  },
  {
    label: "30 Ngày",
    title: "Đổi trả",
    desc: "Lỗi là đổi, không hài lòng hoàn trả.",
    icon: <LucideZap className="w-5 h-5" />,
  },
  {
    label: "24/7",
    title: "Hỗ trợ",
    desc: "Tư vấn kỹ thuật chuyên sâu.",
    icon: <LucideHeadset className="w-5 h-5" />,
  },
];

const SectionTitle = ({ children, subtitle }) => (
  <div className="mb-12">
    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
      {children}
    </h2>
    {subtitle && (
      <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
        {subtitle}
      </p>
    )}
  </div>
);

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative py-20 md:py-32 bg-slate-50 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
              Chào mừng đến với TechStore
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-8 tracking-tight">
              Công nghệ dẫn đầu <br />
              <span className="text-blue-600">Trải nghiệm khác biệt</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed">
              Chúng tôi không chỉ cung cấp thiết bị, chúng tôi mang đến những
              giải pháp công nghệ tối ưu giúp nâng tầm cuộc sống của bạn mỗi
              ngày.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-xl font-bold transition-all hover:bg-blue-600 active:scale-95 shadow-lg"
            >
              Khám phá sản phẩm <LucideArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
        <div className="hidden lg:block absolute top-1/2 right-[-5%] -translate-y-1/2 w-1/2 h-[70%] rounded-3xl overflow-hidden shadow-2xl rotate-2">
          <img
            src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80"
            className="w-full h-full object-cover"
            alt="Tech"
          />
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80"
                className="rounded-2xl shadow-sm"
                alt="img1"
              />
              <div className="space-y-4 pt-8">
                <div className="p-8 bg-blue-600 rounded-2xl text-white">
                  <div className="text-3xl font-bold mb-1">50K+</div>
                  <div className="text-xs uppercase font-medium opacity-80">
                    Thành viên
                  </div>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80"
                  className="rounded-2xl shadow-sm"
                  alt="img2"
                />
              </div>
            </div>

            <div className="space-y-8">
              <SectionTitle subtitle="TechStore ra đời năm 2025 với khao khát trở thành điểm đến tin cậy nhất cho các tín đồ công nghệ tại Việt Nam.">
                Sứ mệnh & Tầm nhìn
              </SectionTitle>
              <div className="space-y-4 text-slate-600 leading-relaxed text-lg">
                <p>
                  Chúng tôi tập trung vào việc cung cấp các thiết bị điện tử
                  chính hãng từ Apple, Samsung, Sony... với quy trình kiểm định
                  chất lượng nghiêm ngặt.
                </p>
                <p>
                  Tối ưu hóa dịch vụ khách hàng và vận hành kho bãi để đảm bảo
                  mỗi sản phẩm đến tay bạn là một niềm vui trọn vẹn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">  
<SectionTitle subtitle="Thông tin chi tiết">Dịch vụ của chúng tôi</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURE_CARDS.map((card, i) => (
              <div
                key={i}
                className="p-8 bg-white rounded-2xl border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-slate-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {card.title}
                </h3>
                <p className="text-slate-500 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="bg-slate-900 rounded-3xl p-10 md:p-16 flex flex-col md:flex-row gap-12 justify-between items-center">
            {COMMITMENTS.map((item, i) => (
              <div
                key={i}
                className="text-center md:text-left flex flex-col md:flex-row items-center gap-6"
              >
                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-blue-400">
                  {item.icon}
                </div>
                <div>
                  <div className="text-3xl font-bold text-white tracking-tight">
                    {item.label}
                  </div>
                  <div className="text-blue-400 font-bold text-sm uppercase mb-1">
                    {item.title}
                  </div>
                  <p className="text-slate-400 text-sm max-w-[180px]">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-blue-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Nâng cấp công nghệ ngay hôm nay
              </h2>
              <p className="text-blue-100 mb-10 text-lg">
                Hàng ngàn ưu đãi đang chờ đón bạn tại TechStore.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-10 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-xl"
              >
                Bắt đầu mua sắm <LucideZap className="w-5 h-5 fill-current" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
