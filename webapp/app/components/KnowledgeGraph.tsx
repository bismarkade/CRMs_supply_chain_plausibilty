"use client";
import "reactflow/dist/style.css";
import ReactFlow, {
  Background,
  Handle,
  Position,
  type Node,
  type Edge,
} from "reactflow";
import { TIER_COLORS } from "./constants";

const TIER_NAME: Record<number, string> = {
  [-1]: "ORIGIN",
  0: "MINING",
  1: "PROCESSING",
  2: "MANUFACTURING",
};

function TierNode({ data }: { data: any }) {
  return (
    <div
      className="w-[170px] rounded-lg border-2 bg-white px-3 py-2 text-center shadow-sm"
      style={{ borderColor: data.color }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <div className="text-[10px] font-bold" style={{ color: data.color }}>
        {data.tierName}
      </div>
      <div className="text-sm font-semibold text-ink">{data.label}</div>
      {data.sub && (
        <div className="text-[10px] text-slate-500">{data.sub}</div>
      )}
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  );
}
const nodeTypes = { tier: TierNode };

export default function KnowledgeGraph({
  nodes,
  edges,
}: {
  nodes: { id: string; label: string; tier: number; kind: string; sub: string }[];
  edges: { source: string; target: string; kind: string }[];
}) {
  const rfNodes: Node[] = nodes.map((n) => ({
    id: n.id,
    type: "tier",
    position: { x: (n.tier + 1) * 220, y: 60 },
    data: {
      label: n.label,
      sub: n.sub,
      tierName: TIER_NAME[n.tier] ?? n.kind.toUpperCase(),
      color:
        n.tier === -1 ? "#59A14F" : TIER_COLORS[n.kind] || "#1B9AAA",
    },
    draggable: false,
  }));
  const rfEdges: Edge[] = edges.map((e, i) => ({
    id: `e${i}`,
    source: e.source,
    target: e.target,
    type: "smoothstep",
    animated: e.kind === "material_flow",
    style: { stroke: "#1B9AAA", strokeWidth: 2 },
  }));
  return (
    <div className="h-[240px] w-full rounded-xl border border-slate-200 bg-slate-50">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        panOnDrag
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#dbe3e8" gap={18} />
      </ReactFlow>
    </div>
  );
}
