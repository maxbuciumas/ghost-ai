import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignIn appearance={{ elements: { rootBox: "w-full max-w-md", cardBox: "w-full", card: "w-full rounded-2xl" } }} />
    </Suspense>
  );
}
