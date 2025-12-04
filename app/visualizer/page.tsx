'use client';

import Link from 'next/link';
import { useState } from 'react';

const algorithms = [
  {
    id: 'dijkstra',
    name: "Dijkstra's Algorithm",
    category: 'Graph',
    description: 'Find the shortest path between nodes in a weighted graph.',
    complexity: {
      time: 'O((V + E) log V)',
      space: 'O(V)',
    },
  },
  {
    id: 'bellman-ford',
    name: 'Bellman-Ford Algorithm',
    category: 'Graph',
    description: 'Find shortest paths from a source node. Handles negative weights and detects negative cycles.',
    complexity: {
      time: 'O(V * E)',
      space: 'O(V)',
    },
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'Searching',
    description: 'Efficiently find a target value in a sorted array by repeatedly dividing the search space in half.',
    complexity: {
      time: 'O(log n)',
      space: 'O(1)',
    },
  },
  {
    id: 'quicksort',
    name: 'QuickSort',
    category: 'Sorting',
    description: 'Divide-and-conquer sorting algorithm that picks a pivot and partitions the array around it.',
    complexity: {
      time: 'O(n log n)',
      space: 'O(log n)',
    },
  },
  {
    id: 'bubblesort',
    name: 'Bubble Sort',
    category: 'Sorting',
    description: 'Simple sorting algorithm that repeatedly steps through the list, comparing adjacent elements and swapping them if needed.',
    complexity: {
      time: 'O(n²)',
      space: 'O(1)',
    },
  },
];

export default function VisualizerPage() {
  const [search, setSearch] = useState('');

  const filteredAlgorithms = algorithms.filter((algo) => {
    const searchLower = search.toLowerCase();
    return (
      algo.name.toLowerCase().includes(searchLower) ||
      algo.category.toLowerCase().includes(searchLower) ||
      algo.description.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-[calc(100vh-73px)] bg-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-white mb-3">Algorithms</h1>
          <p className="text-slate-500">
            Select an algorithm to visualize its execution step by step.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search algorithms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {search && (
            <p className="text-sm text-slate-500 mt-2">
              {filteredAlgorithms.length} result{filteredAlgorithms.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        <div className="space-y-4">
          {filteredAlgorithms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No algorithms found matching "{search}"</p>
            </div>
          ) : (
            filteredAlgorithms.map((algo) => (
            <Link
              key={algo.id}
              href={`/visualizer/${algo.id}`}
              className="group block bg-white/[0.03] rounded-xl p-6 border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-lg font-medium text-white">
                      {algo.name}
                    </h2>
                    <span className="text-xs px-2 py-1 bg-slate-800 text-slate-400 rounded">
                      {algo.category}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm mb-4">
                    {algo.description}
                  </p>
                  <div className="flex gap-6 text-xs text-slate-600">
                    <span>
                      Time: <span className="text-slate-400 font-mono">{algo.complexity.time}</span>
                    </span>
                    <span>
                      Space: <span className="text-slate-400 font-mono">{algo.complexity.space}</span>
                    </span>
                  </div>
                </div>
                <span className="text-slate-500 group-hover:text-white transition-colors">
                  →
                </span>
              </div>
            </Link>
          )))}
        </div>
      </div>
    </div>
  );
}
