import { createFileRoute } from "@tanstack/react-router";
import { AppProvider } from "@/hooks/use-theme";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";
import { Nav } from "@/components/cv/Nav";
import { Hero } from "@/components/cv/Hero";
import { About } from "@/components/cv/About";
import { Experience } from "@/components/cv/Experience";
import { Projects } from "@/components/cv/Projects";
import { Skills } from "@/components/cv/Skills";
import { Contact } from "@/components/cv/Contact";
import { Footer } from "@/components/cv/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Your Name — Product Designer & Engineer" },
      { name: "description", content: "Personal portfolio and CV — design, engineering and product." },
      { property: "og:title", content: "Your Name — Product Designer & Engineer" },
      { property: "og:description", content: "Personal portfolio and CV — design, engineering and product." },
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

function Page() {
  useSmoothScroll();
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Skills />
      <Contact />
      <Footer />
    </main>
  );
}
