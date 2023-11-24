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

  const handleClose = () => setShowEmailModel(false);
  const handleShow = (emailAddress) => {
    setThisAlias(emailAddress);
    setShowEmailModel(true);
  };

  let aliasList = '';
  if (results) {
    aliasList = results.map(alias =>
      <Accordion.Item eventKey={alias.uuid} key={alias.uuid}>
        <Accordion.Header>{alias.fullEmailAddress} <GetIcons ignoreFlag={alias.ignore} activeFlag={alias.active} /></Accordion.Header>
        <Accordion.Body>
          <p>Destination: {alias.destination}</p>
          <Button onClick={ () => handleShow(alias.fullEmailAddress) }>Show Email</Button>
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
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-envelope-x" viewBox="0 0 16 16">
        <path d="M2 2a2 2 0 0 0-2 2v8.01A2 2 0 0 0 2 14h5.5a.5.5 0 0 0 0-1H2a1 1 0 0 1-.966-.741l5.64-3.471L8 9.583l7-4.2V8.5a.5.5 0 0 0 1 0V4a2 2 0 0 0-2-2zm3.708 6.208L1 11.105V5.383zM1 4.217V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v.217l-7 4.2z"/>
        <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0m-4.854-1.354a.5.5 0 0 0 0 .708l.647.646-.647.646a.5.5 0 0 0 .708.708l.646-.647.646.647a.5.5 0 0 0 .708-.708l-.647-.646.647-.646a.5.5 0 0 0-.708-.708l-.646.647-.646-.647a.5.5 0 0 0-.708 0"/>
      </svg>
    );
  } else if (ignoreFlag) {
    icon = (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-incognito" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="m4.736 1.968-.892 3.269-.014.058C2.113 5.568 1 6.006 1 6.5 1 7.328 4.134 8 8 8s7-.672 7-1.5c0-.494-1.113-.932-2.83-1.205a1.032 1.032 0 0 0-.014-.058l-.892-3.27c-.146-.533-.698-.849-1.239-.734C9.411 1.363 8.62 1.5 8 1.5c-.62 0-1.411-.136-2.025-.267-.541-.115-1.093.2-1.239.735m.015 3.867a.25.25 0 0 1 .274-.224c.9.092 1.91.143 2.975.143a29.58 29.58 0 0 0 2.975-.143.25.25 0 0 1 .05.498c-.918.093-1.944.145-3.025.145s-2.107-.052-3.025-.145a.25.25 0 0 1-.224-.274M3.5 10h2a.5.5 0 0 1 .5.5v1a1.5 1.5 0 0 1-3 0v-1a.5.5 0 0 1 .5-.5m-1.5.5c0-.175.03-.344.085-.5H2a.5.5 0 0 1 0-1h3.5a1.5 1.5 0 0 1 1.488 1.312 3.5 3.5 0 0 1 2.024 0A1.5 1.5 0 0 1 10.5 9H14a.5.5 0 0 1 0 1h-.085c.055.156.085.325.085.5v1a2.5 2.5 0 0 1-5 0v-.14l-.21-.07a2.5 2.5 0 0 0-1.58 0l-.21.07v.14a2.5 2.5 0 0 1-5 0v-1Zm8.5-.5h2a.5.5 0 0 1 .5.5v1a1.5 1.5 0 0 1-3 0v-1a.5.5 0 0 1 .5-.5"/>
      </svg>
    );
  }

  return (icon);
}