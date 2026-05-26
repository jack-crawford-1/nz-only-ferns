import type { ReactNode } from "react";
import Navbar from "./nav/Navbar";
import Footer from "./Footer";

type Props = {
  children: ReactNode;
  /** Full-bleed content: the page manages its own horizontal padding. */
  bleed?: boolean;
};

export default function Layout({ children, bleed = false }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <Navbar />
      <main className="flex-1">
        {bleed ? (
          children
        ) : (
          <div className="mx-auto w-full max-w-[1400px] px-5 md:px-8">
            {children}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
