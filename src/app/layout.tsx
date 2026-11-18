import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, DM_Sans, Open_Sans } from "next/font/google";
import { MotionProvider } from "@/components/animations/MotionProvider";
import { SiteMotion } from "@/components/animations/SiteMotion";
import { TouchHover } from "@/components/animations/TouchHover";
import { SmoothScroll } from "@/components/animations/SmoothScroll";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { HomepageOnly } from "@/components/navigation/HomepageOnly";
import { siteConfig } from "@/config/site";
import "./globals.css";

// Headlines use Avenir Next Condensed Bold (built into macOS and iOS). Barlow Condensed is the web
// fallback for systems without it (Windows, Android), so headlines keep the same condensed shape.
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--font-barlow-condensed",
  fallback: ["Arial Narrow", "sans-serif"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-dm-sans",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
  variable: "--font-open-sans",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.title, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: "/",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage.src],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage.src],
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#082e30",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${openSans.variable} ${barlowCondensed.variable}`}
    >
      <body>
        <a
          href="#main-content"
          className="fixed top-3 left-3 z-50 -translate-y-24 bg-ink px-5 py-3 text-white transition-transform focus:translate-y-0"
        >
          Skip to main content
        </a>
        <MotionProvider>
          <SmoothScroll />
          <SiteHeader />
          {/* Its own layer: nothing inside a page (map tabs, sticky bars, floating chips) can rise
              over the header or the open menu, whatever its z-index. */}
          <main id="main-content" tabIndex={-1} className="isolate outline-none">
            {children}
          </main>
          <SiteFooter />
          <SiteMotion />
          <TouchHover />
          {/* Homepage-only demo: links that leave the homepage do nothing. */}
          {siteConfig.homepageOnly ? <HomepageOnly /> : null}
        </MotionProvider>
      </body>
    </html>
  );
}
