import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Lock, User, ArrowRight, AlertCircle } from "lucide-react";
import { register, clearError } from "./authSlice";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";
import logo from "../../assets/logo2.png";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, user } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    username: "",
    email: "",
    full_name: "",
    password: "",
  });

  // Clear stale errors
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/app/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!form.username || !form.full_name || !form.email || !form.password) {
      toast.error("Please fill all fields");
      return;
    }

    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      const result = await dispatch(register(form));

      if (register.fulfilled.match(result)) {
        toast.success("OTP sent to your email!");
        navigate("/verify-otp", { state: { email: form.email } });
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong", err);
    }
  };

  const change = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-0 mb-6 group">
            <img src={logo} alt="CrewFlow Logo" className="w-14 h-14 pr-2 group-hover:scale-110 transition-transform duration-300 object-contain drop-shadow-lg" />
            <span className="text-3xl font-bold tracking-tight group-hover:opacity-80 transition-opacity duration-300">
              <span className="text-white">Crew</span>
              <span className="bg-gradient-to-r from-blue-500 to-cyan-400 text-transparent bg-clip-text drop-shadow-sm">Flow</span>
            </span>
          </Link>

          <h1 className="text-2xl font-bold text-dark-50">
            Create your account
          </h1>
          <p className="text-dark-400 mt-1 text-sm">
            Start managing projects with your team
          </p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Username"
              type="text"
              icon={User}
              placeholder="janesmith"
              value={form.username}
              onChange={change("username")}
              required
              autoFocus
            />

            <Input
              label="Full Name"
              type="text"
              icon={User}
              placeholder="John Smith"
              value={form.full_name}
              onChange={change("full_name")}
              required
            />

            <Input
              label="Email"
              type="email"
              icon={Mail}
              placeholder="you@company.com"
              value={form.email}
              onChange={change("email")}
              required
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="Minimum 8 characters"
              value={form.password}
              onChange={change("password")}
              required
            />

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                <span>
                  {error?.detail ||
                    error?.message ||
                    "Registration failed. Please check your details."}
                </span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full justify-center"
              loading={loading}
              disabled={!form.username || !form.full_name || !form.email || !form.password}
              icon={ArrowRight}
            >
              Create account
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-dark-400">
            Already have an account?{" "}
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

export default Register;
