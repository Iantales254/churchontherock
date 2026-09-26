import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Church on the Rock | Nango",
  description:
    "A growing family of churches in Nango and across Siaya County, Kenya.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en" data-scroll-behavior="smooth"><body suppressHydrationWarning>{children}</body></html>;
}
