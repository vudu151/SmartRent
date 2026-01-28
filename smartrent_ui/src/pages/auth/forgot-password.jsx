import {
  Input,
  Button,
  Typography,
  Alert,
} from "@material-tailwind/react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "@/api/auth";
import { ApiError } from "@/lib/apiError";

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
      // Client-side validation
      if (!email) {
        setError("Vui lòng nhập email của bạn.");
        setIsSubmitting(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Email không hợp lệ. Vui lòng nhập đúng định dạng email.");
        setIsSubmitting(false);
        return;
      }

      // Call forgot password API
      await forgotPassword({ email });
      
      // Show success message
      setSuccess("Vui lòng kiểm tra gmail để đặt lại mật khẩu.");
    } catch (err) {
      console.error("Forgot password error:", err);
      console.error("Error details:", {
        name: err?.name,
        message: err?.message,
        status: err?.status,
        error: err?.error,
        bodyText: err?.bodyText
      });
      
      let errorMessage = "Đã xảy ra lỗi. Vui lòng thử lại sau.";
      
      // Try to get error message from different sources
      if (err && typeof err === 'object' && typeof err.getErrorMessage === 'function') {
        const msg = err.getErrorMessage();
        if (msg && msg !== 'An error occurred') {
          errorMessage = msg;
        }
      } else if (err?.error?.message) {
        errorMessage = err.error.message;
      } else if (err?.message && err.message !== 'Forgot password failed' && err.message !== 'Request failed') {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
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
              {isSubmitting ? "Đang gửi..." : success ? "Đã gửi email" : "Gửi yêu cầu"}
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
