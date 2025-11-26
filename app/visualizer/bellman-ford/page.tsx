'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import GraphEditor from '@/components/GraphEditor';
import { GraphNode, GraphEdge } from '@/types/graph';
import { bellmanFord, BellmanFordStep } from '@/lib/bellmanFord';

// Initial sample graph
const initialNodes: GraphNode[] = [
  { id: 'node-1', position: { x: 100, y: 100 }, data: { label: 'A' } },
  { id: 'node-2', position: { x: 300, y: 100 }, data: { label: 'B' } },
  { id: 'node-3', position: { x: 500, y: 100 }, data: { label: 'C' } },
  { id: 'node-4', position: { x: 200, y: 300 }, data: { label: 'D' } },
  { id: 'node-5', position: { x: 400, y: 300 }, data: { label: 'E' } },
];

const initialEdges: GraphEdge[] = [
  { id: 'edge-1', source: 'node-1', target: 'node-2', weight: 4 },
  { id: 'edge-2', source: 'node-1', target: 'node-4', weight: 2 },
  { id: 'edge-3', source: 'node-2', target: 'node-3', weight: 3 },
  { id: 'edge-4', source: 'node-2', target: 'node-5', weight: 1 },
  { id: 'edge-5', source: 'node-4', target: 'node-5', weight: 5 },
  { id: 'edge-6', source: 'node-5', target: 'node-3', weight: 2 },
];

// Convert BellmanFordStep to the format GraphEditor expects
function convertToAlgorithmStep(step: BellmanFordStep) {
  return {
    currentNode: step.currentNode,
    visited: step.visited,
    distanceUpdates: step.distanceUpdates,
    relaxedEdges: step.relaxedEdges,
    distances: step.distances,
    predecessors: step.predecessors,
  };
}

export default function BellmanFordVisualizerPage() {
  const [nodes, setNodes] = useState<GraphNode[]>(initialNodes);
  const [edges, setEdges] = useState<GraphEdge[]>(initialEdges);
  const [sourceNode, setSourceNode] = useState<string | null>(null);

  // Algorithm state
  const [steps, setSteps] = useState<BellmanFordStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(500);
  const [error, setError] = useState<string | null>(null);
  const [hasNegativeCycle, setHasNegativeCycle] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Form state
  const [nodeLabel, setNodeLabel] = useState('');
  const [edgeSource, setEdgeSource] = useState('');
  const [edgeTarget, setEdgeTarget] = useState('');
  const [edgeWeight, setEdgeWeight] = useState('1');
  const [selectedSource, setSelectedSource] = useState('');
  const [nodeToDelete, setNodeToDelete] = useState('');
  const [edgeToDelete, setEdgeToDelete] = useState('');

  const currentStep = currentStepIndex >= 0 && currentStepIndex < steps.length
    ? steps[currentStepIndex]
    : null;

  // Auto-play effect
  useEffect(() => {
    if (isPlaying && isRunning) {
      intervalRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, isRunning, speed, steps.length]);

  const handleNodesChange = useCallback((newNodes: GraphNode[]) => {
    setNodes(newNodes);
  }, []);

  const handleAddNode = useCallback(() => {
    if (!nodeLabel.trim()) return;
    const baseX = 100 + (nodes.length % 5) * 120;
    const baseY = 100 + Math.floor(nodes.length / 5) * 150;

    const newNode: GraphNode = {
      id: `node-${Date.now()}`,
      position: { x: baseX, y: baseY },
      data: { label: nodeLabel.trim() },
    };
    setNodes((prev) => [...prev, newNode]);
    setNodeLabel('');
  }, [nodeLabel, nodes.length]);

  const handleAddEdge = useCallback(() => {
    const weight = parseFloat(edgeWeight);
    if (!edgeSource || !edgeTarget || edgeSource === edgeTarget || isNaN(weight)) return;

    const exists = edges.some(
      (e) => (e.source === edgeSource && e.target === edgeTarget) ||
             (e.source === edgeTarget && e.target === edgeSource)
    );
    if (exists) {
      setError('Edge already exists between these nodes');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const newEdge: GraphEdge = {
      id: `edge-${Date.now()}`,
      source: edgeSource,
      target: edgeTarget,
      weight,
    };
    setEdges((prev) => [...prev, newEdge]);
    setEdgeSource('');
    setEdgeTarget('');
    setEdgeWeight('1');
  }, [edgeSource, edgeTarget, edgeWeight, edges]);

  const handleSelectSource = useCallback(() => {
    if (selectedSource) {
      setSourceNode(selectedSource);
      setSteps([]);
      setCurrentStepIndex(-1);
      setIsRunning(false);
      setIsPlaying(false);
    }
  }, [selectedSource]);

  const handleDeleteNode = useCallback(() => {
    if (!nodeToDelete) return;
    setNodes((prev) => prev.filter((n) => n.id !== nodeToDelete));
    setEdges((prev) => prev.filter((e) => e.source !== nodeToDelete && e.target !== nodeToDelete));
    if (sourceNode === nodeToDelete) {
      setSourceNode(null);
    }
    setSteps([]);
    setCurrentStepIndex(-1);
    setIsRunning(false);
    setIsPlaying(false);
    setNodeToDelete('');
  }, [nodeToDelete, sourceNode]);

  const handleDeleteEdge = useCallback(() => {
    if (!edgeToDelete) return;
    setEdges((prev) => prev.filter((e) => e.id !== edgeToDelete));
    setSteps([]);
    setCurrentStepIndex(-1);
    setIsRunning(false);
    setIsPlaying(false);
    setEdgeToDelete('');
  }, [edgeToDelete]);

  // Update edge weight
  const handleEdgeWeightChange = useCallback((edgeId: string, newWeight: number) => {
    setEdges((prev) =>
      prev.map((e) => (e.id === edgeId ? { ...e, weight: newWeight } : e))
    );
    // Reset algorithm state when edge weight changes
    setSteps([]);
    setCurrentStepIndex(-1);
    setIsRunning(false);
    setIsPlaying(false);
  }, []);

  const handleRunBellmanFord = useCallback(() => {
    if (!sourceNode) {
      setError('Please select a source node first.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setError(null);
      const result = bellmanFord(nodes, edges, sourceNode);
      setSteps(result.steps);
      setCurrentStepIndex(0);
      setIsRunning(true);
      setIsPlaying(false);
      setHasNegativeCycle(result.hasNegativeCycle);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [nodes, edges, sourceNode]);

  const handleStepForward = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  }, [currentStepIndex, steps.length]);

  const handleStepBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }, [currentStepIndex]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleReset = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setSourceNode(null);
    setSteps([]);
    setCurrentStepIndex(-1);
    setIsRunning(false);
    setIsPlaying(false);
    setError(null);
    setHasNegativeCycle(false);
  }, []);

  const getEdgeLabel = (edge: GraphEdge) => {
    const fromNode = nodes.find(n => n.id === edge.source);
    const toNode = nodes.find(n => n.id === edge.target);
    return `${fromNode?.data.label || '?'} - ${toNode?.data.label || '?'} (${edge.weight})`;
  };

  const inputClass = "flex-1 px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const selectClass = "flex-1 px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500";
  const primaryButton = "px-3 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors";
  const dangerButton = "px-3 py-2 text-sm font-medium rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors";

  // Get final distances for results display
  const finalStep = steps.length > 0 ? steps[steps.length - 1] : null;

  return (
    <div className="h-[calc(100vh-73px)] flex bg-slate-900">
      {/* Sidebar */}
      <div className="w-72 bg-slate-800 border-r border-slate-700 flex flex-col h-full overflow-y-auto">
        {/* Add Node */}
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Add Node</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={nodeLabel}
              onChange={(e) => setNodeLabel(e.target.value)}
              placeholder="Label (e.g., F)"
              className={inputClass}
              onKeyDown={(e) => e.key === 'Enter' && handleAddNode()}
            />
            <button onClick={handleAddNode} disabled={!nodeLabel.trim()} className={primaryButton}>
              Add
            </button>
          </div>
        </div>

        {/* Add Edge */}
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Add Edge</h3>
          <div className="space-y-2">
            <div className="flex gap-2">
              <select value={edgeSource} onChange={(e) => setEdgeSource(e.target.value)} className={selectClass}>
                <option value="">From...</option>
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>{node.data.label}</option>
                ))}
              </select>
              <select value={edgeTarget} onChange={(e) => setEdgeTarget(e.target.value)} className={selectClass}>
                <option value="">To...</option>
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>{node.data.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-slate-500 mb-1">Weight (can be negative)</label>
                <input
                  type="number"
                  step="0.1"
                  value={edgeWeight}
                  onChange={(e) => setEdgeWeight(e.target.value)}
                  className={inputClass + " w-full"}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAddEdge}
                  disabled={!edgeSource || !edgeTarget || edgeSource === edgeTarget}
                  className={primaryButton}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Delete */}
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Delete</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <select value={nodeToDelete} onChange={(e) => setNodeToDelete(e.target.value)} className={selectClass}>
                <option value="">Node...</option>
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>{node.data.label}</option>
                ))}
              </select>
              <button onClick={handleDeleteNode} disabled={!nodeToDelete} className={dangerButton}>
                Delete
              </button>
            </div>
            <div className="flex gap-2">
              <select value={edgeToDelete} onChange={(e) => setEdgeToDelete(e.target.value)} className={selectClass}>
                <option value="">Edge...</option>
                {edges.map((edge) => (
                  <option key={edge.id} value={edge.id}>{getEdgeLabel(edge)}</option>
                ))}
              </select>
              <button onClick={handleDeleteEdge} disabled={!edgeToDelete} className={dangerButton}>
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Source Node */}
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Source Node</h3>
          <div className="flex gap-2">
            <select value={selectedSource} onChange={(e) => setSelectedSource(e.target.value)} className={selectClass}>
              <option value="">Select source...</option>
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>{node.data.label}</option>
              ))}
            </select>
            <button onClick={handleSelectSource} disabled={!selectedSource} className={primaryButton}>
              Set
            </button>
          </div>
          {sourceNode && (
            <p className="text-xs text-green-400 mt-2">
              Source: {nodes.find(n => n.id === sourceNode)?.data.label}
            </p>
          )}
        </div>

        {/* Run Algorithm */}
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Run Algorithm</h3>
          <button
            onClick={handleRunBellmanFord}
            disabled={!sourceNode || nodes.length === 0}
            className="w-full px-3 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            Run Bellman-Ford
          </button>
          {!sourceNode && (
            <p className="text-xs text-slate-500 mt-2">Select a source node first</p>
          )}
        </div>

        {/* Playback Controls */}
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Playback</h3>
          {isRunning && (
            <p className="text-sm text-slate-400 mb-3">
              Step {currentStepIndex + 1} of {steps.length}
            </p>
          )}

          {isRunning && (
            <button
              onClick={handlePlayPause}
              disabled={currentStepIndex >= steps.length - 1}
              className={`w-full mb-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isPlaying
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed`}
            >
              {isPlaying ? 'Pause' : 'Auto Play'}
            </button>
          )}

          {isRunning && (
            <div className="mb-3">
              <label className="block text-xs text-slate-500 mb-1">Speed: {speed}ms</label>
              <input
                type="range"
                min="100"
                max="1000"
                step="100"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Fast</span>
                <span>Slow</span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleStepBack}
              disabled={!isRunning || currentStepIndex <= 0 || isPlaying}
              className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-slate-700 text-white hover:bg-slate-600 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleStepForward}
              disabled={!isRunning || currentStepIndex >= steps.length - 1 || isPlaying}
              className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-slate-700 text-white hover:bg-slate-600 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>

        {/* Reset */}
        <div className="p-4 border-b border-slate-700">
          <button onClick={handleReset} className={dangerButton + " w-full"}>
            Reset Graph
          </button>
        </div>

        {/* Legend */}
        <div className="p-4 mt-auto">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Legend</h3>
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-400"></div>
              <span className="text-slate-400">Source Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
              <span className="text-slate-400">Current Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-400"></div>
              <span className="text-slate-400">Visited Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 bg-yellow-500 rounded"></div>
              <span className="text-slate-400">Relaxed Edge</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {error && (
          <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 p-4">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        {currentStep && (
          <div className="bg-slate-800 border-l-4 border-blue-500 text-slate-300 p-4">
            <p className="font-medium text-sm">{currentStep.description}</p>
          </div>
        )}
        <div className="flex-1" style={{ minHeight: '400px' }}>
          <GraphEditor
            nodes={nodes}
            edges={edges}
            sourceNode={sourceNode}
            currentStep={currentStep ? convertToAlgorithmStep(currentStep) : null}
            onNodesChange={handleNodesChange}
            onEdgeWeightChange={handleEdgeWeightChange}
          />
        </div>

        {/* Bottom Section */}
        <div className="h-64 p-4 bg-slate-800 border-t border-slate-700">
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Complexity */}
            <div className="bg-slate-900 rounded-lg p-4 overflow-auto">
              <h3 className="text-sm font-medium text-slate-300 mb-3">Complexity</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Time</span>
                  <span className="text-blue-400 font-mono">O(V * E)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Space</span>
                  <span className="text-slate-400 font-mono">O(V)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Nodes (V)</span>
                  <span className="text-slate-400">{nodes.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Edges (E)</span>
                  <span className="text-slate-400">{edges.length}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <p className="text-xs text-slate-500">
                    Unlike Dijkstra, Bellman-Ford can handle negative edge weights and detect negative cycles.
                  </p>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="bg-slate-900 rounded-lg p-4 overflow-auto">
              <h3 className="text-sm font-medium text-slate-300 mb-3">Results</h3>
              {!isRunning ? (
                <p className="text-sm text-slate-500">Run the algorithm to see results.</p>
              ) : hasNegativeCycle ? (
                <p className="text-sm text-red-400">Negative cycle detected! Shortest paths are undefined.</p>
              ) : finalStep ? (
                <div className="space-y-1">
                  {nodes.map((node) => {
                    const distance = finalStep.distances.get(node.id);
                    const isSource = node.id === sourceNode;
                    return (
                      <div key={node.id} className="flex justify-between text-sm">
                        <span className={`${isSource ? 'text-blue-400' : 'text-slate-400'}`}>
                          {node.data.label}
                          {isSource && ' (source)'}
                        </span>
                        <span className="text-white font-mono">
                          {distance === Infinity ? '∞' : distance}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
