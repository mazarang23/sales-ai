"use client";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export function DraggableColumn({
  id,
  used
}: {
  id: string;
  used: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `col:${id}`,
    data: { column: id }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`rounded-lg border px-3 py-1.5 text-xs cursor-grab active:cursor-grabbing transition ${
        used
          ? "bg-slate-100 text-slate-400 border-slate-200"
          : "bg-white border-slate-300 hover:border-brand-400 hover:bg-brand-50"
      }`}
    >
      {id}
      {used && " ✓"}
    </div>
  );
}