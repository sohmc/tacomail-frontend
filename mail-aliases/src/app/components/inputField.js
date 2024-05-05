import Form from 'react-bootstrap/Form';

export function QueryInputField({ fieldName, defaultValue, className = '' }) {
  return (
    <>
      <Form.Control type="text" name={fieldName} defaultValue={defaultValue} className={className} required="" />
      <Form.Control.Feedback type="invalid">
        Please provide input in this field.
      </Form.Control.Feedback>
    </>
  );
}