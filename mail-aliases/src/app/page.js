'use client';

import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Accordion from 'react-bootstrap/Accordion';
import Modal from 'react-bootstrap/Modal';
import { useState } from 'react';

import { GetIcons } from './tacomail-components';
import mailAliasesStyle from '../stylesheets/mail-aliases.module.css';


export default function OpenPage() {
  const [query, _setQuery] = useState('');
  // const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const [showEmailModel, setShowEmailModel] = useState(false);
  const [thisAlias, setThisAlias] = useState('');

  async function sendQuery(q) {
    q.preventDefault();

    const formData = new FormData(q.target);
    const formJson = Object.fromEntries(formData.entries());

    console.log('formJson: ' + JSON.stringify(formJson));

    const apiRequest = {
      method: 'POST',
      body: formData,
    };

    if (Object.prototype.hasOwnProperty.call(formJson, 'query') && formJson.query.length > 0) {
      const fetchResults = await fetch('/api', apiRequest);

      const fetchResultsJson = await fetchResults.json();
      setResults(fetchResultsJson);
    }
  }

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
      const newResults = results.map(alias => {
        if (alias.uuid == fetchResultsJson[0].uuid) return fetchResultsJson[0];
        else return alias;
      });

      setResults(newResults);
    }
  }

  const handleClose = () => setShowEmailModel(false);
  const handleShow = (emailAddress) => {
    setThisAlias(emailAddress);
    setShowEmailModel(true);
  };

  let aliasList = '';
  if (results) {
    const accordionList = results.map(alias =>
      <Accordion.Item eventKey={alias.uuid} key={alias.uuid}>
        <Accordion.Header>
          {alias.fullEmailAddress}
          <GetIcons ignoreFlag={alias.ignore} activeFlag={alias.active} newFlag={alias.new} />
        </Accordion.Header>
        <Accordion.Body>
          <p>Destination: {alias.destination}</p>
          { !alias.active || alias.ignore ? <Button variant='success' onClick={ () => aliasOperation('activate', alias.uuid) }>Activate</Button> : null }{' '}
          { alias.active || !alias.ignore ? <Button variant='warning' onClick={ () => aliasOperation('deactivate', alias.uuid) }>Deactivate</Button> : null }{' '}
          { alias.active && !alias.ignore ? <Button variant='secondary' onClick={ () => aliasOperation('ignore', alias.uuid) }>Ignore</Button> : null }{' '}
          <Button variant='info' onClick={ () => handleShow(alias.fullEmailAddress) }>Embiggen</Button>
        </Accordion.Body>
      </Accordion.Item>,
    );

    aliasList = <Accordion>{accordionList}</Accordion>;
    if (results[0].new) {
      console.log('Setting defaultActiveKey: ' + results[0].uuid);
      aliasList = <Accordion defaultActiveKey={results[0].uuid}>{accordionList}</Accordion>;
    }
  }

  return (
    <div className={mailAliasesStyle.mainContainer}>
      <h1 className={mailAliasesStyle.textCenter}>mikesoh.com mail aliases</h1>
      <form onSubmit={sendQuery} className={mailAliasesStyle.textCenter}>
        <input type="text" name="query" defaultValue={query} className={mailAliasesStyle.textbox} />{'  '}
        <Button type="submit">Execute</Button>
      </form>
      <br/>
      {results ? <>{aliasList}</> : 'no results'}
      <Modal show={ showEmailModel } fullscreen={true} onHide={ handleClose }>
        <Modal.Header closeButton />
        <Modal.Body className={mailAliasesStyle.modalBody}>{thisAlias}</Modal.Body>
      </Modal>
    </div>
  );
}

