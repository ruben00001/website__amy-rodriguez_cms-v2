import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';

function SortableDndContext({ children, items, updateData, setUnsavedChange }) {
  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragReorder(event) {
    const { active, over } = event;

    if (active.id !== over.id) {
      updateData((items) => {
        const oldIndex = items.map((item) => item.id).indexOf(active.id);
        const newIndex = items.map((item) => item.id).indexOf(over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
      setUnsavedChange(true);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragReorder}
      autoScroll={false}
      modifiers={[restrictToParentElement]}
    >
      <SortableContext items={items} strategy={rectSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

export default SortableDndContext;
