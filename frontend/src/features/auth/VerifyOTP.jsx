import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mail, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";
import { verifyEmailOTP, clearError } from "./authSlice";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";
import logo from "../../assets/logo2.png";

const VerifyOTP = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, error } = useSelector((state) => state.auth);
  const [otp, setOtp] = useState("");
  const email = location.state?.email || "";

  useEffect(() => {
    dispatch(clearError());
    if (!email) {
      toast.error("Email missing. Please register again.");
      navigate("/register");
    }
  }, [dispatch, email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      const result = await dispatch(verifyEmailOTP({ email, otp }));

      if (verifyEmailOTP.fulfilled.match(result)) {
        toast.success("Account verified! You can now sign in.");
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      toast.error("Verification failed");
    }
  };

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
          <h1 className="text-2xl font-bold text-dark-50">Verify your email</h1>
          <p className="text-dark-400 mt-1 text-sm">
            We've sent a 6-digit code to <span className="text-brand-400 font-medium">{email}</span>
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="One-Time Password"
              type="text"
              icon={ShieldCheck}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              autoFocus
              maxLength={6}
            />

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                <span>{error.detail || error.message || "Invalid OTP. Please try again."}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full justify-center"
              loading={loading}
              disabled={otp.length !== 6}
              icon={ArrowRight}
            >
              Verify Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-dark-400">
            Didn't receive the code?{" "}
            <Link
              to="/register"
              className="text-brand-400 hover:text-brand-300 font-medium"
            >
              Try again
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
