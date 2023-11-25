'use client';

import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Accordion from 'react-bootstrap/Accordion';
import Modal from 'react-bootstrap/Modal';
import { useState } from 'react';

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

  async function aliasOperation(action, aliasUuid){
    const formData = new FormData();
    formData.append('action', action);
    formData.append('uuid', aliasUuid);

    const apiRequest = {
      method: 'POST',
      body: formData
    };

    const fetchResults = await fetch('/api', apiRequest);
    const fetchResultsJson = await fetchResults.json();

    if (fetchResultsJson.length === 1) {
      const newResults = results.map(alias => {
        if (alias.uuid == fetchResultsJson[0].uuid) 
          return fetchResultsJson[0];
        else return alias
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
    aliasList = results.map(alias =>
      <Accordion.Item eventKey={alias.uuid} key={alias.uuid}>
        <Accordion.Header>{alias.fullEmailAddress}<GetIcons ignoreFlag={alias.ignore} activeFlag={alias.active} /></Accordion.Header>
        <Accordion.Body>
          <p>Destination: {alias.destination}</p>
          { !alias.active ||  alias.ignore ? <Button variant='success' onClick={ () => aliasOperation('activate', alias.uuid) }>Activate</Button> : null }{' '}
          {  alias.active || !alias.ignore ? <Button variant='warning' onClick={ () => aliasOperation('deactivate', alias.uuid) }>Deactivate</Button> : null }{' '}
          {  alias.active && !alias.ignore ? <Button variant='secondary' onClick={ () => aliasOperation('ignore', alias.uuid) }>Ignore</Button> : null }{' '}
          <Button variant='info' onClick={ () => handleShow(alias.fullEmailAddress) }>Embiggen</Button>
        </Accordion.Body>
      </Accordion.Item>,
    );
  }

  return (
    <div className={mailAliasesStyle.mainContainer}>
      <h1 className={mailAliasesStyle.textCenter}>mikesoh.com mail aliases</h1>
      <form onSubmit={sendQuery} className={mailAliasesStyle.textCenter}>
        <input type="text" name="query" defaultValue={query} className={mailAliasesStyle.textbox} />{'  '}
        <Button type="submit">Execute</Button>
      </form>
      <br/>
      {results ? <Accordion>{aliasList}</Accordion> : 'no results'}
      <Modal show={ showEmailModel } fullscreen={true} onHide={ handleClose }>
        <Modal.Header closeButton />
        <Modal.Body className={mailAliasesStyle.modalBody}>{thisAlias}</Modal.Body>
      </Modal>
    </div>
  );
}

function GetIcons({ ignoreFlag, activeFlag }) {
  let icon = null;

  if (!activeFlag) {
    icon = (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-envelope-x-fill" viewBox="0 0 16 16" className={mailAliasesStyle.svg}>
        <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.026A2 2 0 0 0 2 14h6.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.606-3.446l-.367-.225L8 9.586l-1.239-.757ZM16 4.697v4.974A4.491 4.491 0 0 0 12.5 8a4.49 4.49 0 0 0-1.965.45l-.338-.207z"/>
        <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0m-4.854-1.354a.5.5 0 0 0 0 .708l.647.646-.647.646a.5.5 0 0 0 .708.708l.646-.647.646.647a.5.5 0 0 0 .708-.708l-.647-.646.647-.646a.5.5 0 0 0-.708-.708l-.646.647-.646-.647a.5.5 0 0 0-.708 0"/>
      </svg>
    );
  } else if (ignoreFlag) {
    icon = (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-incognito" viewBox="0 0 16 16" title="Alias is being ignored" className={mailAliasesStyle.svg}>
        <path fill-rule="evenodd" d="m4.736 1.968-.892 3.269-.014.058C2.113 5.568 1 6.006 1 6.5 1 7.328 4.134 8 8 8s7-.672 7-1.5c0-.494-1.113-.932-2.83-1.205a1.032 1.032 0 0 0-.014-.058l-.892-3.27c-.146-.533-.698-.849-1.239-.734C9.411 1.363 8.62 1.5 8 1.5c-.62 0-1.411-.136-2.025-.267-.541-.115-1.093.2-1.239.735m.015 3.867a.25.25 0 0 1 .274-.224c.9.092 1.91.143 2.975.143a29.58 29.58 0 0 0 2.975-.143.25.25 0 0 1 .05.498c-.918.093-1.944.145-3.025.145s-2.107-.052-3.025-.145a.25.25 0 0 1-.224-.274M3.5 10h2a.5.5 0 0 1 .5.5v1a1.5 1.5 0 0 1-3 0v-1a.5.5 0 0 1 .5-.5m-1.5.5c0-.175.03-.344.085-.5H2a.5.5 0 0 1 0-1h3.5a1.5 1.5 0 0 1 1.488 1.312 3.5 3.5 0 0 1 2.024 0A1.5 1.5 0 0 1 10.5 9H14a.5.5 0 0 1 0 1h-.085c.055.156.085.325.085.5v1a2.5 2.5 0 0 1-5 0v-.14l-.21-.07a2.5 2.5 0 0 0-1.58 0l-.21.07v.14a2.5 2.5 0 0 1-5 0v-1Zm8.5-.5h2a.5.5 0 0 1 .5.5v1a1.5 1.5 0 0 1-3 0v-1a.5.5 0 0 1 .5-.5"/>
      </svg>
    );
  }

  return (icon);
}