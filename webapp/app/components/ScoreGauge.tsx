"use client";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { band } from "./constants";

export default function ScoreGauge({
  value,
  verdict,
  size = 160,
}: {
  value: number;
  verdict: string;
  size?: number;
}) {
  const color = band(value);
  const data = [{ name: "score", value: value * 100, fill: color }];
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <RadialBarChart
        width={size}
        height={size}
        cx="50%"
        cy="50%"
        innerRadius="72%"
        outerRadius="100%"
        barSize={14}
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
        <RadialBar background dataKey="value" cornerRadius={8} />
      </RadialBarChart>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-2xl font-extrabold" style={{ color }}>
            {value}
          </div>
          <div className="text-xs font-bold" style={{ color }}>
            {verdict}
          </div>
        </div>
      </div>
    </div>
  );
}
