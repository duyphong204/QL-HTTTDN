import { Mail, Phone, MapPin, Send, Clock, MessageSquare } from 'lucide-react';

const CONTACT_INFO = [
  {
    icon: <MapPin className="w-6 h-6" />,
    title: "Địa chỉ",
    content: "14/39 Phạm Hùng, phường Chánh Hưng, TP. Hồ Chí Minh",
    subContent: "Gần ngã tư Nguyễn Văn Linh"
  },
  {
    icon: <Phone className="w-6 h-6" />,
    title: "Số điện thoại",
    content: "0123 456 789",
    subContent: "Hotline hỗ trợ 24/7"
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: "Email",
    content: "support@techstore.vn",
    subContent: "Phản hồi trong vòng 24h"
  }
];

export default function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="relative py-20 md:py-28 bg-slate-900 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-400 text-sm font-medium mb-6">
            <MessageSquare className="w-4 h-4" />
            <span>Liên hệ ngay</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Kết nối với <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">TechStore</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Mọi thắc mắc của bạn sẽ được đội ngũ chuyên gia của chúng tôi giải đáp tận tâm và nhanh chóng nhất.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 -mt-16 relative z-20 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-12">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Gửi tin nhắn</h2>
                <p className="text-slate-500 mb-8">Hãy để lại thông tin, chúng tôi sẽ liên hệ lại ngay.</p>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 ml-1">Họ và tên</label>
                      <input
                        type="text"
                        placeholder="Nguyễn Văn A"
                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 ml-1">Email</label>
                      <input
                        type="email"
                        placeholder="abc@gmail.com"
                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-900"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Nội dung cần hỗ trợ</label>
                    <textarea
                      placeholder="Tôi cần tư vấn về..."
                      rows={4}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-900 resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full md:w-max px-10 py-4 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-lg shadow-slate-200"
                  >
                    <Send className="w-5 h-5" />
                    Gửi yêu cầu ngay
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-600 rounded-[2rem] p-8 text-white shadow-xl shadow-blue-200">
              <Clock className="w-10 h-10 mb-6 opacity-80" />
              <h3 className="text-2xl font-bold mb-2">Giờ làm việc</h3>
              <div className="space-y-2 opacity-90 text-lg">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span>Thứ 2 - Thứ 7:</span>
                  <span className="font-semibold">08:00 - 21:00</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span>Chủ nhật:</span>
                  <span className="font-semibold">09:00 - 18:00</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Thông tin khác</h3>
              <div className="space-y-6">
                {CONTACT_INFO.map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{item.title}</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">{item.content}</p>
                      <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">{item.subContent}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200 border-8 border-white h-[450px]">
          <iframe
            title="TechStore Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.9544155255326!2d106.6756613!3d10.7380025!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f08f8702c81%3A0x6b9d6a36c845b4c1!2zMTQvMzkgUGjhuqFtIEjDuW5nLCBQaMaw4budbmcgNCwgUXXhuq1uIDgsIEjhu5MgQ2jDryBNaW5o!5e0!3m2!1svi!2s!4v1713524000000!5m2!1svi!2s"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            className="grayscale hover:grayscale-0 transition-all duration-700"
          ></iframe>
        </div>
      </div>
    </div>
  );
}