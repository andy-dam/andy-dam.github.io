interface IntroProps {
  className?: string;
}

export function Intro({ className }: IntroProps) {
  return (
    <p className={className ? `${className} text-[#cdd6f4]` : "text-[#cdd6f4]"}>
      <span className="font-bold tracking-wider font-newsreader">
        Bridging the gap between vision and execution.
      </span>
      <span className="font-mono">
        &nbsp;Computer Science senior student at UT Dallas, specialized in
        full-stack development, machine learning, and building scalable software
        solutions.
      </span>
    </p>
  );
}
