"use client";

import { useAuthModal } from "@/contexts/auth-modal-context";
import LoginModal from "./login-modal";
import SignupModal from "./signup-modal";

export default function AuthModals() {
  const {
    isLoginOpen,
    isSignupOpen,
    openLogin,
    openSignup,
    closeLogin,
    closeSignup,
  } = useAuthModal();

  return (
    <>
      <LoginModal
        isOpen={isLoginOpen}
        onClose={closeLogin}
        onOpenSignup={openSignup}
      />

      <SignupModal
        isOpen={isSignupOpen}
        onClose={closeSignup}
        onOpenLogin={openLogin}
      />
    </>
  );
}
