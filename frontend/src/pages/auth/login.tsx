import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const LoginPage = () => {
    const navigate = useNavigate();

    return (
        <div
            className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat relative p-4"
            style={{ backgroundImage: "url('/src/assets/auth-bg.png')" }}
        >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
            <Card className="z-10 w-full max-w-sm shadow-2xl border-none bg-white/90 backdrop-blur-md">
                <CardHeader>
                    <CardTitle className="text-3xl text-center font-bold text-slate-900">GigaStore</CardTitle>
                    <CardDescription className="text-center font-medium">Hệ thống Quản trị Doanh nghiệp</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" placeholder="nguyenvana@gmail.com" className="bg-white/50" />
                    </div>
                    <div className="space-y-2">
                        <Label>Mật khẩu</Label>
                        <Input type="password" placeholder="••••••••" className="bg-white/50" />
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-500 h-11 text-lg font-bold shadow-lg"
                        onClick={() => navigate("/")}>
                        ĐĂNG NHẬP
                    </Button>
                </CardContent>
                <CardFooter className="justify-center border-t border-slate-100 mt-4 pt-4">
                    <p className="text-sm text-slate-600">
                        Mới vào làm? <Link to="/register" className="text-blue-500 font-bold hover:underline">Đăng ký ngay</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default LoginPage;