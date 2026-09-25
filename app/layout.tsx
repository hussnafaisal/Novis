import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { StoreProvider } from "@/components/StoreProvider";
import InitialLoader from "@/components/InitialLoader";

export const metadata: Metadata = {
  title: "Novis Timepieces | Timeless Luxury",
  description: "A refined black-and-gold luxury watch store by Novis Timepieces.",
  icons: { icon: "/fogo.svg" },
};

// Some browser extensions inject `cz-shortcut-listen` into SVG/DOM nodes
// before React hydrates the page. Removing that extension-only attribute
// before hydration keeps the server HTML and client HTML identical.
const extensionCleanup = `
(function () {
  function clean(root) {
    if (!root || !root.querySelectorAll) return;
    if (root.nodeType === 1 && root.hasAttribute && root.hasAttribute("cz-shortcut-listen")) {
      root.removeAttribute("cz-shortcut-listen");
    }
    root.querySelectorAll("[cz-shortcut-listen]").forEach(function (node) {
      node.removeAttribute("cz-shortcut-listen");
    });
  }
  clean(document.documentElement);
  new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType === 1) clean(node);
      });
      if (mutation.type === "attributes" && mutation.attributeName === "cz-shortcut-listen" && mutation.target) {
        mutation.target.removeAttribute("cz-shortcut-listen");
      }
    });
  }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["cz-shortcut-listen"] });
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: extensionCleanup }} />
      </head>
      <body suppressHydrationWarning>
        <InitialLoader />
        <StoreProvider>
          <Header />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
