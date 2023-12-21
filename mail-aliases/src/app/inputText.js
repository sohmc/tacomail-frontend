import Form from 'react-bootstrap/Form';

export function QueryInputField({ fieldName, defaultValue, className = '' }) {
  return (
    <Form.Control type="text" name={fieldName} defaultValue={defaultValue} className={className}/>
  );
}