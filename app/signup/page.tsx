import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <AuthCard mode="signup" />
    </Suspense>
  );
}
