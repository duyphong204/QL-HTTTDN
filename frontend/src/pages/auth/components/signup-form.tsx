import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useAuthStore } from "@/store/auth.store"
import { useNavigate } from "react-router-dom"
import { RegisterSchema, type RegisterValues } from "@/schemas/auth.schema"
import registerBg from "@/assets/auth-bg.png";
export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(RegisterSchema),
  })
  const registerAction = useAuthStore(state => state.register)
  const onSubmit = async (data: RegisterValues) => {
    try {
      await registerAction(data);
      navigate("/login")
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            className="p-6 md:p-8"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Đăng ký</h1>
                <p className="text-sm text-muted-foreground">
                  Tạo tài khoản mới cho bạn
                </p>
              </div>

              {/* Full Name */}
              <Field>
                <FieldLabel>Họ tên</FieldLabel>
                <Input
                  placeholder="Nguyễn Văn A"
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500">
                    {errors.fullName.message}
                  </p>
                )}
              </Field>

              {/* Email */}
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </Field>

              {/* Password (optimized) */}
              <Field>
                <FieldLabel>Mật khẩu</FieldLabel>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? "Ẩn" : "Hiện"}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </Field>

              <FieldDescription>
                Mật khẩu phải có ít nhất 6 ký tự.
              </FieldDescription>

              <Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Đang tạo tài khoản..."
                    : "Tạo tài khoản"}
                </Button>
              </Field>

              <FieldDescription className="text-center">
                Đã có tài khoản?{" "}
                <a href="/login" className="font-medium hover:underline">
                  Đăng nhập
                </a>
              </FieldDescription>
            </FieldGroup>
          </form>

          {/* IMAGE */}
          <div className="bg-muted relative hidden md:block">
            <img
              src={registerBg}
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        Bằng cách tiếp tục, bạn đồng ý với{" "}
        <a href="#" className="underline">
          Điều khoản dịch vụ
        </a>{" "}
        và{" "}
        <a href="#" className="underline">
          Chính sách bảo mật
        </a>
        .
      </FieldDescription>
    </div>
  )
}
