import { useLayoutEffect } from 'react';

function useClickOutside({ active, elementRef, closeElement }) {
  useLayoutEffect(() => {
    if (active) {
      const handleClickOutside = (e) => {
        if (elementRef.current && !elementRef.current.contains(e.target)) {
          closeElement();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [active, closeElement, elementRef]);
}

export default useClickOutside;
