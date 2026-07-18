"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

export type HeroSlideData = {
  id: string;
  image: string;
  heading: string | null;
  subheading: string | null;
  ctaText: string | null;
  ctaHref: string | null;
};

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD = 50;

export function HeroSlider({ slides }: { slides: HeroSlideData[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const prevRef = useRef(0);
  const swipeStartX = useRef<number | null>(null);
  const parallax = useRef<{
    x?: (v: number) => void;
    y?: (v: number) => void;
  }>({});
  const count = slides.length;

  // Slide transition: crossfade + Ken Burns (zoom & drift) + masked word
  // reveal for the heading, fade-up for subheading/CTA.
  useGSAP(
    () => {
      const root = containerRef.current;
      if (!root) return;

      const slideEls = Array.from(
        root.querySelectorAll<HTMLElement>("[data-hero-slide]"),
      );
      const incoming = slideEls[active];
      const outgoing =
        prevRef.current !== active ? slideEls[prevRef.current] : null;
      prevRef.current = active;
      if (!incoming) return;

      const image = incoming.querySelector<HTMLElement>("[data-hero-image]");
      const words = incoming.querySelectorAll<HTMLElement>("[data-hero-word]");
      const texts = incoming.querySelectorAll<HTMLElement>("[data-hero-text]");

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        if (outgoing) gsap.set(outgoing, { autoAlpha: 0 });
        gsap.set(incoming, { autoAlpha: 1 });
        if (image) gsap.set(image, { scale: 1, xPercent: 0 });
        gsap.set(words, { yPercent: 0 });
        gsap.set(texts, { opacity: 1, y: 0 });
        return;
      }

      const tl = gsap.timeline();
      tl.fromTo(
        incoming,
        { autoAlpha: outgoing ? 0 : 1 },
        { autoAlpha: 1, duration: 1, ease: "power2.out", overwrite: "auto" },
        0,
      );
      if (outgoing) {
        tl.to(
          outgoing,
          { autoAlpha: 0, duration: 1, ease: "power2.out", overwrite: "auto" },
          0,
        );
      }
      // Ken Burns: start zoomed & slightly off-centre, settle over the
      // slide's full lifetime. Direction alternates per slide.
      if (image) {
        tl.fromTo(
          image,
          { scale: 1.12, xPercent: active % 2 === 0 ? -1.5 : 1.5 },
          {
            scale: 1,
            xPercent: 0,
            duration: (AUTOPLAY_MS + 1200) / 1000,
            ease: "power1.out",
          },
          0,
        );
      }
      // Heading words rise out of an overflow mask, one by one.
      if (words.length) {
        tl.fromTo(
          words,
          { yPercent: 115 },
          {
            yPercent: 0,
            duration: 0.85,
            ease: "power4.out",
            stagger: 0.07,
          },
          0.25,
        );
      }
      if (texts.length) {
        tl.fromTo(
          texts,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.12,
          },
          words.length ? 0.55 : 0.3,
        );
      }
    },
    { scope: containerRef, dependencies: [active] },
  );

  // Mouse parallax (desktop only): the slide stack drifts a few px against
  // the cursor. quickTo gives cheap, smoothed tweening per mousemove.
  useGSAP(
    () => {
      if (!stackRef.current) return;
      if (!window.matchMedia("(pointer: fine)").matches) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      parallax.current = {
        x: gsap.quickTo(stackRef.current, "x", {
          duration: 0.6,
          ease: "power3.out",
        }),
        y: gsap.quickTo(stackRef.current, "y", {
          duration: 0.6,
          ease: "power3.out",
        }),
      };
    },
    { scope: containerRef },
  );

  // Autoplay driven by the progress-pill tween: when the fill completes,
  // advance. Hover/touch pauses both.
  useEffect(() => {
    if (count < 2 || !progressRef.current) return;
    const tween = gsap.fromTo(
      progressRef.current,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: AUTOPLAY_MS / 1000,
        ease: "none",
        onComplete: () => setActive((i) => (i + 1) % count),
      },
    );
    if (paused) tween.pause();
    return () => {
      tween.kill();
    };
  }, [active, paused, count]);

  if (count === 0) return null;

  const goTo = (i: number) => setActive(((i % count) + count) % count);

  const handleMouseMove = (e: React.MouseEvent) => {
    const root = containerRef.current;
    if (!root || !parallax.current.x || !parallax.current.y) return;
    const rect = root.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    parallax.current.x(relX * -16);
    parallax.current.y(relY * -10);
  };

  const handleMouseLeave = () => {
    setPaused(false);
    parallax.current.x?.(0);
    parallax.current.y?.(0);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") {
      swipeStartX.current = e.clientX;
      setPaused(true);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerType === "touch" && swipeStartX.current !== null) {
      const dx = e.clientX - swipeStartX.current;
      swipeStartX.current = null;
      setPaused(false);
      if (dx > SWIPE_THRESHOLD) goTo(active - 1);
      else if (dx < -SWIPE_THRESHOLD) goTo(active + 1);
    }
  };

  return (
    <section
      ref={containerRef}
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className="relative h-[56vw] max-h-[640px] min-h-[340px] w-full touch-pan-y overflow-hidden bg-forest"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        swipeStartX.current = null;
        setPaused(false);
      }}
    >
      <div ref={stackRef} className="absolute inset-0 will-change-transform">
        {slides.map((slide, i) => {
          const hasText = Boolean(slide.heading || slide.subheading);
          return (
            <div
              key={slide.id}
              data-hero-slide
              aria-hidden={i !== active}
              className={cn(
                "absolute inset-0",
                i === active ? "z-10" : "pointer-events-none z-0",
              )}
              style={{ opacity: i === 0 ? 1 : 0 }}
            >
              <div
                data-hero-image
                className="absolute -inset-1 will-change-transform"
              >
                <Image
                  src={slide.image}
                  alt={slide.heading ?? "Ladies Forest"}
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  // object-left: banner artwork anchors its text on the left,
                  // so crop from the right when the viewport is narrower.
                  className="object-cover object-left"
                />
              </div>
              {/* Lighter wash when the banner artwork carries its own text */}
              <div
                className={cn(
                  "absolute inset-0",
                  hasText
                    ? "bg-gradient-to-t from-black/60 via-black/30 to-black/10"
                    : "bg-gradient-to-t from-black/35 via-transparent to-transparent",
                )}
              />
              <div
                className={cn(
                  "absolute inset-0 flex",
                  hasText ? "items-center" : "items-end",
                )}
              >
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div
                    className={cn(
                      "max-w-xl text-white",
                      !hasText && "pb-14 md:pb-16",
                    )}
                  >
                    {slide.heading && (
                      <h2 className="font-heading text-4xl leading-tight md:text-6xl">
                        {slide.heading.split(" ").map((word, wi) => (
                          <span
                            key={wi}
                            className="inline-block overflow-hidden pb-1 align-bottom"
                          >
                            <span
                              data-hero-word
                              className="inline-block will-change-transform"
                            >
                              {word}
                              {wi < slide.heading!.split(" ").length - 1
                                ? " "
                                : ""}
                            </span>
                          </span>
                        ))}
                      </h2>
                    )}
                    {slide.subheading && (
                      <p
                        data-hero-text
                        className="mt-4 text-sm text-white/85 md:text-base"
                      >
                        {slide.subheading}
                      </p>
                    )}
                    {slide.ctaText && slide.ctaHref && (
                      <div data-hero-text className={cn(hasText && "mt-7")}>
                        <Button
                          size="lg"
                          className="px-7 shadow-lg transition-transform duration-200 hover:scale-[1.04] active:scale-95"
                          render={<Link href={slide.ctaHref} />}
                        >
                          {slide.ctaText}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => goTo(active - 1)}
            className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/15 p-2 text-white backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-white/35 active:scale-95 md:flex"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => goTo(active + 1)}
            className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/15 p-2 text-white backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-white/35 active:scale-95 md:flex"
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === active}
                onClick={() => goTo(i)}
                className={cn(
                  "relative h-2 overflow-hidden rounded-full transition-all duration-300",
                  i === active
                    ? "w-8 bg-white/30"
                    : "w-2 bg-white/50 hover:bg-white/75",
                )}
              >
                {i === active && (
                  <span
                    ref={progressRef}
                    className="absolute inset-0 origin-left scale-x-0 rounded-full bg-white"
                  />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
