import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useSEO } from "@/hooks/useSEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc";
import { SiFacebook, SiApple } from "react-icons/si";

const Auth = () => {
  useSEO({
    title: "Sign In | CareConnect",
    description: "Sign in or create an account to personalize your CareConnect experience.",
    canonical: typeof window !== 'undefined' ? window.location.href : undefined,
  });

  const navigate = useNavigate();
  const { user, loading, signInWithEmail, signUpWithEmail, signInWithProvider } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      navigate("/settings", { replace: true });
    }
  }, [user, loading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signin") {
        await signInWithEmail(email, password);
        navigate("/settings", { replace: true });
      } else {
        await signUpWithEmail(email, password);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto max-w-md px-4 py-10">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{mode === "signin" ? "Welcome back" : "Create your account"}</CardTitle>
          <CardDescription>
            {mode === "signin" ? "Sign in to access your settings and favorites." : "Sign up with email or use a social account."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Please wait..." : mode === "signin" ? "Sign In" : "Sign Up"}
            </Button>
          </form>

          <div className="flex items-center gap-4 py-2">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or continue with</span>
            <Separator className="flex-1" />
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button variant="outline" onClick={() => signInWithProvider("google")}>
              <FcGoogle className="mr-2 h-4 w-4" /> Google
            </Button>
            <Button variant="outline" onClick={() => signInWithProvider("facebook")}>
              <SiFacebook className="mr-2 h-4 w-4" /> Facebook
            </Button>
            <Button variant="outline" onClick={() => signInWithProvider("apple")}>
              <SiApple className="mr-2 h-4 w-4" /> Apple
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            {mode === "signin" ? (
              <button onClick={() => setMode("signup")} className="underline hover:no-underline">Need an account? Sign up</button>
            ) : (
              <button onClick={() => setMode("signin")} className="underline hover:no-underline">Already have an account? Sign in</button>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default Auth;
