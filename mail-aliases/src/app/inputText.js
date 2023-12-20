import Form from 'react-bootstrap/Form';

export function QueryInputField({ defaultValue }) {
  function handleKeystrokes() {
    const queryText = document.getElementById('query').value;
    if (queryText.toLowerCase().startsWith('new:')) {
      console.log('caught keystroke -- ' + queryText);
    }
  }

  return (
    <Form.Control
      type="text"
      id="query"
      defaultValue={defaultValue}
      onKeyUp={handleKeystrokes}
    />
  );
}