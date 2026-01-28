import {
  Input,
  Checkbox,
  Button,
  Typography,
  Alert,
} from "@material-tailwind/react";
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/smartrent/auth";
import { env } from "@/config/env";
import { initializeGoogleSignIn, promptGoogleSignIn } from "@/lib/googleAuth";

export function SignUp() {
  const { signUp, googleLogin, isLoading } = useAuth();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [agreeTerms, setAgreeTerms] = React.useState(false);
  const [error, setError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Refs for inputs
  const emailInputRef = React.useRef(null);
  const passwordInputRef = React.useRef(null);
  const confirmPasswordInputRef = React.useRef(null);

  // Initialize Google Sign-In - wait for SDK to load
  React.useEffect(() => {
    if (!env.googleClientId) {
      console.warn("Google Client ID not configured");
      return;
    }

    // Wait for Google SDK to load
    const checkGoogleSDK = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(checkGoogleSDK);
        try {
          initializeGoogleSignIn(
            env.googleClientId,
            async (idToken) => {
              try {
                setError("");
                setIsSubmitting(true);
                await googleLogin(idToken);
                // Navigation is handled in AuthProvider
              } catch (err) {
                console.error("Google sign up error:", err);
                let errorMessage = "Đăng ký bằng Google thất bại. Vui lòng thử lại.";
                
                if (err?.error?.message) {
                  errorMessage = err.error.message;
                } else if (err?.message) {
                  errorMessage = err.message;
                }
                
                setError(errorMessage);
              } finally {
                setIsSubmitting(false);
              }
            },
            (error) => {
              console.error("Google Sign-In error:", error);
              setError("Không thể khởi tạo Google Sign-In. Vui lòng thử lại.");
            }
          );
        } catch (error) {
          console.error("Failed to initialize Google Sign-In:", error);
        }
      }
    }, 100);

    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(checkGoogleSDK);
      if (!window.google?.accounts?.id) {
        console.error("Google Sign-In SDK failed to load after 10 seconds");
      }
    }, 10000);

    return () => {
      clearInterval(checkGoogleSDK);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [env.googleClientId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Client-side validation
      if (!email || !password || !confirmPassword) {
        setError("Vui lòng điền đầy đủ thông tin.");
        setIsSubmitting(false);
        return;
      }

      if (password !== confirmPassword) {
        setError("Mật khẩu xác nhận không khớp.");
        setIsSubmitting(false);
        return;
      }

      if (password.length < 6) {
        setError("Mật khẩu phải có ít nhất 6 ký tự.");
        setIsSubmitting(false);
        return;
      }

      if (!agreeTerms) {
        setError("Vui lòng đồng ý với Điều khoản và Điều kiện.");
        setIsSubmitting(false);
        return;
      }

      // Call sign up API - this will throw error if failed
      await signUp(email, password, confirmPassword, null, null);
      
      // If successful, navigation is handled in AuthProvider
      // Reset submitting state (component may not unmount immediately)
      setIsSubmitting(false);
    } catch (err) {
      console.error("Sign up error:", err);
      console.error("Error details:", {
        name: err?.name,
        message: err?.message,
        status: err?.status,
        error: err?.error,
        bodyText: err?.bodyText
      });
      
      let errorMessage = "Đăng ký thất bại. Vui lòng thử lại.";
      
      // Try to get error message from different sources (priority order)
      
      // 1. Check if it's ApiError instance with getErrorMessage method
      if (err && typeof err === 'object' && typeof err.getErrorMessage === 'function') {
        const msg = err.getErrorMessage();
        if (msg && msg !== 'An error occurred') {
          errorMessage = msg;
        }
      }
      
      // 2. Check error property directly (from ApiError)
      if (!errorMessage || errorMessage === "Đăng ký thất bại. Vui lòng thử lại.") {
        if (err?.error?.message) {
          errorMessage = err.error.message;
        }
      }
      
      // 3. Check for validation errors in details
      if (err?.error?.details && typeof err.error.details === 'object') {
        const details = err.error.details;
        const validationErrors = Object.values(details).filter(v => typeof v === 'string');
        if (validationErrors.length > 0) {
          errorMessage = validationErrors[0]; // Show first validation error
        }
      }
      
      // 4. Check response data (fallback)
      if (!errorMessage || errorMessage === "Đăng ký thất bại. Vui lòng thử lại.") {
        if (err?.response?.data?.error?.message) {
          errorMessage = err.response.data.error.message;
        }
      }
      
      // 5. Check message property (last resort)
      if (!errorMessage || errorMessage === "Đăng ký thất bại. Vui lòng thử lại.") {
        if (err?.message && err.message !== 'Sign up failed' && err.message !== 'Request failed') {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
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
        /* Ẩn dấu * trong Material Tailwind Input */
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
            Đăng ký
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

          <div className="mb-1 flex flex-col gap-4">
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Tên đăng nhập hoặc Email <span className="text-red-500">*</span>
            </Typography>
            <Input
              inputRef={emailInputRef}
              size="lg"
              type="email"
              placeholder="name@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  // Find the password input element and focus it
                  const passwordInput = 
                    document.querySelector('input.password-input') ||
                    document.querySelector('input[type="password"]') ||
                    (passwordInputRef.current?.querySelector('input'));
                  
                  if (passwordInput) {
                    passwordInput.focus();
                    passwordInput.select();
                  }
                }
              }}
              disabled={isSubmitting || isLoading}
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />

            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Mật khẩu <span className="text-red-500">*</span>
            </Typography>
            <Input
              inputRef={passwordInputRef}
              type="password"
              size="lg"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  // Find the confirm password input element and focus it
                  const confirmPasswordInput = 
                    document.querySelector('input.confirm-password-input') ||
                    document.querySelectorAll('input[type="password"]')[1] ||
                    (confirmPasswordInputRef.current?.querySelector('input'));
                  
                  if (confirmPasswordInput) {
                    confirmPasswordInput.focus();
                    confirmPasswordInput.select();
                  }
                }
              }}
              disabled={isSubmitting || isLoading}
              className="password-input !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />

            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Xác nhận mật khẩu <span className="text-red-500">*</span>
            </Typography>
            <Input
              inputRef={confirmPasswordInputRef}
              type="password"
              size="lg"
              placeholder="********"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && email && password && confirmPassword && !isSubmitting && !isLoading) {
                  const form = e.target.closest('form');
                  if (form) {
                    form.requestSubmit();
                  }
                }
              }}
              disabled={isSubmitting || isLoading}
              className="confirm-password-input !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
          </div>

          <Checkbox
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            label={
              <Typography
                variant="small"
                color="gray"
                className="flex items-center justify-start font-medium mt-4"
              >
                Tôi đồng ý với&nbsp;
                <a
                  href="#"
                  className="font-normal text-black transition-colors hover:text-gray-900 underline"
                >
                  Điều khoản và Điều kiện
                </a>
              </Typography>
            }
            containerProps={{ className: "-ml-2.5 mt-4" }}
            disabled={isSubmitting}
          />

          <Button 
            className="mt-4" 
            fullWidth 
            type="submit"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? "Đang đăng ký..." : "Đăng ký ngay"}
          </Button>

          <div className="mt-6">
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm">hoặc</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Button 
              size="lg" 
              color="white" 
              className="flex items-center gap-2 justify-center shadow-md" 
              fullWidth
              onClick={(e) => {
                e.preventDefault();
                if (env.googleClientId) {
                  promptGoogleSignIn();
                } else {
                  setError("Google Sign-In chưa được cấu hình. Vui lòng liên hệ quản trị viên.");
                }
              }}
              disabled={isSubmitting || isLoading || !env.googleClientId}
            >
              <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_1156_824)">
                  <path d="M16.3442 8.18429C16.3442 7.64047 16.3001 7.09371 16.206 6.55872H8.66016V9.63937H12.9813C12.802 10.6329 12.2258 11.5119 11.3822 12.0704V14.0693H13.9602C15.4741 12.6759 16.3442 10.6182 16.3442 8.18429Z" fill="#4285F4" />
                  <path d="M8.65974 16.0006C10.8174 16.0006 12.637 15.2922 13.9627 14.0693L11.3847 12.0704C10.6675 12.5584 9.7415 12.8347 8.66268 12.8347C6.5756 12.8347 4.80598 11.4266 4.17104 9.53357H1.51074V11.5942C2.86882 14.2956 5.63494 16.0006 8.65974 16.0006Z" fill="#34A853" />
                  <path d="M4.16852 9.53356C3.83341 8.53999 3.83341 7.46411 4.16852 6.47054V4.40991H1.51116C0.376489 6.67043 0.376489 9.33367 1.51116 11.5942L4.16852 9.53356Z" fill="#FBBC04" />
                  <path d="M8.65974 3.16644C9.80029 3.1488 10.9026 3.57798 11.7286 4.36578L14.0127 2.08174C12.5664 0.72367 10.6469 -0.0229773 8.65974 0.000539111C5.63494 0.000539111 2.86882 1.70548 1.51074 4.40987L4.1681 6.4705C4.8001 4.57449 6.57266 3.16644 8.65974 3.16644Z" fill="#EA4335" />
                </g>
                <defs>
                  <clipPath id="clip0_1156_824">
                    <rect width="16" height="16" fill="white" transform="translate(0.5)" />
                  </clipPath>
                </defs>
              </svg>
              <span>Đăng ký bằng Google</span>
            </Button>
          </div>

          <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-3">
            Đã có tài khoản?{" "}
            <Link to="/auth/sign-in" className="text-gray-900 ml-1 font-bold">
              Đăng nhập
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

export default SignUp;
