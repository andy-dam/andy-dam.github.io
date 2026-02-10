import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useEffect, useRef, useState } from "react";

export function GojoCatSticky() {
  const [stuck, setStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        setStuck(entry.isIntersecting);
      },
      { root: null, threshold: 0 },
    );
    const sentinel = sentinelRef.current;
    if (sentinel) {
      observer.observe(sentinel);
    }
    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, []);
  return (
    <>
      <div
        className={
          stuck
            ? "absolute right-0 bottom-0 pointer-events-none select-none"
            : "fixed right-0 bottom-0 pointer-events-none select-none z-20"
        }
        style={{ width: 500, height: 500 }}
      >
        <DotLottieReact
          src={`${import.meta.env.BASE_URL}animations/lottie/Neko Gojo Satoru.lottie`}
          autoplay
          loop={false}
          className="w-[500px] h-[500px] opacity-[0.12] dark:opacity-[0.08]"
        />
      </div>
      <div
        ref={sentinelRef}
        style={{
          position: "absolute",
          bottom: "52px",
          width: "100%",
          height: 1,
        }}
      />
    </>
  );
}
