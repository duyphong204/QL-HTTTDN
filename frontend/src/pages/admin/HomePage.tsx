import aboutImg from "@/assets/about.jpg";
import heroBg from "@/assets/hero-bg.jpg";
import missionImg from "@/assets/mission.jpg";
import valueImg from "@/assets/value.jpg";
import visionImg from "@/assets/vision.jpg";

const partners = ["Apple", "Samsung", "Dell", "Asus", "Lenovo", "Sony"];

const showrooms = [
  {
    name: "Hà Nội",
    address: "123 Đường ABC, Cầu Giấy",
    image: aboutImg,
  },
  {
    name: "Hồ Chí Minh",
    address: "456 Đường XYZ, Quận 1",
    image: heroBg,
  },
];

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <div
        className="relative h-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative flex h-full items-center justify-center px-4 text-center text-white">
          <div>
            <h1 className="mb-4 text-6xl font-bold">TechZone</h1>
            <p className="mb-8 text-2xl">Thế giới công nghệ trong tầm tay</p>
            <button className="rounded-full bg-white px-8 py-3 text-black transition hover:bg-gray-200">
              Khám phá ngay
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="mb-12 text-center text-4xl font-bold">Về chúng tôi</h2>

        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <img
              src={aboutImg}
              alt="Về TechZone"
              className="h-96 w-full rounded-lg object-cover shadow-xl"
            />
          </div>

          <div>
            <h3 className="mb-4 text-2xl font-semibold">Câu chuyện thương hiệu</h3>
            <p className="mb-4 leading-relaxed text-gray-600">
              Thành lập năm 2020, TechZone tự hào là đơn vị tiên phong trong lĩnh vực
              phân phối sản phẩm công nghệ chính hãng tại Việt Nam.
            </p>
            <p className="mb-4 leading-relaxed text-gray-600">
              Với sứ mệnh mang công nghệ đến gần hơn với mọi người, chúng tôi không ngừng
              mở rộng và phát triển với hệ thống cửa hàng trên toàn quốc.
            </p>

            <div className="mt-8 flex gap-8">
              <div>
                <div className="text-3xl font-bold text-blue-600">5000+</div>
                <div className="text-gray-500">Khách hàng</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">1000+</div>
                <div className="text-gray-500">Sản phẩm</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">50+</div>
                <div className="text-gray-500">Nhân viên</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl bg-white p-8 text-center shadow-lg">
              <img
                src={missionImg}
                alt="Sứ mệnh"
                className="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
              />
              <h3 className="mb-3 text-xl font-bold">Sứ mệnh</h3>
              <p className="text-gray-600">
                Mang đến những sản phẩm công nghệ chất lượng cao với giá cả hợp lý
              </p>
            </div>

            <div className="rounded-xl bg-white p-8 text-center shadow-lg">
              <img
                src={visionImg}
                alt="Tầm nhìn"
                className="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
              />
              <h3 className="mb-3 text-xl font-bold">Tầm nhìn</h3>
              <p className="text-gray-600">
                Trở thành nhà bán lẻ công nghệ hàng đầu Đông Nam Á vào năm 2030
              </p>
            </div>

            <div className="rounded-xl bg-white p-8 text-center shadow-lg">
              <img
                src={valueImg}
                alt="Giá trị"
                className="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
              />
              <h3 className="mb-3 text-xl font-bold">Giá trị cốt lõi</h3>
              <p className="text-gray-600">
                Uy tín - Chất lượng - Sáng tạo - Khách hàng là trung tâm
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-4xl font-bold">Hệ thống showroom</h2>

          <div className="grid gap-8 md:grid-cols-2">
            {showrooms.map((showroom) => (
              <div
                key={showroom.name}
                className="relative h-80 overflow-hidden rounded-xl"
              >
                <img
                  src={showroom.image}
                  alt={showroom.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-6">
                  <h3 className="text-2xl font-bold text-white">{showroom.name}</h3>
                  <p className="text-white">{showroom.address}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-10 text-center text-3xl font-bold">Đối tác của chúng tôi</h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {partners.map((partner) => (
            <div
              key={partner}
              className="flex h-20 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 font-semibold text-gray-600 transition hover:border-blue-200 hover:bg-white hover:text-blue-600"
            >
              {partner}
            </div>
          ))}
        </div>
      </div>

      <div
        className="relative h-96 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-blue-900/80" />
        <div className="relative flex h-full items-center justify-center px-4 text-center text-white">
          <div>
            <h2 className="mb-4 text-4xl font-bold">Gia nhập đội ngũ TechZone</h2>
            <p className="mx-auto mb-8 max-w-2xl text-xl">
              Cơ hội nghề nghiệp hấp dẫn tại môi trường làm việc năng động, chuyên nghiệp
            </p>
            <button className="rounded-full bg-white px-8 py-3 font-semibold text-blue-900 hover:bg-gray-100">
              Xem vị trí tuyển dụng
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h2 className="mb-6 text-4xl font-bold">Liên hệ với chúng tôi</h2>
        <p className="mb-8 text-lg text-gray-600">
          Bạn cần tư vấn hoặc có thắc mắc? Hãy để lại lời nhắn cho chúng tôi
        </p>

        <div className="mb-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border p-6">
            <div className="mb-2 text-3xl">📍</div>
            <h3 className="font-bold">Địa chỉ</h3>
            <p className="text-gray-500">123 Đường ABC, Quận 1, TP.HCM</p>
          </div>

          <div className="rounded-lg border p-6">
            <div className="mb-2 text-3xl">📞</div>
            <h3 className="font-bold">Điện thoại</h3>
            <p className="text-gray-500">(028) 1234 5678</p>
          </div>

          <div className="rounded-lg border p-6">
            <div className="mb-2 text-3xl">✉️</div>
            <h3 className="font-bold">Email</h3>
            <p className="text-gray-500">info@techzone.com</p>
          </div>
        </div>

        <button className="rounded-lg bg-blue-600 px-10 py-4 font-semibold text-white transition hover:bg-blue-700">
          Gửi liên hệ
        </button>
      </div>

      <footer className="bg-gray-900 py-12 text-gray-300">
        <div className="mx-auto max-w-6xl px-4 text-center">           <p>© 2024 TechZone. Công ty TNHH Công nghệ TechZone</p>
          <p className="mt-2 text-sm">
            GPĐKKD: 0123456789 do Sở KHĐT TP.HCM cấp ngày 01/01/2026
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;