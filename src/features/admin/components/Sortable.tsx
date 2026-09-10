import type { ReactNode } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type Modifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Alto del navbar fijo (`--spacing-nav`, con caída a 72px). */
function navHeight(): number {
  if (typeof document === 'undefined') return 72;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--spacing-nav')
    .trim();
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return 72;
  return raw.endsWith('rem') ? n * 16 : n;
}

/**
 * Impide arrastrar un ítem fuera de la ventana (ni por encima del navbar, ni
 * por debajo del borde inferior). Evita llevarlo "hasta el infinito".
 */
const restrictToViewport: Modifier = ({
  transform,
  draggingNodeRect,
  windowRect,
}) => {
  if (!draggingNodeRect || !windowRect) return transform;
  const top = navHeight();
  return {
    ...transform,
    x: Math.min(
      Math.max(transform.x, -draggingNodeRect.left),
      windowRect.width - draggingNodeRect.right
    ),
    y: Math.min(
      Math.max(transform.y, top - draggingNodeRect.top),
      windowRect.height - draggingNodeRect.bottom
    ),
  };
};

/** Lista reordenable (ratón + teclado). `ids` deben ser strings estables. */
export function SortableList({
  ids,
  onReorder,
  layout = 'list',
  children,
}: {
  ids: string[];
  onReorder: (nextIds: string[]) => void;
  /** `grid` usa colocación por rectángulos (tarjetas); `list`, vertical. */
  layout?: 'list' | 'grid';
  children: ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    onReorder(arrayMove(ids, from, to));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToViewport]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={ids}
        strategy={
          layout === 'grid' ? rectSortingStrategy : verticalListSortingStrategy
        }
      >
        {children}
      </SortableContext>
    </DndContext>
  );
}

/**
 * Fila reordenable: incluye el tirador; `children` es el contenido de la fila.
 *
 * `handle="outside"`: en pantallas ≥sm el tirador flota en el margen izquierdo
 * (posición absoluta) para que el contenido ocupe TODO el ancho, igual que las
 * tarjetas de encima. En móvil el tirador va en línea a la izquierda.
 */
export function SortableRow({
  id,
  handle = 'inline',
  children,
}: {
  id: string;
  handle?: 'inline' | 'outside';
  children: ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  if (handle === 'outside') {
    return (
      <li
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        className={cn(
          'relative flex items-start gap-2 sm:block',
          isDragging && 'z-10 opacity-70'
        )}
      >
        <button
          type="button"
          aria-label="Reordenar"
          className="shrink-0 cursor-grab touch-none rounded-md p-1 text-cream-mute transition-colors hover:text-cream active:cursor-grabbing sm:absolute sm:-left-8 sm:top-3 sm:z-10"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} aria-hidden="true" />
        </button>
        <div className="min-w-0 flex-1 sm:flex-none">{children}</div>
      </li>
    );
  }

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-2',
        isDragging && 'relative z-10 opacity-70'
      )}
    >
      <button
        type="button"
        aria-label="Reordenar"
        className="shrink-0 cursor-grab touch-none rounded-md p-1 text-cream-mute transition-colors hover:text-cream active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} aria-hidden="true" />
      </button>
      {children}
    </li>
  );
}

/**
 * Celda reordenable para una rejilla de tarjetas: el tirador flota en una
 * esquina (`handleClassName` decide cuál); el resto de la tarjeta queda libre
 * para sus propios botones.
 */
export function SortableCard({
  id,
  handleClassName = 'right-2 top-2',
  children,
}: {
  id: string;
  handleClassName?: string;
  children: ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('relative h-full', isDragging && 'z-10 opacity-70')}
    >
      <button
        type="button"
        aria-label="Reordenar"
        className={cn(
          'absolute z-10 grid h-8 w-8 cursor-grab touch-none place-items-center rounded-lg border border-hair bg-bg/80 text-cream-mute backdrop-blur transition-colors hover:text-cream active:cursor-grabbing',
          handleClassName
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={15} aria-hidden="true" />
      </button>
      {children}
    </li>
  );
}
