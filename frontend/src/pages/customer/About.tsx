import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80"
            alt="Tech background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Chào mừng đến với <span className="text-blue-400">TechStore</span>
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
            Nơi công nghệ chính hãng gặp gỡ trải nghiệm mua sắm đẳng cấp
          </p>
        </div>
      </section>

      {/* Giới thiệu */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Về TechStore
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <p>
              TechStore là nền tảng thương mại điện tử chuyên cung cấp các sản phẩm công nghệ và phụ kiện chính hãng từ những thương hiệu hàng đầu thế giới như Apple, Samsung, Sony, Xiaomi, Anker, JBL, Baseus và nhiều thương hiệu uy tín khác.
            </p>
            <p>
              Chúng tôi ra đời với sứ mệnh mang đến cho người dùng Việt Nam cơ hội sở hữu những thiết bị điện tử chất lượng cao với mức giá cạnh tranh nhất thị trường, đi kèm dịch vụ chăm sóc khách hàng tận tâm và quy trình mua sắm đơn giản, minh bạch.
            </p>
            <p>
              Với hệ thống kho hàng hiện đại tại TP.HCM và mạng lưới vận chuyển nhanh chóng toàn quốc, TechStore cam kết giao hàng trong vòng 1-3 ngày làm việc, hỗ trợ đổi trả dễ dàng trong 30 ngày và bảo hành chính hãng đầy đủ.
            </p>
          </div>
        </div>
      </section>

      {/* Sản phẩm nổi bật */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Chúng tôi mang đến những gì?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-2xl shadow-md hover:shadow-xl transition-all">
              <div className="text-blue-600 mb-4">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Thiết bị chính hãng</h3>
              <p className="text-gray-600">
                Điện thoại, laptop, máy tính bảng, smartwatch, tai nghe, loa... từ các thương hiệu lớn, nguồn gốc rõ ràng, đầy đủ hóa đơn VAT.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl shadow-md hover:shadow-xl transition-all">
              <div className="text-blue-600 mb-4">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Phụ kiện đa dạng</h3>
              <p className="text-gray-600">
                Sạc dự phòng, cáp sạc, ốp lưng, kính cường lực, tai nghe không dây, chuột bàn phím... chất lượng cao, giá tốt.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl shadow-md hover:shadow-xl transition-all">
              <div className="text-blue-600 mb-4">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Ưu đãi hấp dẫn</h3>
              <p className="text-gray-600">
                Flash sale hàng ngày, combo tiết kiệm, mã giảm giá độc quyền, freeship toàn quốc cho đơn từ 500k.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cam kết */}
      <section className="py-16 md:py-24 bg-blue-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
            Cam kết của chúng tôi
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            <div>
              <div className="text-5xl text-blue-600 mb-4">100%</div>
              <p className="text-xl font-semibold">Chính hãng</p>
              <p className="text-gray-600 mt-2">Sản phẩm nhập khẩu chính hãng, có tem bảo hành đầy đủ.</p>
            </div>
            <div>
              <div className="text-5xl text-blue-600 mb-4">30 ngày</div>
              <p className="text-xl font-semibold">Đổi trả miễn phí</p>
              <p className="text-gray-600 mt-2">Không ưng ý? Đổi hoặc hoàn tiền dễ dàng.</p>
            </div>
            <div>
              <div className="text-5xl text-blue-600 mb-4">Hỗ trợ 24/7</div>
              <p className="text-xl font-semibold">Tư vấn tận tâm</p>
              <p className="text-gray-600 mt-2">Chat, hotline, Zalo – luôn sẵn sàng hỗ trợ bạn.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Sẵn sàng trải nghiệm công nghệ đỉnh cao?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
            Khám phá ngay hàng ngàn sản phẩm chất lượng tại TechStore
          </p>
          <Link
            to="/products"
            className="inline-block bg-white text-blue-700 font-bold text-lg px-10 py-5 rounded-full shadow-lg hover:bg-gray-100 transition transform hover:-translate-y-1"
          >
            Xem tất cả sản phẩm →
          </Link>
        </div>
      </section>
    </div>
  );
}