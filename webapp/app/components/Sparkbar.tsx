"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import { band } from "./constants";

const LAB: Record<string, string> = {
  geology: "Geology",
  distance: "Distance",
  structure: "Structure",
  ndvi: "NDVI",
  responsible: "Responsible",
};

export default function Sparkbar({ scores }: { scores: Record<string, number> }) {
  const data = Object.entries(scores).map(([k, v]) => ({
    name: LAB[k] || k,
    value: v,
    color: band(v),
  }));
  return (
    <ResponsiveContainer width="100%" height={data.length * 38 + 10}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ left: 6, right: 34, top: 4, bottom: 4 }}
      >
        <XAxis type="number" domain={[0, 1]} hide />
        <YAxis
          type="category"
          dataKey="name"
          width={78}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "#334155" }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            formatter={(v: number) => `${+v}`}
            style={{ fontSize: 11, fontWeight: 700, fill: "#334155" }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
