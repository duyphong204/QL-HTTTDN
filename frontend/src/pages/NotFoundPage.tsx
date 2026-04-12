import { Link } from "react-router-dom"
import { Home, ArrowLeft } from "lucide-react"

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      
      <div className="text-center">

        {/* 404 Text */}
        <h1 className="text-9xl font-bold text-gray-800">404</h1>

        {/* Title */}
        <h2 className="mt-4 text-2xl font-semibold text-gray-700">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="mt-2 text-gray-500">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>

        {/* Buttons */}
        <div className="mt-6 flex items-center justify-center gap-4">

          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-white shadow hover:bg-blue-700 transition"
          >
            <Home size={18} />
            Trang chủ
          </Link>

          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2 text-gray-700 hover:bg-gray-100 transition"
          >
            <ArrowLeft size={18} />
            Quay lại
          </button>

        </div>

      </div>

    </div>
  )
}

export default NotFoundPage
