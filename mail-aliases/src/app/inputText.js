import Form from 'react-bootstrap/Form';

export function QueryInputField({ defaultValue, className = '' }) {
  return (
    <Form.Control type="text" name="query" defaultValue={defaultValue} className={className}/>
  );
}