'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import GraphEditor from '@/components/GraphEditor';
import Toolbox from '@/components/Toolbox';
import ResultsDisplay from '@/components/ResultsDisplay';
import TimeComplexityCalculator from '@/components/TimeComplexityCalculator';
import { GraphNode, GraphEdge, AlgorithmStep } from '@/types/graph';
import { dijkstra } from '@/lib/dijkstra';

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

export default function DijkstraVisualizerPage() {
  const [nodes, setNodes] = useState<GraphNode[]>(initialNodes);
  const [edges, setEdges] = useState<GraphEdge[]>(initialEdges);
  const [sourceNode, setSourceNode] = useState<string | null>(null);

  // Algorithm state
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(500);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stepsRef = useRef<AlgorithmStep[]>([]);

  // Keep stepsRef in sync with steps
  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);

  const currentStep = currentStepIndex >= 0 && currentStepIndex < steps.length
    ? steps[currentStepIndex]
    : null;

  // Auto-play effect
  useEffect(() => {
    if (isPlaying && isRunning) {
      intervalRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          const currentStepsLength = stepsRef.current.length;
          if (prev >= currentStepsLength - 1) {
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
        intervalRef.current = null;
      }
    };
  }, [isPlaying, isRunning, speed]);

  const handleNodesChange = useCallback((newNodes: GraphNode[]) => {
    setNodes(newNodes);
  }, []);

  // Add node with label - position is auto-calculated
  const handleAddNode = useCallback((label: string) => {
    // Calculate position based on existing nodes
    const baseX = 100 + (nodes.length % 5) * 120;
    const baseY = 100 + Math.floor(nodes.length / 5) * 150;

    const newNode: GraphNode = {
      id: `node-${Date.now()}`,
      position: { x: baseX, y: baseY },
      data: { label },
    };
    setNodes((prev) => [...prev, newNode]);
  }, [nodes.length]);

  // Add edge between two nodes
  const handleAddEdge = useCallback((source: string, target: string, weight: number) => {
    // Check if edge already exists
    const exists = edges.some(
      (e) => (e.source === source && e.target === target) ||
             (e.source === target && e.target === source)
    );
    if (exists) {
      setError('Edge already exists between these nodes');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const newEdge: GraphEdge = {
      id: `edge-${Date.now()}`,
      source,
      target,
      weight,
    };
    setEdges((prev) => [...prev, newEdge]);
  }, [edges]);

  const handleSelectSource = useCallback((nodeId: string) => {
    setSourceNode(nodeId);
    // Reset algorithm state when source changes
    setSteps([]);
    setCurrentStepIndex(-1);
    setIsRunning(false);
    setIsPlaying(false);
  }, []);

  // Delete a node and its connected edges
  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId));
    // Clear source if deleted
    if (sourceNode === nodeId) {
      setSourceNode(null);
    }
    // Reset algorithm state
    setSteps([]);
    setCurrentStepIndex(-1);
    setIsRunning(false);
    setIsPlaying(false);
  }, [sourceNode]);

  // Delete an edge
  const handleDeleteEdge = useCallback((edgeId: string) => {
    setEdges((prev) => prev.filter((e) => e.id !== edgeId));
    // Reset algorithm state
    setSteps([]);
    setCurrentStepIndex(-1);
    setIsRunning(false);
    setIsPlaying(false);
  }, []);

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

  const handleRunDijkstra = useCallback(() => {
    if (!sourceNode) {
      setError('Please select a source node first.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setError(null);
      const result = dijkstra(nodes, edges, sourceNode);
      setSteps(result.steps);
      setCurrentStepIndex(0);
      setIsRunning(true);
      setIsPlaying(false);
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

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
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
  }, []);

  return (
    <div className="h-[calc(100vh-73px)] flex bg-slate-900">
      <Toolbox
        nodes={nodes}
        edges={edges}
        onAddNode={handleAddNode}
        onAddEdge={handleAddEdge}
        onDeleteNode={handleDeleteNode}
        onDeleteEdge={handleDeleteEdge}
        onSelectSource={handleSelectSource}
        onRunDijkstra={handleRunDijkstra}
        onStepForward={handleStepForward}
        onStepBack={handleStepBack}
        onReset={handleReset}
        onPlayPause={handlePlayPause}
        onSpeedChange={handleSpeedChange}
        sourceNode={sourceNode}
        canRun={!!sourceNode && nodes.length > 0}
        canStepForward={isRunning && currentStepIndex < steps.length - 1}
        canStepBack={isRunning && currentStepIndex > 0}
        isRunning={isRunning}
        isPlaying={isPlaying}
        speed={speed}
        currentStepIndex={currentStepIndex}
        totalSteps={steps.length}
      />
      <div className="flex-1 flex flex-col">
        {error && (
          <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 p-4">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        {currentStep && (
          <div className="bg-slate-800 border-l-4 border-blue-500 text-slate-300 p-4">
            <p className="font-medium text-sm">
              Step {currentStepIndex + 1}: Processing node &quot;
              {nodes.find((n) => n.id === currentStep.currentNode)?.data.label ||
                currentStep.currentNode}
              &quot;
            </p>
            {currentStep.distanceUpdates.length > 0 && (
              <p className="text-sm mt-1 text-slate-400">
                Distance updates:{' '}
                {currentStep.distanceUpdates
                  .map((u) => {
                    const label =
                      nodes.find((n) => n.id === u.node)?.data.label || u.node;
                    return `${label}: ${u.newDistance}`;
                  })
                  .join(', ')}
              </p>
            )}
          </div>
        )}
        <div className="flex-1" style={{ minHeight: '400px' }}>
          <GraphEditor
            nodes={nodes}
            edges={edges}
            sourceNode={sourceNode}
            currentStep={currentStep}
            onNodesChange={handleNodesChange}
            onEdgeWeightChange={handleEdgeWeightChange}
          />
        </div>
        {/* Bottom Section - Results and Time Complexity */}
        <div className="h-64 p-4 bg-slate-800 border-t border-slate-700">
          <div className="grid grid-cols-2 gap-4 h-full">
            <TimeComplexityCalculator
              nodeCount={nodes.length}
              edgeCount={edges.length}
              currentStepIndex={currentStepIndex}
              totalSteps={steps.length}
              isRunning={isRunning}
            />
            <ResultsDisplay
              nodes={nodes}
              finalStep={steps.length > 0 ? steps[steps.length - 1] : null}
              sourceNode={sourceNode}
              isComplete={isRunning && currentStepIndex === steps.length - 1}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
