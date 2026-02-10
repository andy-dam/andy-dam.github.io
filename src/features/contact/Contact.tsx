import { Link } from "@/components/internal/Link";
import { BoxReveal } from "@/components/magicui/box-reveal";

export function Contact() {
  return (
    <div className="font-mono text-[#cdd6f4]">
      Reach me at&nbsp;
      <BoxReveal boxColor="#b4befe">
        <Link color="lavender" link="mailto:andy-dam@outlook.com">
          andy-dam@outlook.com
        </Link>
      </BoxReveal>
      &nbsp;or connect on&nbsp;
      <BoxReveal boxColor="#b4befe">
        <Link color="lavender" link="https://linkedin.com/in/andydam">
          LinkedIn
        </Link>
      </BoxReveal>
    </div>
  );
}
