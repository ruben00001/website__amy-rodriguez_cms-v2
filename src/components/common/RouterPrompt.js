import { Prompt } from 'react-router-dom';

function RouterPrompt({ unsavedChange }) {
  return (
    <Prompt
      when={unsavedChange}
      message="Are you sure you wish to proceed? Any unsaved changes will be lost"
    />
  );
}

export default RouterPrompt;
