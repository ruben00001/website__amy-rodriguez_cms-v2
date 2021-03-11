/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { Children, cloneElement, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableElement({ children, element }) {
  const [hovered, setHovered] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

  const sortableStyle = css({
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab',
  });

  return (
    <div
      css={[
        sortableStyle,
        hovered && { zIndex: 100 },
        isDragging && { zIndex: 100, cursor: 'grabbing' },
      ]}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
    >
      {Children.map(children, (child) => {
        if (children.length > 1) {
          throw new Error(
            `SortableElement is currently set up to work with 1 child.`
          );
        }
        return cloneElement(child, {
          ...child.props,
          hovered,
          isDragging,
        });
      })}
    </div>
  );
}

export default SortableElement;
