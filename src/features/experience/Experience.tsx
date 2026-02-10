import { BoxReveal } from "@/components/magicui/box-reveal";

interface Experience {
  company: string;
  position: string;
  date: string;
  description: string;
  boxColor: string;
  delay?: number;
}

export function Experience() {
  const experiences: Experience[] = [
    {
      company: "Paycom",
      position: "Software Development Intern",
      date: "May 2025 - Aug 2025",
      description:
        "Built a full-stack anonymous survey application to help the company take control of their own data instead of relying on external vendors. Used React.js and TypeScript on the frontend, .NET Core and MySQL on the backend. Working across the full stack from API design to user interface helped me understand the overall development process.",
      boxColor: "#a6e3a1",
      delay: 0.2,
    },
  ];

  return (
    <div className="flex flex-col flex-1 max-w-md gap-3">
      <h1 className="text-xl font-semibold text-[#cdd6f4]">Experience</h1>
      {experiences.map((exp, index) => (
        <div key={index}>
          <div className="mb-3">
            <BoxReveal boxColor={exp.boxColor} delay={exp.delay}>
              <div className="group/title">
                <h2 className="font-semibold tracking-wider text-[#cdd6f4]">
                  <span className="tracking-wider underline transition-all duration-200 decoration-green decoration-2 underline-offset-4 group-hover/title:decoration-3">
                    {exp.company}
                  </span>
                  <span className="mx-2 text-[#cdd6f4] font-normal">•</span>
                  <span className="font-normal text-[#cdd6f4]">
                    {exp.position}
                  </span>
                </h2>
              </div>
            </BoxReveal>
          </div>
          <p className="text-xs text-[#cdd6f4] mb-3">{exp.date}</p>
          <p className="font-mono text-[#cdd6f4]">{exp.description}</p>
        </div>
      ))}
    </div>
  );
}
