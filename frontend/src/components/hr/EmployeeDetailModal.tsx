import type { Employee } from "@/types/hr.type"

interface Props {
  employee: Employee | null
  onClose: () => void
}

export function EmployeeDetailModal({ employee, onClose }: Props) {

  if (!employee) return null

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="bg-white p-6 rounded-xl w-125 space-y-4">

        <h2 className="text-lg font-semibold">
          Chi tiết nhân viên
        </h2>

        <div className="space-y-2 text-sm">

          <p>Mã NV: {employee.code}</p>
          <p>Tên: {employee.user?.profile?.fullName}</p>
          <p>Phòng ban: {employee.department}</p>
          <p>Chức vụ: {employee.position}</p>
          <p>Lương: {employee.baseSalary.toLocaleString("vi-VN")} ₫</p>

        </div>

        <div>

          <h3 className="font-medium mb-2">
            Lịch sử công việc
          </h3>

          {employee.jobHistories?.length ? (

            employee.jobHistories.map((job) => (

              <div key={job.id} className="border p-2 rounded text-sm mb-2">

                <p>{job.department} - {job.position}</p>

                <p className="text-gray-500 text-xs">
                  {new Date(job.startDate).toLocaleDateString()} →{" "}
                  {job.endDate
                    ? new Date(job.endDate).toLocaleDateString()
                    : "Hiện tại"}
                </p>

              </div>

            ))

          ) : (

            <p className="text-gray-400 text-sm">
              Chưa có lịch sử công việc
            </p>

          )}

        </div>

        <div className="flex justify-end">

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg"
          >
            Đóng
          </button>

        </div>

      </div>

    </div>

  )

}