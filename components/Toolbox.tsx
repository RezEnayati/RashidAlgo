'use client';

import React, { useState } from 'react';
import { GraphNode, GraphEdge } from '@/types/graph';

interface ToolboxProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onAddNode: (label: string) => void;
  onAddEdge: (source: string, target: string, weight: number) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  onSelectSource: (nodeId: string) => void;
  onRunDijkstra: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onReset: () => void;
  onPlayPause: () => void;
  onSpeedChange: (speed: number) => void;
  sourceNode: string | null;
  canRun: boolean;
  canStepForward: boolean;
  canStepBack: boolean;
  isRunning: boolean;
  isPlaying: boolean;
  speed: number;
  currentStepIndex: number;
  totalSteps: number;
}

export default function Toolbox({
  nodes,
  edges,
  onAddNode,
  onAddEdge,
  onDeleteNode,
  onDeleteEdge,
  onSelectSource,
  onRunDijkstra,
  onStepForward,
  onStepBack,
  onReset,
  onPlayPause,
  onSpeedChange,
  sourceNode,
  canRun,
  canStepForward,
  canStepBack,
  isRunning,
  isPlaying,
  speed,
  currentStepIndex,
  totalSteps,
}: ToolboxProps) {
  const [nodeLabel, setNodeLabel] = useState('');
  const [edgeSource, setEdgeSource] = useState('');
  const [edgeTarget, setEdgeTarget] = useState('');
  const [edgeWeight, setEdgeWeight] = useState('1');
  const [selectedSource, setSelectedSource] = useState('');
  const [nodeToDelete, setNodeToDelete] = useState('');
  const [edgeToDelete, setEdgeToDelete] = useState('');

  const handleAddNode = () => {
    if (nodeLabel.trim()) {
      onAddNode(nodeLabel.trim());
      setNodeLabel('');
    }
  };

  const handleAddEdge = () => {
    const weight = parseFloat(edgeWeight);
    if (edgeSource && edgeTarget && edgeSource !== edgeTarget && !isNaN(weight) && weight >= 0) {
      onAddEdge(edgeSource, edgeTarget, weight);
      setEdgeSource('');
      setEdgeTarget('');
      setEdgeWeight('1');
    }
  };

  const handleSelectSource = () => {
    if (selectedSource) {
      onSelectSource(selectedSource);
    }
  };

  const handleDeleteNode = () => {
    if (nodeToDelete) {
      onDeleteNode(nodeToDelete);
      setNodeToDelete('');
    }
  };

  const handleDeleteEdge = () => {
    if (edgeToDelete) {
      onDeleteEdge(edgeToDelete);
      setEdgeToDelete('');
    }
  };

  const getEdgeLabel = (edge: GraphEdge) => {
    const fromNode = nodes.find(n => n.id === edge.source);
    const toNode = nodes.find(n => n.id === edge.target);
    return `${fromNode?.data.label || '?'} → ${toNode?.data.label || '?'} (${edge.weight})`;
  };

  const inputClass = "flex-1 px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const selectClass = "flex-1 px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500";
  const primaryButton = "px-3 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors";
  const secondaryButton = "flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-slate-700 text-white hover:bg-slate-600 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors";
  const dangerButton = "px-3 py-2 text-sm font-medium rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors";
  const successButton = "w-full px-3 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors";

  return (
    <div className="w-72 bg-slate-800 border-r border-slate-700 flex flex-col h-full overflow-y-auto">
      {/* Add Node Section */}
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
          <button
            onClick={handleAddNode}
            disabled={!nodeLabel.trim()}
            className={primaryButton}
          >
            Add
          </button>
        </div>
      </div>

      {/* Add Edge Section */}
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Add Edge</h3>
        <div className="space-y-2">
          <div className="flex gap-2">
            <select
              value={edgeSource}
              onChange={(e) => setEdgeSource(e.target.value)}
              className={selectClass}
            >
              <option value="">From...</option>
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.data.label}
                </option>
              ))}
            </select>
            <select
              value={edgeTarget}
              onChange={(e) => setEdgeTarget(e.target.value)}
              className={selectClass}
            >
              <option value="">To...</option>
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.data.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1">Weight</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={edgeWeight}
                onChange={(e) => setEdgeWeight(e.target.value)}
                className={inputClass + " w-full"}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddEdge}
                disabled={!edgeSource || !edgeTarget || edgeSource === edgeTarget || parseFloat(edgeWeight) < 0}
                className={primaryButton}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Section */}
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Delete</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <select
              value={nodeToDelete}
              onChange={(e) => setNodeToDelete(e.target.value)}
              className={selectClass}
            >
              <option value="">Node...</option>
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.data.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleDeleteNode}
              disabled={!nodeToDelete}
              className={dangerButton}
            >
              Delete
            </button>
          </div>
          <div className="flex gap-2">
            <select
              value={edgeToDelete}
              onChange={(e) => setEdgeToDelete(e.target.value)}
              className={selectClass}
            >
              <option value="">Edge...</option>
              {edges.map((edge) => (
                <option key={edge.id} value={edge.id}>
                  {getEdgeLabel(edge)}
                </option>
              ))}
            </select>
            <button
              onClick={handleDeleteEdge}
              disabled={!edgeToDelete}
              className={dangerButton}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Select Source Section */}
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Source Node</h3>
        <div className="flex gap-2">
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className={selectClass}
          >
            <option value="">Select source...</option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.data.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleSelectSource}
            disabled={!selectedSource}
            className={primaryButton}
          >
            Set
          </button>
        </div>
        {sourceNode && (
          <p className="text-xs text-green-400 mt-2">
            Source: {nodes.find(n => n.id === sourceNode)?.data.label}
          </p>
        )}
      </div>

      {/* Algorithm Controls */}
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Run Algorithm</h3>
        <button
          onClick={onRunDijkstra}
          disabled={!canRun}
          className={successButton}
        >
          Run Dijkstra
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
            Step {currentStepIndex + 1} of {totalSteps}
          </p>
        )}

        {/* Auto-play button */}
        {isRunning && (
          <button
            onClick={onPlayPause}
            disabled={currentStepIndex >= totalSteps - 1}
            className={`w-full mb-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              isPlaying
                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed`}
          >
            {isPlaying ? 'Pause' : 'Auto Play'}
          </button>
        )}

        {/* Speed control */}
        {isRunning && (
          <div className="mb-3">
            <label className="block text-xs text-slate-500 mb-1">
              Speed: {speed}ms
            </label>
            <input
              type="range"
              min="100"
              max="1000"
              step="100"
              value={speed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
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
            onClick={onStepBack}
            disabled={!canStepBack || isPlaying}
            className={secondaryButton}
          >
            Back
          </button>
          <button
            onClick={onStepForward}
            disabled={!canStepForward || isPlaying}
            className={secondaryButton}
          >
            Next
          </button>
        </div>
      </div>

      {/* Reset */}
      <div className="p-4 border-b border-slate-700">
        <button onClick={onReset} className={dangerButton + " w-full"}>
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
  );
}
