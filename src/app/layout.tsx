import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Darker_Grotesque, Public_Sans } from "next/font/google";
import { APP_NAME, APP_TAGLINE, ROUTES } from "@/constants";
import "./globals.css";

const darkerGrotesque = Darker_Grotesque({
  variable: "--font-darker-grotesque",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${APP_NAME} · ${APP_TAGLINE}`,
  description:
    "Neighborhood tool-lending board with role-based access control and automated n8n workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${darkerGrotesque.variable} ${publicSans.variable} h-full`}
    >
      <body className="flex min-h-full w-full flex-col">
        <ClerkProvider afterSignOutUrl={ROUTES.home}>
          <div className="flex w-full flex-1 flex-col">
            {children}
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}