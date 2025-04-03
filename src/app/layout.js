"use client";

import AuthProvider from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import NavbarWrapper from "@/components/NavbarWrapper/NavbarWrapper";

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          <Toaster position="top-right" />
          <div className="flex flex-col min-h-screen">
            <NavbarWrapper />
            <main className="flex-grow h-full">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
