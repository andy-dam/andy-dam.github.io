import { OrbitingCircles } from "@/components/magicui/orbiting-circles";

const logos = [
  { name: "tailwindcss", scale: 1.0 }, // Tailwind CSS
  { name: "node", scale: 1.0 }, // Node.js
  { name: "numpy", scale: 1.0 }, // Conda
  { name: "docker", scale: 0.9 }, // Docker
  { name: "git", scale: 0.9 }, // Git
  { name: "github", scale: 0.9 }, // GitHub
  { name: "visualstudiocode", scale: 0.95 }, // VS Code
  { name: "postgres", scale: 1.1 }, // SQL
  { name: "pandas", scale: 1.0 }, // pandas
  { name: "linux", scale: 1.2 }, // UNIX/Linux
  { name: "spark", scale: 1.1 }, // Spark
  { name: "bash", scale: 1.2 }, // Bash
  { name: "next", scale: 1 }, // Next.js
  { name: "pytorch", scale: 1.0 }, // PyTorch
  { name: "java", scale: 1.15 }, // Java
  { name: "python", scale: 1.0 }, // Python
  { name: "typescript", scale: 0.9 }, // TypeScript
  { name: "csharp", scale: 1.0 }, // C#
  { name: "react", scale: 1.0 }, // React.js
  { name: "fastapi", scale: 1.0 }, // FastAPI
];

export function Skills() {
  const outerCount = Math.ceil(logos.length * 0.65); // 65% of logos in outer circle
  const outer = logos.slice(0, outerCount);
  const inner = logos.slice(outerCount);

  return (
    <div>
      <div className="relative flex h-[300px] w-[300px] flex-col items-center justify-center overflow-hidden">
        <OrbitingCircles iconSize={34} radius={120} speed={0.5}>
          {outer.map(({ name, scale = 1.0 }) => (
            <img
              key={name}
              src={`${import.meta.env.BASE_URL}svg/logos/${name}.svg`}
              alt={name}
              width={100 * scale}
              height={100 * scale}
              style={{ objectFit: "contain", transform: `scale(${scale})` }}
            />
          ))}
        </OrbitingCircles>
        <OrbitingCircles iconSize={34} radius={60} reverse speed={0.4}>
          {inner.map(({ name, scale = 1.0 }) => (
            <img
              key={name}
              src={`${import.meta.env.BASE_URL}svg/logos/${name}.svg`}
              alt={name}
              width={100 * scale}
              height={100 * scale}
              style={{ objectFit: "contain", transform: `scale(${scale})` }}
            />
          ))}
        </OrbitingCircles>
      </div>
    </div>
  );
}
