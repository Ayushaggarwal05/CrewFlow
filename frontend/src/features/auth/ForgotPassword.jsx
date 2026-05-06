import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mail, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { clearError } from "./authSlice";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";
import logo from "../../assets/logo2.png";
import api from "../../services/api";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      // Reusing the ResendOTP logic but via ForgotPassword endpoint
      await api.post("/api/auth/forgot-password/", { email });
      setIsSent(true);
      toast.success("OTP sent to your email!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to send reset code");
    }
  };

  if (isSent) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md text-center">
          <div className="card p-8 flex flex-col items-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-dark-50 mb-2">Check your email</h1>
            <p className="text-dark-400 mb-8">
              We've sent a 6-digit verification code to <span className="text-brand-400">{email}</span>. 
              Use this code to verify your identity and reset your password.
            </p>
            <Button
              onClick={() => navigate("/reset-password", { state: { email } })}
              className="w-full justify-center"
              icon={ArrowRight}
            >
              Go to Reset Password
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-0 mb-6 group">
            <img src={logo} alt="CrewFlow Logo" className="w-14 h-14 pr-2 group-hover:scale-110 transition-transform duration-300 object-contain drop-shadow-lg" />
            <span className="text-3xl font-bold tracking-tight group-hover:opacity-80 transition-opacity duration-300">
              <span className="text-white">Crew</span>
              <span className="bg-gradient-to-r from-blue-500 to-cyan-400 text-transparent bg-clip-text drop-shadow-sm">Flow</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-dark-50">Reset password</h1>
          <p className="text-dark-400 mt-1 text-sm">
            Enter your email to receive a verification code
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                <span>{error.detail || "Error occurred"}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full justify-center"
              loading={loading}
              disabled={!email}
              icon={ArrowRight}
            >
              Send Reset Code
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-dark-400">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-brand-400 hover:text-brand-300 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
