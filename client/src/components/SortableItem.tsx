import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ReactNode } from 'react';

interface SortableItemProps {
  id: string;
  children: ReactNode;
  dragHandle?: boolean; // 是否只在拖拽手柄上啟用拖拽
}

export const SortableItem = ({ id, children, dragHandle = false }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // 如果 dragHandle 為 true，不在整個項目上應用 listeners
  if (dragHandle) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className="relative"
      >
        {children}
      </div>
    );
  }

  // 默認行為：整個項目可拖拽
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-move"
    >
      {children}
    </div>
  );
};
