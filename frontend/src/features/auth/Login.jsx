import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { login, clearError } from "./authSlice";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";
import logo from "../../assets/logo2.png";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, error, user } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const from = location.state?.from?.pathname || "/app/dashboard";

  // Clear stale errors on mount
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
    if (!form.email || !form.password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const result = await dispatch(login(form));

      if (login.fulfilled.match(result)) {
        toast.success("Welcome back!");
        setForm({ email: form.email, password: "" }); // clear password
        navigate(from, { replace: true });
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-0 mb-6 group">
            <img src={logo} alt="CrewFlow Logo" className="w-14 h-14 pr-2 group-hover:scale-110 transition-transform duration-300 object-contain drop-shadow-lg" />
            <span className="text-3xl font-bold tracking-tight group-hover:opacity-80 transition-opacity duration-300">
              <span className="text-white">Crew</span>
              <span className="bg-gradient-to-r from-blue-500 to-cyan-400 text-transparent bg-clip-text drop-shadow-sm">Flow</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-dark-50">Welcome back</h1>
          <p className="text-dark-400 mt-1 text-sm">
            Sign in to your account to continue
          </p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              icon={Mail}
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoFocus
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                <span>
                  {error?.detail ||
                    error?.message ||
                    "Invalid credentials. Please try again."}
                </span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full justify-center"
              loading={loading}
              disabled={!form.email || !form.password}
              icon={ArrowRight}
            >
              Sign in
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-dark-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-brand-400 hover:text-brand-300 font-medium"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
