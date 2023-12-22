import { useState } from 'react';

import { Button, Accordion, Modal } from 'react-bootstrap';
import { GetIcons } from './tacomail-components';


export function BuildEmailAccordion({ emailArray, onResultMutate }) {
  const [showEmailModel, setShowEmailModel] = useState(false);
  const [thisAlias, setThisAlias] = useState('');

  if (!Array.isArray(emailArray) || emailArray.length == 0) return (null);

  async function aliasOperation(action, aliasUuid) {
    const formData = new FormData();
    formData.append('action', action);
    formData.append('uuid', aliasUuid);

    const apiRequest = {
      method: 'POST',
      body: formData,
    };

    const fetchResults = await fetch('/api', apiRequest);
    const fetchResultsJson = await fetchResults.json();

    if (fetchResultsJson.length === 1) {
      // create a new result array, replacing the old alias information
      // with the results from the fetch
      const newResults = emailArray.map(alias => {
        if (alias.uuid == fetchResultsJson[0].uuid) return fetchResultsJson[0];
        else return alias;
      });

      onResultMutate(newResults);
    }
  }

  const handleClose = () => setShowEmailModel(false);
  const handleShow = (emailAddress) => {
    setThisAlias(emailAddress);
    setShowEmailModel(true);
  };

  return (
    <>
      <Accordion>
        { emailArray.map(alias =>
          <Accordion.Item eventKey={alias.uuid} key={alias.uuid}>
            <Accordion.Header>
              {alias.fullEmailAddress}
              <GetIcons ignoreFlag={alias.ignore} activeFlag={alias.active} newFlag={alias.new} />
            </Accordion.Header>
            <Accordion.Body>
              <p>Destination: {alias.destination}</p>
              { !alias.active || alias.ignore ? <Button variant='success' onClick={ () => aliasOperation('activate', alias.uuid) }>Activate</Button> : <Button variant='warning' onClick={ () => aliasOperation('deactivate', alias.uuid) }>Deactivate</Button> }{' '}
              { alias.active && alias.ignore ? <Button variant='warning' onClick={ () => aliasOperation('deactivate', alias.uuid) }>Deactivate</Button> : null }{' '}
              { alias.active && !alias.ignore ? <Button variant='secondary' onClick={ () => aliasOperation('ignore', alias.uuid) }>Ignore</Button> : null }{' '}
              <Button variant='info' onClick={ () => handleShow(alias.fullEmailAddress) }>Embiggen</Button>
            </Accordion.Body>
          </Accordion.Item>) }
      </Accordion>
      <Modal show={ showEmailModel } fullscreen={true} onHide={ handleClose }>
        <Modal.Header closeButton />
        <Modal.Body className='fs-1 text-break text-center'>{thisAlias}</Modal.Body>
      </Modal>
    </>
  );
}

export function BuildErrorAccordion({ errorObject }) {
  if (errorObject === null) return (null);

  return (
    <Accordion defaultActiveKey='0'>
      <Accordion.Item eventKey='0' key='0' className='border-danger'>
        <Accordion.Header>Error executing query</Accordion.Header>
        <Accordion.Body>
          <p>{ errorObject.message || errorObject.error }</p>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}