import { useEffect } from 'react';

// browsers may not show unless page has been interacted with
// most new browsers don't show custom messages
function useCloseTabWarning(unsavedChange) {
  useEffect(() => {
    if (unsavedChange) {
      const message = 'are you sure you want to quit?';
      window.onbeforeunload = () => message;

      return () => {
        window.onbeforeunload = null;
      };
    }
  }, [unsavedChange]);
}

export default useCloseTabWarning;
