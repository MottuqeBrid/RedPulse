import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { user, login, loading } = useAuth();

  if (user && !loading) {
    return navigate("/profile");
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] px-4">
      <div className="card bg-base-200 w-full max-w-md shadow-md">
        <div className="card-body">
          <h2 className="card-title text-2xl justify-center mb-2">Login</h2>
          <p className="text-center text-base-content/60 mb-4">
            Welcome back to RedPulse
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label className="label">
                <a className="label-text-alt link link-hover text-primary">
                  Forgot password?
                </a>
              </label>
            </div>
            <button type="submit" className="btn btn-primary w-full mt-2">
              Login
            </button>
          </form>
          <div className="divider">OR</div>
          <p className="text-center text-sm">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary font-semibold link-hover"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
