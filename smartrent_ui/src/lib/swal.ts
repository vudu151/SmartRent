import Swal, { type SweetAlertIcon } from 'sweetalert2'

/**
 * Hiển thị toast SweetAlert2, tự tắt sau 2s.
 * Dùng chung cho toàn bộ frontend.
 */
export function showToast(
  message: string,
  type: SweetAlertIcon = 'success',
  title?: string,
) {
  return Swal.fire({
    title:
      title ??
      (type === 'success'
        ? 'Thành công'
        : type === 'error'
          ? 'Lỗi'
          : type === 'warning'
            ? 'Cảnh báo'
            : ''),
    text: message,
    icon: type,
    timer: 2000,
    timerProgressBar: true,
    showConfirmButton: false,
    position: 'top-end',
    toast: true,
  })
}

