


import "./globals.css";
import Providers from "./providers";
import LanguageWrapper from "../components/LanguageWrapper";
import { Geist, Geist_Mono } from "next/font/google";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  return (
    <Providers session={session}>
      <LanguageWrapper>
        {children}
      </LanguageWrapper>
    </Providers>
  );
}

