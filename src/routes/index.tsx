import { createFileRoute } from "@tanstack/react-router";
import { AppProvider } from "@/hooks/use-theme";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";
import { Nav } from "@/components/cv/Nav";
import { Hero } from "@/components/cv/Hero";
import { About } from "@/components/cv/About";
import { Experience } from "@/components/cv/Experience";
import { Journey } from "@/components/cv/Journey";

import { Projects } from "@/components/cv/Projects";
import { Skills } from "@/components/cv/Skills";
import { Contact } from "@/components/cv/Contact";
import { Footer } from "@/components/cv/Footer";
import { NoiseOverlay } from "@/components/cv/NoiseOverlay";
import { ScrollIndicator } from "@/components/cv/ScrollIndicator";
import { CityBokeh } from "@/components/cv/CityBokeh";
import { DoohTicker } from "@/components/cv/DoohTicker";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Juan Gaudino — Media Planner & OOH/DOOH Strategist" },
      { name: "description", content: "Media planner with 15+ years of experience leading OOH and DOOH campaigns across LATAM. Now based in Salt Lake City, expanding into programmatic and digital analytics for the U.S. market." },
      { property: "og:title", content: "Juan Gaudino — Media Planner & OOH/DOOH Strategist" },
      { property: "og:description", content: "15+ years planning OOH/DOOH campaigns across LATAM. Based in Salt Lake City, UT." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <AppProvider>
      <Page />
    </AppProvider>
  );
}

const TICKER_ITEMS = [
  "IMPRESSIONS · 2.4B+",
  "MARKETS · 7",
  "CAMPAIGNS · 120+",
  "YEARS · 15+",
  "OOH · DOOH · PROGRAMMATIC",
  "LATAM → U.S.",
];

function Page() {
  useSmoothScroll();
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <CityBokeh />
      <Nav />
      <Hero />
      <DoohTicker items={TICKER_ITEMS} />
      <About />
      <Experience />
      <Journey />

      <Projects />
      <Skills />
      <Contact />
      <DoohTicker items={TICKER_ITEMS} speed={55} />
      <Footer />
      <NoiseOverlay opacity={0.035} />
      <ScrollIndicator />
    </main>
  );
}
