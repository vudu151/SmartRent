import {
  Input,
  Button,
  Typography,
  Alert,
} from "@material-tailwind/react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      if (!email) {
        setError("Vui lòng nhập email của bạn.");
        return;
      }

      // TODO: Implement forgot password API call
      // For now, just show success message
      setTimeout(() => {
        setSuccess("Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư.");
        setIsSubmitting(false);
      }, 1000);
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        input[required]::after,
        input[required]::before,
        .material-tailwind input[required]::after,
        .material-tailwind input[required]::before,
        [class*="Input"] input[required]::after,
        [class*="Input"] input[required]::before,
        label[class*="required"]::after,
        label[class*="required"]::before {
          display: none !important;
          content: none !important;
        }
        .material-tailwind [class*="Input"]::after,
        .material-tailwind [class*="Input"]::before {
          display: none !important;
          content: none !important;
        }
      `}</style>
      <section className="h-screen flex gap-4 p-8">
        <div className="w-full lg:w-3/5 flex flex-col justify-center">
          <div className="text-center mb-6">
            <Typography variant="h2" className="font-bold">
              Quên mật khẩu
            </Typography>
          </div>

          <form onSubmit={onSubmit} className="mx-auto w-80 max-w-screen-lg lg:w-1/2">
            {error && (
              <Alert 
                color="red" 
                className="mb-4 bg-red-50 text-red-800 border border-red-200"
              >
                {error}
              </Alert>
            )}

            {success && (
              <Alert 
                color="green" 
                className="mb-4 bg-green-50 text-green-800 border border-green-200"
              >
                {success}
              </Alert>
            )}

            <div className="mb-1 flex flex-col gap-4">
              <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
                Email <span className="text-red-500">*</span>
              </Typography>
              <Input
                size="lg"
                type="email"
                placeholder="name@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting || !!success}
                className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>

            <Button 
              className="mt-4" 
              fullWidth 
              type="submit"
              disabled={isSubmitting || !!success}
            >
              {isSubmitting ? "Đang gửi..." : success ? "Đã gửi email" : "Gửi liên kết đặt lại"}
            </Button>

            <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-6">
              Nhớ mật khẩu?{" "}
              <Link to="/auth/sign-in" className="text-gray-900 ml-1 font-bold">
                Đăng nhập
              </Link>
            </Typography>

            <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-2">
              Chưa có tài khoản?{" "}
              <Link to="/auth/sign-up" className="text-gray-900 ml-1 font-bold">
                Đăng ký
              </Link>
            </Typography>
          </form>
        </div>

        <div className="w-2/5 h-full hidden lg:block">
          <img
            src="/img/logo-signin.jpg"
            className="h-full w-full object-cover rounded-3xl"
            alt="SmartRent"
          />
        </div>
      </section>
    </>
  );
}

export default ForgotPassword;
