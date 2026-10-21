"use client";
import { useDroppable } from "@dnd-kit/core";

export function DroppableField({
  id,
  label,
  value,
  headers,
  onSelect,
  onClear
}: {
  id: string;
  label: string;
  value?: string;
  headers: string[];
  onSelect: (column: string) => void;
  onClear: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `field:${id}`,
    data: { field: id }
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border-2 p-3 transition ${
        isOver
          ? "border-brand-500 bg-brand-50"
          : value
          ? "border-emerald-300 bg-emerald-50"
          : "border-dashed border-slate-300 bg-slate-50"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{label}</div>
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-slate-500 hover:text-red-600"
          >
            حذف
          </button>
        )}
      </div>

      {value ? (
        <div className="mt-2">
          <div className="rounded bg-white px-2 py-1 font-mono text-xs inline-block">
            {value}
          </div>
        </div>
      ) : (
        <div className="mt-2 text-xs text-slate-400">ستون را اینجا بکش یا از لیست انتخاب کن</div>
      )}

      <select
        className="input mt-2 text-xs"
        value={value || ""}
        onChange={e => {
          if (e.target.value) onSelect(e.target.value);
          else onClear();
        }}
      >
        <option value="">— انتخاب از لیست —</option>
        {headers.map(h => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
    </div>
  );
}