import { BlurFade } from "@/components/magicui/blur-fade";

import { CircuitDots } from "@/components/internal/CircuitDots";

import { Header } from "@/features/header";
import { Intro } from "@/features/intro";
import { Skills } from "@/features/skills";
import { Projects } from "@/features/projects";
import { Experience } from "@/features/experience";
import { Now } from "@/features/now";
import { Contact } from "@/features/contact";
import { Footer } from "@/features/footer";

function App() {
  return (
    <div className="relative flex flex-col w-full min-h-screen overflow-x-hidden">
      {/* The rim of the glass bends what is behind it. CSS cannot displace
          pixels, so the bending is an SVG map: smoothed noise, read as a
          direction and a distance per pixel. */}
      <svg width="0" height="0" aria-hidden="true" className="absolute">
        <filter id="glass-lens" colorInterpolationFilters="sRGB">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.005 0.011"
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation="1.6" result="smooth" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="smooth"
            scale="14"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      <CircuitDots spacing={30} className="z-0 opacity-70 dark:opacity-50" />
      <main className="relative z-10 flex flex-col flex-1 text-zinc-700 dark:text-neutral-300">
        <article className="container relative max-w-3xl px-4 mx-auto mt-10 mb-10 sm:px-6 sm:mt-28 sm:mb-28">
          <div className="glass relative overflow-hidden rounded-[28px] px-10 py-10 sm:px-16 sm:py-14">
          <div className="mb-12">
            <BlurFade delay={0} direction="up" blur="3px">
              <Header className="mb-6" />
            </BlurFade>
            <BlurFade delay={0.15} direction="up" blur="3px">
              <Intro />
            </BlurFade>
          </div>
          <div className="flex flex-col items-center w-full gap-8 mb-12 md:flex-row-reverse md:items-center">
            <BlurFade delay={0.3} direction="up" blur="3px">
              <Skills />
            </BlurFade>
            <BlurFade delay={0.45} direction="up" blur="3px">
              <Projects />
            </BlurFade>
          </div>
          <div className="mb-12">
            <BlurFade delay={0.6} direction="up" blur="3px">
              <Experience />
            </BlurFade>
          </div>
          <div className="mb-12">
            <BlurFade delay={0.75} direction="up" blur="3px">
              <h1 className="mb-3 text-xl font-semibold text-[#cdd6f4]">Now</h1>
            </BlurFade>
            <BlurFade delay={0.9} direction="up" blur="3px">
              <Now />
            </BlurFade>
          </div>
          <div>
            <BlurFade delay={1.05} direction="up" blur="3px">
              <h1 className="mb-3 text-xl font-semibold text-[#cdd6f4]">
                Connect
              </h1>
            </BlurFade>
            <BlurFade delay={1.2} direction="up" blur="3px">
              <Contact />
            </BlurFade>
          </div>
          </div>
        </article>
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
export default App;
