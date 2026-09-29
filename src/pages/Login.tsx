import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Sidebar from "@/components/Sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  if (user) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div style={{ padding: 6 }}>
            <div className="bg-background p-10 md:p-12 max-w-md">
              <h1 className="text-2xl font-bold uppercase tracking-tight text-foreground mb-4">Account</h1>
              <p className="text-sm text-muted-foreground mb-6">Signed in as {user.email}</p>
              <Button variant="outline" onClick={signOut} className="text-xs uppercase tracking-widest">
                Sign Out
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isForgot) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setMessage("Check your email for a password reset link.");
      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { username: username || undefined },
          },
        });
        if (error) throw error;
        setMessage("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ padding: 6 }}>
          <div className="bg-background p-10 md:p-12 max-w-md">
            <h1 className="text-2xl font-bold uppercase tracking-tight text-foreground mb-6">
              {isForgot ? "Reset Password" : isSignUp ? "Sign Up" : "Login"}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {!isForgot && (
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              )}
              {isSignUp && !isForgot && (
                <Input
                  type="text"
                  placeholder="Username (optional)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}
              {message && <p className="text-sm text-muted-foreground">{message}</p>}

              <Button type="submit" disabled={loading} className="w-full text-xs uppercase tracking-widest">
                {loading ? "..." : isForgot ? "Send Reset Link" : isSignUp ? "Create Account" : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 space-y-2 text-xs text-muted-foreground">
              {!isForgot && (
                <button
                  onClick={() => { setIsSignUp(!isSignUp); setError(""); setMessage(""); }}
                  className="block hover:text-foreground transition-colors"
                >
                  {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                </button>
              )}
              <button
                onClick={() => { setIsForgot(!isForgot); setError(""); setMessage(""); }}
                className="block hover:text-foreground transition-colors"
              >
                {isForgot ? "Back to login" : "Forgot password?"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
