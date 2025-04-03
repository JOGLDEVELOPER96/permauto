"use client";

import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/navbar/page";

export default function NavbarWrapper() {
  const { shouldShowNavbar } = useAuth();

  // Solo renderizar el Navbar si shouldShowNavbar devuelve true
  if (!shouldShowNavbar()) {
    return null;
  }

  return <Navbar />;
}
