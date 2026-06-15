'use client';

import { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  onCreate?: (name: string) => Promise<Option | null>;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select...',
  onCreate,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [extraOptions, setExtraOptions] = useState<Option[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
    setSearch('');
  };

  const remove = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((v) => v !== value));
  };

  const handleCreate = async () => {
    if (!onCreate || !search.trim() || creating) return;
    setCreating(true);
    const newOption = await onCreate(search.trim());
    setCreating(false);
    if (newOption !== null) {
      setExtraOptions((prev) => [...prev, newOption]);
      onChange([...selected, newOption.value]);
      setSearch('');
    }
  };

  const allOptions = [...options, ...extraOptions];
  const lowerSearch = search.toLowerCase();
  const filtered = allOptions.filter((o) => o.label.toLowerCase().includes(lowerSearch));
  const selectedOptions = allOptions.filter((o) => selected.includes(o.value));
  const filteredSelected = filtered.filter((o) => selected.includes(o.value));
  const filteredUnselected = filtered.filter((o) => !selected.includes(o.value));

  const exactMatch = allOptions.some((o) => o.label.toLowerCase() === lowerSearch);
  const showCreate = !!onCreate && search.trim().length > 0 && !exactMatch;

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => setOpen((o) => !o)}
        className="min-h-[38px] border rounded px-2 py-1.5 flex flex-wrap gap-1.5 cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 bg-white"
      >
        {selectedOptions.length === 0 && (
          <span className="text-sm text-gray-400 self-center">{placeholder}</span>
        )}
        {selectedOptions.map((opt) => (
          <span
            key={opt.value}
            className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full"
          >
            {opt.label}
            <button
              type="button"
              onClick={(e) => remove(opt.value, e)}
              className="hover:text-blue-600 leading-none"
            >
              ×
            </button>
          </span>
        ))}
        <span className="ml-auto self-center text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-md">
          <div className="p-2 border-b">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Search..."
              className="w-full text-sm px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="max-h-48 overflow-y-auto">
            {filteredSelected.map((opt) => (
              <div
                key={opt.value}
                onClick={() => toggle(opt.value)}
                className="flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
              >
                <span>{opt.label}</span>
                <span className="text-blue-600 font-medium text-xs">✓</span>
              </div>
            ))}
            {filteredSelected.length > 0 && filteredUnselected.length > 0 && (
              <div className="border-t my-0.5" />
            )}
            {filteredUnselected.map((opt) => (
              <div
                key={opt.value}
                onClick={() => toggle(opt.value)}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 text-gray-700"
              >
                {opt.label}
              </div>
            ))}
            {filtered.length === 0 && !showCreate && (
              <p className="px-3 py-2 text-sm text-gray-400">No options</p>
            )}
            {showCreate && (
              <>
                {filtered.length > 0 && <div className="border-t my-0.5" />}
                <div
                  onClick={handleCreate}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 text-blue-700 font-medium"
                >
                  {creating ? 'Creating...' : `Create "${search.trim()}"`}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
