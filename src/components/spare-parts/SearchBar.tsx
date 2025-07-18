import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  allPlants: string[];
  plant: string;
  onPlantChange: (plant: string) => void;
}

export default function SearchBar({ value, onChange, allPlants, plant, onPlantChange }: SearchBarProps) {
  return (
    <div className="flex gap-4 items-center">
      <input
        type="text"
        placeholder="Search by name or code..."
        className="border rounded px-3 py-2 w-64"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <div className="flex gap-2 items-center">
        <label>Filter by Plant:</label>
        <select value={plant} onChange={e => onPlantChange(e.target.value)} className="border rounded px-2 py-1">
          <option value="">All</option>
          {allPlants.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
    </div>
  );
} 