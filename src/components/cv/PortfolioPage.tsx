import { AppProvider } from "@/hooks/use-theme";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";
import { ProfileDataProvider } from "@/lib/profile-data";
import type { PrivateProfileData } from "@/lib/profile.server";
import { Nav } from "./Nav";
import { Hero } from "./Hero";
import { About } from "./About";
import { Experience } from "./Experience";
import { Journey } from "./Journey";
import { Projects } from "./Projects";
import { Skills } from "./Skills";
import { Contact } from "./Contact";
import { Footer } from "./Footer";
import { NoiseOverlay } from "./NoiseOverlay";
import { ScrollIndicator } from "./ScrollIndicator";
import { CityBokeh } from "./CityBokeh";
import { DoohTicker } from "./DoohTicker";

const TICKER_ITEMS = [
  "PROFILE · DIGITAL CV",
  "EXPERIENCE · PROJECTS",
  "SKILLS · JOURNEY",
  "PRIVATE · SHAREABLE",
  "ES · EN",
  "AURA PERSONA",
];

export function PortfolioPage({ data }: { data: PrivateProfileData }) {
  return (
    <AppProvider>
      <ProfileDataProvider data={data}>
        <Page />
      </ProfileDataProvider>
    </AppProvider>
  );
}

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
