import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const mockRequests = [
  {
    id: 1,
    type: "Nghỉ phép năm",
    startDate: "2026-03-10",
    endDate: "2026-03-12",
    reason: "Về quê",
    status: "Đang chờ duyệt",
  },
  {
    id: 2,
    type: "Nghỉ bệnh",
    startDate: "2026-02-01",
    endDate: "2026-02-02",
    reason: "Bị sốt",
    status: "Đã duyệt",
  },
]

export default function LeaveRequestPage() {
  const [requests, setRequests] = useState(mockRequests)

  const [form, setForm] = useState({
    type: "",
    startDate: "",
    endDate: "",
    reason: "",
  })

  const handleSubmit = () => {
    const newRequest = {
      id: Date.now(),
      ...form,
      status: "Đang chờ duyệt",
    }

    setRequests([newRequest, ...requests])

    setForm({
      type: "",
      startDate: "",
      endDate: "",
      reason: "",
    })
  }

  return (
    <div className="p-6 space-y-6">

      {/* FORM GỬI ĐƠN */}
      <Card>
        <CardHeader>
          <CardTitle>Gửi đơn xin nghỉ phép</CardTitle>
        </CardHeader>

        <CardContent className="grid md:grid-cols-2 gap-4">

          <div>
            <label className="text-sm font-medium">Loại nghỉ</label>
            <Select
              value={form.type}
              onValueChange={(value) =>
                setForm({ ...form, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại nghỉ" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="Nghỉ phép năm">
                  Nghỉ phép năm
                </SelectItem>
                <SelectItem value="Nghỉ bệnh">
                  Nghỉ bệnh
                </SelectItem>
                <SelectItem value="Nghỉ không lương">
                  Nghỉ không lương
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Ngày bắt đầu</label>
            <Input
              type="date"
              value={form.startDate}
              onChange={(e) =>
                setForm({ ...form, startDate: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">Ngày kết thúc</label>
            <Input
              type="date"
              value={form.endDate}
              onChange={(e) =>
                setForm({ ...form, endDate: e.target.value })
              }
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Lý do</label>
            <Textarea
              placeholder="Nhập lý do nghỉ..."
              value={form.reason}
              onChange={(e) =>
                setForm({ ...form, reason: e.target.value })
              }
            />
          </div>

          <div className="md:col-span-2">
            <Button onClick={handleSubmit}>
              Gửi đơn
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* DANH SÁCH ĐƠN */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử đơn nghỉ phép</CardTitle>
        </CardHeader>

        <CardContent>

          <div className="overflow-x-auto">
            <Table>

              <TableHeader>
                <TableRow>
                  <TableHead>Loại nghỉ</TableHead>
                  <TableHead>Ngày bắt đầu</TableHead>
                  <TableHead>Ngày kết thúc</TableHead>
                  <TableHead>Lý do</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>

                {requests.map((item) => (
                  <TableRow key={item.id}>

                    <TableCell>{item.type}</TableCell>

                    <TableCell>
                      {item.startDate}
                    </TableCell>

                    <TableCell>
                      {item.endDate}
                    </TableCell>

                    <TableCell>
                      {item.reason}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          item.status === "Đã duyệt"
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {item.status}
                      </span>
                    </TableCell>

                  </TableRow>
                ))}

              </TableBody>

            </Table>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}