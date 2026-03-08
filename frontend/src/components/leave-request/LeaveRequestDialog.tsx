import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LEAVE_TYPES } from "./leave-request.constants"
import { 
  CreateLeaveRequestSchema, 
  type CreateLeaveRequestValues 
} from "@/schemas/employee.schema"

function FormField({
  label,
  error,
  children,
}: {
  label:    string
  error?:   string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}

interface LeaveRequestDialogProps {
  open:     boolean
  onClose:  () => void
  onSubmit: (data: CreateLeaveRequestValues) => Promise<void> 
}

export function LeaveRequestDialog({
  open,
  onClose,
  onSubmit,
}: LeaveRequestDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateLeaveRequestValues>({  
    resolver: zodResolver(CreateLeaveRequestSchema),
  })

  const handleClose = () => {
    reset()
    onClose()
  }
  const handleFormSubmit = async (values: CreateLeaveRequestValues) => {
    await onSubmit(values)
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Nộp đơn xin nghỉ</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          noValidate
          className="mt-2 space-y-4"
        >
          {/* Loại đơn */}
          <FormField label="Loại đơn" error={errors.type?.message}>
            <Select
              onValueChange={(val) =>
                setValue("type", val as CreateLeaveRequestValues["type"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn loại đơn nghỉ..." />
              </SelectTrigger>
              <SelectContent>
                {LEAVE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          {/* Ngày — 2 cột trên sm */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Từ ngày" error={errors.startDate?.message}>
              <Input type="date" {...register("startDate")} />
            </FormField>
            <FormField label="Đến ngày" error={errors.endDate?.message}>
              <Input type="date" {...register("endDate")} />
            </FormField>
          </div>

          {/* Lý do */}
          <FormField label="Lý do" error={errors.reason?.message}>
            <Textarea
              {...register("reason")}
              placeholder="Nhập lý do xin nghỉ..."
              rows={4}
              className="resize-none"
            />
          </FormField>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gray-900 hover:bg-gray-700 gap-2"
            >
              {isSubmitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Send size={14} />
              )}
              {isSubmitting ? "Đang gửi..." : "Gửi đơn"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}