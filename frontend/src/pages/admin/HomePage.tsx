import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Building2, 
  ArrowRight,
  ShieldCheck,
  Target,
  Rocket
} from "lucide-react";
// Import các ảnh của bạn...
import aboutImg from "@/assets/about.jpg";
import heroBg from "@/assets/hero-bg.jpg";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* SECTION 1: HERO & ENTRY - Gọn gàng, tập trung vào hành động */}
      <div className="relative h-[80vh] w-full overflow-hidden">
        <img 
          src={heroBg} 
          className="absolute inset-0 h-full w-full object-cover" 
          alt="Background" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/40" />
        
        <div className="relative flex h-full items-center px-8 lg:px-24">
          <div className="max-w-2xl">
            <div className="mb-4 inline-block rounded-full bg-blue-500/20 px-4 py-1 text-sm font-medium text-blue-400 backdrop-blur-sm">
              Hệ thống quản trị nội bộ v2.0
            </div>
            <h1 className="mb-6 text-6xl font-extrabold tracking-tight text-white">
              Tech<span className="text-blue-500">Zone</span> Portal
            </h1>
            <p className="mb-8 text-xl text-slate-300">
              Chào mừng thành viên TechZone. Truy cập hệ thống để quản lý kho hàng, 
              theo dõi báo cáo và hỗ trợ khách hàng.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-bold text-white transition hover:bg-blue-700 shadow-lg shadow-blue-600/30">
                Đăng nhập hệ thống <LayoutDashboard size={20} />
              </button>
              <button className="flex items-center gap-2 rounded-xl bg-white/10 px-8 py-4 font-bold text-white backdrop-blur-md transition hover:bg-white/20">
                Tài liệu nhân viên <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: TỔNG QUAN DOANH NGHIỆP - Dạng Grid hiện đại */}
      <div className="mx-auto -mt-20 max-w-7xl px-8 pb-20">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Users size={28} />
            </div>
            <h3 className="text-xl font-bold">5,000+ Khách hàng</h3>
            <p className="mt-2 text-slate-500 text-sm">Dữ liệu khách hàng tin tưởng sử dụng dịch vụ trên toàn quốc.</p>
          </div>
          <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Package size={28} />
            </div>
            <h3 className="text-xl font-bold">1,000+ Sản phẩm</h3>
            <p className="mt-2 text-slate-500 text-sm">Danh mục hàng hóa đa dạng từ các đối tác công nghệ hàng đầu.</p>
          </div>
          <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Building2 size={28} />
            </div>
            <h3 className="text-xl font-bold">Hệ thống Showroom</h3>
            <p className="mt-2 text-slate-500 text-sm">Mạng lưới cửa hàng trải dài từ Hà Nội đến TP. Hồ Chí Minh.</p>
          </div>
        </div>

        {/* SECTION 3: VĂN HÓA & MỤC TIÊU - Tối giản */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Định hướng phát triển</h2>
            <div className="mx-auto mt-2 h-1 w-20 rounded-full bg-blue-600" />
          </div>
          
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="overflow-hidden rounded-3xl">
              <img src={aboutImg} className="h-full w-full object-cover transition hover:scale-105 duration-500" alt="About" />
            </div>
            <div className="flex flex-col justify-center space-y-8">
              <div className="flex gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                  <Rocket size={20} />
                </div>
                <div>
                  <h4 className="text-xl font-bold">Sứ mệnh</h4>
                  <p className="text-slate-600">Cung cấp giải pháp công nghệ chính hãng, góp phần nâng cao chất lượng cuộc sống người Việt.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                  <Target size={20} />
                </div>
                <div>
                  <h4 className="text-xl font-bold">Tầm nhìn 2030</h4>
                  <p className="text-slate-600">Trở thành chuỗi bán lẻ công nghệ thông minh và hiện đại nhất khu vực.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-xl font-bold">Giá trị cốt lõi</h4>
                  <p className="text-slate-600">Uy tín đặt lên hàng đầu - Sáng tạo là sức sống - Khách hàng là trung tâm.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: SHOWROOM & COPYRIGHT - Tích hợp gọn gàng */}
      <div className="bg-slate-900 px-8 py-20 text-white rounded-t-[3rem]">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-2xl font-bold">Hệ thống quản lý trực thuộc</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <h4 className="text-blue-500 font-bold uppercase tracking-wider text-xs">TechZone Hà Nội</h4>
              <p className="text-slate-400 text-sm">980 Quang Trung, Cầu Giấy</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-blue-500 font-bold uppercase tracking-wider text-xs">TechZone Hồ Chí Minh</h4>
              <p className="text-slate-400 text-sm">456 Đường Nguyễn Huệ, Quận 1</p>
            </div>
            <div className="space-y-2 lg:col-span-2 lg:text-right">
              <p className="text-slate-400 text-sm">© 2026 TechZone Portal. Hệ thống lưu hành nội bộ.</p>
              <p className="text-slate-500 text-xs">GPĐKKD: 0123456789 - Sở KHĐT TP.HCM cấp ngày 01/01/2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;