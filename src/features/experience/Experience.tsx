import { ArrowUpRight } from "lucide-react";

import { BoxReveal } from "@/components/magicui/box-reveal";

interface Experience {
  company: string;
  position: string;
  date: string;
  description: string;
  boxColor: string;
  delay?: number;
  link?: string;
}

export function Experience() {
  const experiences: Experience[] = [
    {
      company: "Visa",
      position: "Software Engineer Intern",
      date: "May 2026 - Aug 2026",
      description:
        "Built a regression-triage dashboard for QA and release engineers, with a React and Vite frontend and a Node.js and Express backend. Added a two-stage LLM pipeline that reads test reports and explains why a run failed, replacing a manual hunt through Jenkins and Artifactory.",
      boxColor: "#f9e2af",
      delay: 0.1,
      link: "https://www.linkedin.com/feed/update/urn:li:activity:7492625863134404609/",
    },
    {
      company: "Cavall Labs",
      position: "Software Engineer Intern",
      date: "Jan 2026 - May 2026",
      description:
        "Built the FastAPI backend behind an AI-driven chemistry platform, with GPU work on background workers and PostgreSQL as the job queue.",
      boxColor: "#94e2d5",
      delay: 0.2,
      link: "https://www.cavall.ai/",
    },
    {
      company: "Paycom",
      position: "Software Development Intern",
      date: "May 2025 - Aug 2025",
      description:
        "Built a full-stack anonymous survey application that brought employee feedback in-house in place of an outside vendor, with a React and TypeScript frontend and a .NET Core and MySQL backend.",
      boxColor: "#a6e3a1",
      delay: 0.2,
      link: "https://www.linkedin.com/feed/update/urn:li:activity:7363669322348584960/",
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
                  {exp.link ? (
                    <a
                      href={exp.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tracking-wider underline transition-all duration-200 decoration-2 underline-offset-4 group-hover/title:decoration-[3px]"
                      style={{ textDecorationColor: exp.boxColor }}
                    >
                      {exp.company}
                      <ArrowUpRight
                        size={18}
                        className="inline-block ml-0.5 align-text-top no-underline"
                        style={{ color: exp.boxColor }}
                      />
                    </a>
                  ) : (
                    <span
                      className="tracking-wider underline transition-all duration-200 decoration-2 underline-offset-4 group-hover/title:decoration-[3px]"
                      style={{ textDecorationColor: exp.boxColor }}
                    >
                      {exp.company}
                    </span>
                  )}
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
