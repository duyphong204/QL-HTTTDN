export const ERROR_MESSAGES = {
  GENERIC: 'Lỗi không xác định',
  NETWORK: 'Lỗi kết nối mạng',
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này',
  NOT_FOUND: 'Không tìm thấy dữ liệu',
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN: 'Đăng nhập thành công 🎉',
  LOGOUT: 'Đã đăng xuất 👋',
  REGISTER: 'Đăng ký thành công 🎉',
  CREATE: 'Thêm thành công',
  UPDATE: 'Cập nhật thành công',
  DELETE: 'Xóa thành công',
} as const;
