import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUp appearance={{ elements: { rootBox: "w-full max-w-md", cardBox: "w-full", card: "w-full rounded-2xl" } }} />
    </Suspense>
  );
}
