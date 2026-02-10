import { BoxReveal } from "@/components/magicui/box-reveal";

import { Link } from "@/components/internal/Link";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header
      className={
        "flex items-center justify-between" + (className ? " " + className : "")
      }
    >
      <div className="flex items-center gap-2 group">
        <h1 className="text-xl font-semibold text-[#cdd6f4]">
          <BoxReveal boxColor="#b4befe" delay={0.025}>
            <Link color="lavender" link="https://github.com/andy-dam">
              Andy Dam
            </Link>
          </BoxReveal>
        </h1>
      </div>
    </header>
  );
}
