import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white py-16 md:py-24">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Liên hệ với TechStore</h1>
          <p className="text-xl max-w-2xl mx-auto opacity-90">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7. Đừng ngần ngại liên hệ nhé!
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Thông tin liên hệ */}
          <div className="space-y-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Thông tin liên hệ</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="text-blue-600 mt-1" size={28} />
                  <div>
                    <h3 className="font-semibold text-lg">Địa chỉ</h3>
                    <p className="text-gray-700">
                      14/39 Phạm Hùng, phường Chánh Hưng, TP. Hồ Chí Minh
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="text-blue-600 mt-1" size={28} />
                  <div>
                    <h3 className="font-semibold text-lg">Số điện thoại</h3>
                    <p className="text-gray-700">0123 456 789</p>
                    <p className="text-sm text-gray-500 mt-1">(Hotline hỗ trợ 24/7)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="text-blue-600 mt-1" size={28} />
                  <div>
                    <h3 className="font-semibold text-lg">Email</h3>
                    <p className="text-gray-700">support@techstore.vn</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form liên hệ (có thể kết nối backend sau) */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Gửi tin nhắn cho chúng tôi</h2>
              <form className="space-y-6">
                <input
                  type="text"
                  placeholder="Họ và tên"
                  className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Nội dung tin nhắn..."
                  rows={5}
                  className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition shadow-md"
                >
                  <Send size={18} />
                  Gửi tin nhắn
                </button>
              </form>
            </div>
          </div>

          {/* Google Maps */}
         <div className="rounded-2xl overflow-hidden shadow-xl h-[320px] sm:h-[420px] lg:h-auto">
            <iframe
              title="TechStore Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.9947847311278!2d106.66868997508811!3d10.73488488941136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752e4dc2906da9%3A0x91f5df2abd183e76!2zMTQvMzkgxJAuIFBo4bqhbSBIw7luZywgQsOsbmggSMawbmcsIELDrG5oIENow6FuaCwgSOG7kyBDaMOtIE1pbmgsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1774236494476!5m2!1svi!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>

      {/* CTA nhỏ */}
      <section className="bg-blue-600 text-white py-12 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Cần hỗ trợ ngay bây giờ?
          </h2>
          <p className="text-lg mb-6">Gọi ngay: 0123 456 789 hoặc chat với chúng tôi!</p>
        </div>
      </section>
    </div>
  );
}
