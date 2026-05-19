import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#7c3aed",
            colorBackground: "#0c0c10",
            colorInputBackground: "rgba(255,255,255,0.04)",
            colorInputText: "#ffffff",
            colorText: "#ffffff",
            colorTextSecondary: "rgba(255,255,255,0.5)",
            borderRadius: "0.75rem",
          },
          elements: {
            rootBox: "mx-4",
            card: "bg-[#0c0c10]/95 border border-white/[0.1] shadow-2xl shadow-black/50 backdrop-blur-xl",
            headerTitle: "text-white",
            headerSubtitle: "text-white/40",
            socialButtonsBlockButton: "border-white/[0.1] bg-white/[0.04] text-white hover:bg-white/[0.08]",
            dividerLine: "bg-white/[0.08]",
            dividerText: "text-white/30",
            formFieldLabel: "text-white/50",
            formButtonPrimary: "bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10",
            footerActionLink: "text-violet-400 hover:text-violet-300",
            footerActionText: "text-white/40",
          },
        }}
      />
    </div>
  );
}
