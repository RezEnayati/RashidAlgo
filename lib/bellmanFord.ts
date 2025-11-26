// Bellman-Ford Algorithm Implementation
// Handles negative weights and detects negative cycles

import {
  GraphNode,
  GraphEdge,
  AlgorithmStep,
  DijkstraResult,
  DistanceUpdate,
  RelaxedEdge,
} from '@/types/graph';

export interface BellmanFordStep {
  iteration: number;
  currentNode: string;
  currentEdge: { from: string; to: string } | null;
  visited: Set<string>;
  distanceUpdates: DistanceUpdate[];
  relaxedEdges: RelaxedEdge[];
  distances: Map<string, number>;
  predecessors: Map<string, string | null>;
  description: string;
}

export interface BellmanFordResult {
  distances: Map<string, number>;
  predecessors: Map<string, string | null>;
  steps: BellmanFordStep[];
  hasNegativeCycle: boolean;
}

// Main Bellman-Ford Algorithm
export function bellmanFord(
  nodes: GraphNode[],
  edges: GraphEdge[],
  sourceId: string
): BellmanFordResult {
  // Validate source node exists
  const sourceExists = nodes.some((node) => node.id === sourceId);
  if (!sourceExists) {
    throw new Error(`Source node ${sourceId} does not exist in the graph.`);
  }

  const distances = new Map<string, number>();
  const predecessors = new Map<string, string | null>();
  const steps: BellmanFordStep[] = [];
  const visited = new Set<string>();

  // Initialize distances to infinity and predecessors to null
  nodes.forEach((node) => {
    distances.set(node.id, node.id === sourceId ? 0 : Infinity);
    predecessors.set(node.id, null);
  });

  visited.add(sourceId);

  // Record initial step
  steps.push({
    iteration: 0,
    currentNode: sourceId,
    currentEdge: null,
    visited: new Set(visited),
    distanceUpdates: [{ node: sourceId, newDistance: 0 }],
    relaxedEdges: [],
    distances: new Map(distances),
    predecessors: new Map(predecessors),
    description: `Initialize: Set distance to source "${nodes.find(n => n.id === sourceId)?.data.label}" as 0, all others as infinity.`,
  });

  // Create edge list for both directions (undirected graph)
  const allEdges: { source: string; target: string; weight: number }[] = [];
  edges.forEach((edge) => {
    allEdges.push({ source: edge.source, target: edge.target, weight: edge.weight });
    allEdges.push({ source: edge.target, target: edge.source, weight: edge.weight });
  });

  // Relax all edges V-1 times
  const V = nodes.length;

  for (let i = 1; i < V; i++) {
    let anyUpdate = false;

    for (const edge of allEdges) {
      const { source, target, weight } = edge;
      const sourceDistance = distances.get(source) || Infinity;
      const targetDistance = distances.get(target) || Infinity;

      if (sourceDistance !== Infinity && sourceDistance + weight < targetDistance) {
        // Update distance
        distances.set(target, sourceDistance + weight);
        predecessors.set(target, source);
        visited.add(target);
        anyUpdate = true;

        const sourceLabel = nodes.find(n => n.id === source)?.data.label || source;
        const targetLabel = nodes.find(n => n.id === target)?.data.label || target;

        // Record this step
        steps.push({
          iteration: i,
          currentNode: target,
          currentEdge: { from: source, to: target },
          visited: new Set(visited),
          distanceUpdates: [{ node: target, newDistance: sourceDistance + weight }],
          relaxedEdges: [{ from: source, to: target, weight }],
          distances: new Map(distances),
          predecessors: new Map(predecessors),
          description: `Iteration ${i}: Relax edge ${sourceLabel} -> ${targetLabel}. New distance to ${targetLabel}: ${sourceDistance + weight}`,
        });
      }
    }

    // Early termination if no updates in this iteration
    if (!anyUpdate) {
      steps.push({
        iteration: i,
        currentNode: '',
        currentEdge: null,
        visited: new Set(visited),
        distanceUpdates: [],
        relaxedEdges: [],
        distances: new Map(distances),
        predecessors: new Map(predecessors),
        description: `Iteration ${i}: No updates. Algorithm can terminate early.`,
      });
      break;
    }
  }

  // Check for negative cycles
  let hasNegativeCycle = false;
  for (const edge of allEdges) {
    const { source, target, weight } = edge;
    const sourceDistance = distances.get(source) || Infinity;
    const targetDistance = distances.get(target) || Infinity;

    if (sourceDistance !== Infinity && sourceDistance + weight < targetDistance) {
      hasNegativeCycle = true;
      break;
    }
  }

  if (hasNegativeCycle) {
    steps.push({
      iteration: V,
      currentNode: '',
      currentEdge: null,
      visited: new Set(visited),
      distanceUpdates: [],
      relaxedEdges: [],
      distances: new Map(distances),
      predecessors: new Map(predecessors),
      description: 'Negative cycle detected! Shortest paths are undefined.',
    });
  } else {
    steps.push({
      iteration: V,
      currentNode: '',
      currentEdge: null,
      visited: new Set(visited),
      distanceUpdates: [],
      relaxedEdges: [],
      distances: new Map(distances),
      predecessors: new Map(predecessors),
      description: 'Algorithm complete. All shortest paths found.',
    });
  }

  return {
    distances,
    predecessors,
    steps,
    hasNegativeCycle,
  };
}

// Helper to get shortest path from source to target
export function getShortestPath(
  predecessors: Map<string, string | null>,
  targetId: string
): string[] {
  const path: string[] = [];
  let current: string | null = targetId;

  while (current !== null) {
    path.unshift(current);
    current = predecessors.get(current) || null;
  }

  return path;
}
