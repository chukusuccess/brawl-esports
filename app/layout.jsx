import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://afrobrawlers.vercel.app";

export const metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "AfroBrawlers",
  title: {
    default: "AfroBrawlers — African Brawlhalla community",
    template: "%s | AfroBrawlers",
  },
  description:
    "The home for African Brawlhalla players: community scrims, tournaments, leaderboards, and good energy across the continent.",
  keywords: [
    "Brawlhalla Africa",
    "African Brawlhalla",
    "Brawlhalla tournaments",
    "African esports",
    "Brawlhalla community",
    "AfroBrawlers",
  ],
  authors: [{ name: "AfroBrawlers community" }],
  creator: "AfroBrawlers community",
  publisher: "AfroBrawlers",
  category: "Esports community",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    title: "AfroBrawlers — African Brawlhalla community",
    description:
      "Scrims, tournaments, leaderboards, and a continent-wide Brawlhalla community.",
    url: "/",
    siteName: "AfroBrawlers",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AfroBrawlers — African Brawlhalla community",
    description:
      "Scrims, tournaments, leaderboards, and a continent-wide Brawlhalla community.",
  },
  icons: { icon: "/favicon.ico" },
};

export const viewport = {
  themeColor: "#17121f",
  colorScheme: "light dark",
};

const themeScript = `
  try {
    const savedTheme = localStorage.getItem("afrobrawlers-theme");
    const theme = savedTheme === "dark" || savedTheme === "light"
      ? savedTheme
      : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (_) {}
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  );
}
