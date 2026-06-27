"use client";
import { ResponsiveContainer, Treemap, Tooltip } from "recharts";

const COLORS = [
  "#0B3954",
  "#155A7C",
  "#1B9AAA",
  "#2A9D8F",
  "#57B8AD",
  "#85CEC6",
  "#B4E1DC",
  "#D6EEEB",
];

function Node(props: any) {
  const { x, y, width, height, index, name, share } = props;
  if (width <= 0 || height <= 0) return null;
  const fill =
    name === "Other countries" ? "#94A3AD" : COLORS[index % COLORS.length];
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        stroke="#fff"
        strokeWidth={2}
        rx={3}
      />
      {width > 56 && height > 30 && (
        <>
          <text x={x + 7} y={y + 18} fill="#fff" fontSize={12} fontWeight={700}>
            {name}
          </text>
          {typeof share === "number" && (
            <text x={x + 7} y={y + 34} fill="#ffffffcc" fontSize={11}>
              {share}%
            </text>
          )}
        </>
      )}
    </g>
  );
}

export default function ProdTreemap({
  production,
}: {
  production: { country: string; value: number; share: number }[];
}) {
  const data = production.map((p) => ({
    name: p.country,
    size: p.value,
    share: p.share,
  }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <Treemap
        data={data}
        dataKey="size"
        aspectRatio={4 / 3}
        stroke="#fff"
        content={<Node />}
        isAnimationActive
      >
        <Tooltip
          formatter={(v: any, _n: any, p: any) => [
            `${Number(v).toLocaleString()} t`,
            p?.payload?.name ?? "",
          ]}
        />
      </Treemap>
    </ResponsiveContainer>
  );
}
