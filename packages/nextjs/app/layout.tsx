import { Linden_Hill } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import PlausibleProvider from "next-plausible";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "FrogJuice.Fun",
  description: "Built with 🏗 Scaffold-ETH 2",
});

const lindenHill = Linden_Hill({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-linden-hill",
});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning className={lindenHill.variable}>
      <head>
        <PlausibleProvider domain="frogjuice.fun" />
      </head>
      <body className="bg-gray-800">
        <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
        <div id="zpass-app-connector">{/* This element will be used by the app connector */}</div>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
