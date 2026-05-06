import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, Lock, ArrowRight, AlertCircle } from "lucide-react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";
import logo from "../../assets/logo2.png";
import api from "../../services/api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    otp: "",
    new_password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const email = location.state?.email || "";

  useEffect(() => {
    if (!email) {
      toast.error("Session expired. Please try again.");
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    if (form.new_password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (form.new_password !== form.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post("/api/auth/reset-password/", {
        email,
        otp: form.otp,
        new_password: form.new_password,
      });

      toast.success("Password reset successfully!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to reset password. Please check your OTP.");
    } finally {
      setLoading(false);
    }
  };

  const change = (field) => (e) => setForm({ ...form, [field]: e.target.value });

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
          <h1 className="text-2xl font-bold text-dark-50">Set new password</h1>
          <p className="text-dark-400 mt-1 text-sm">
            Enter the code sent to <span className="text-brand-400">{email}</span> and your new password
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Verification Code"
              type="text"
              icon={ShieldCheck}
              placeholder="123456"
              value={form.otp}
              onChange={change("otp")}
              required
              autoFocus
              maxLength={6}
            />

            <Input
              label="New Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={form.new_password}
              onChange={change("new_password")}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={form.confirm_password}
              onChange={change("confirm_password")}
              required
            />

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full justify-center"
              loading={loading}
              disabled={form.otp.length !== 6 || !form.new_password || form.new_password !== form.confirm_password}
              icon={ArrowRight}
            >
              Reset Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
