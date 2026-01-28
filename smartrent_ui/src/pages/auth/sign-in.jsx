import {
  Card,
  Input,
  Button,
  Typography,
  Alert,
  Checkbox,
} from "@material-tailwind/react";
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/smartrent/auth";
import { env } from "@/config/env";
import { initializeGoogleSignIn, promptGoogleSignIn } from "@/lib/googleAuth";

export function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin, isLoading } = useAuth();

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [error, setError] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Refs for inputs
  const usernameInputRef = React.useRef(null);
  const passwordInputRef = React.useRef(null);

  // Get redirect path from location state
  const from = location.state?.from?.pathname || "/dashboard/home";

  // Check for signup success message
  React.useEffect(() => {
    if (location.state?.signupSuccess) {
      setSuccessMessage("Đăng ký tài khoản thành công!");
      // Clear the state to prevent showing message on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  // Load saved username on mount
  React.useEffect(() => {
    const savedUsername = localStorage.getItem('smartrent.rememberedUsername');
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

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
                console.error("Google login error:", err);
                let errorMessage = "Đăng nhập bằng Google thất bại. Vui lòng thử lại.";
                
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
      if (!username || !password) {
        setError("Vui lòng nhập tên đăng nhập và mật khẩu");
        return;
      }

      await login(username, password);
      
      // Save username if remember me is checked
      if (rememberMe) {
        localStorage.setItem('smartrent.rememberedUsername', username);
      } else {
        localStorage.removeItem('smartrent.rememberedUsername');
      }
      
      // Navigation is handled in AuthProvider after successful login
    } catch (err) {
      console.error("Login error:", err);
      
      let errorMessage = "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.";
      
      // Try to get error message from different sources
      let apiError = null;
      
      // Check if it's ApiError instance
      if (err && typeof err === 'object' && err.getErrorMessage && typeof err.getErrorMessage === 'function') {
        apiError = err.getErrorMessage();
      } 
      // Check response data
      else if (err?.response?.data?.error?.message) {
        apiError = err.response.data.error.message;
      }
      // Check error property directly
      else if (err?.error?.message) {
        apiError = err.error.message;
      }
      // Check message property
      else if (err?.message) {
        apiError = err.message;
      }
      
      // Analyze error message to show specific error
      if (apiError) {
        const lowerError = apiError.toLowerCase();
        if (lowerError.includes("tài khoản không tồn tại") || lowerError.includes("không tồn tại")) {
          errorMessage = "Tài khoản không tồn tại. Vui lòng kiểm tra lại tên đăng nhập hoặc email.";
        } else if (lowerError.includes("mật khẩu không đúng") || lowerError.includes("password")) {
          errorMessage = "Mật khẩu không đúng. Vui lòng thử lại.";
        } else if (lowerError.includes("tài khoản đã bị vô hiệu hóa") || lowerError.includes("disabled")) {
          errorMessage = "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.";
        } else {
          // Use the error message from backend directly (already in Vietnamese)
          errorMessage = apiError;
        }
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
            Đăng nhập
          </Typography>
        </div>

        <form onSubmit={onSubmit} className="mx-auto w-80 max-w-screen-lg lg:w-1/2">
          {successMessage && (
            <Alert 
              color="green" 
              className="mb-4 bg-green-50 text-green-800 border border-green-200"
              onClose={() => setSuccessMessage("")}
            >
              {successMessage}
            </Alert>
          )}
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
              inputRef={usernameInputRef}
              size="lg"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  // Find the password input element and focus it
                  // Try multiple methods to find the input
                  const passwordInput = 
                    document.querySelector('input.password-input') ||
                    document.querySelector('input[type="password"]') ||
                    (passwordInputRef.current?.querySelector('input'));
                  
                  if (passwordInput) {
                    passwordInput.focus();
                    passwordInput.select(); // Select text if any
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
                if (e.key === 'Enter' && username && password && !isSubmitting && !isLoading) {
                  const form = e.target.closest('form');
                  if (form) {
                    form.requestSubmit();
                  }
                }
              }}
              disabled={isSubmitting || isLoading}
              className="password-input !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
          </div>

          <div className="flex items-center justify-between mt-2">
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              label={
                <Typography
                  variant="small"
                  color="gray"
                  className="flex items-center font-medium"
                >
                  Ghi nhớ đăng nhập
                </Typography>
              }
              containerProps={{ className: "-ml-2.5" }}
              disabled={isSubmitting || isLoading}
            />
            <Typography variant="small" className="font-medium">
              <Link to="/auth/forgot-password" className="text-gray-600 hover:text-gray-900">
                Quên mật khẩu?
              </Link>
            </Typography>
          </div>

          <Button 
            className="mt-4" 
            fullWidth 
            type="submit"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
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
                if (!env.googleClientId) {
                  setError("Google Sign-In chưa được cấu hình. Vui lòng liên hệ quản trị viên.");
                  return;
                }
                
                if (!window.google?.accounts?.id) {
                  setError("Google Sign-In SDK chưa được load. Vui lòng thử lại sau vài giây.");
                  return;
                }

                try {
                  // Trigger Google Sign-In prompt
                  promptGoogleSignIn();
                } catch (error) {
                  console.error("Error triggering Google Sign-In:", error);
                  setError("Không thể mở Google Sign-In. Vui lòng thử lại.");
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
              <span>Đăng nhập bằng Google</span>
            </Button>
          </div>

          <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-3">
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

export default SignIn;
