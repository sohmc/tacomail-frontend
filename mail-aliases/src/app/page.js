'use client';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Col, Row, Tabs, Tab, Button, Accordion, Modal, InputGroup} from 'react-bootstrap';
import { useState, useEffect } from 'react';

import { GetIcons, DomainDropdown } from './tacomail-components';
import { QueryInputField } from './inputText';
import mailAliasesStyle from '../stylesheets/mail-aliases.module.css';


export default function OpenPage() {
  const [query, _setQuery] = useState('');
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const [showEmailModel, setShowEmailModel] = useState(false);
  const [thisAlias, setThisAlias] = useState('');

  const [tacoMailDomains, setTacoMailDomains] = useState({});

  useEffect(() => {
    async function getConfig() {
      const fetchResults = await fetch('/api/config', { method: 'POST' });
      const fetchedConfig = await fetchResults.json();

      console.log('page.getConfig -- ' + JSON.stringify(fetchedConfig));
      setTacoMailDomains(fetchedConfig);
    }
    getConfig();
  }, []);

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
      if (Object.prototype.hasOwnProperty.call(fetchResultsJson, 'message') || Object.prototype.hasOwnProperty.call(fetchResultsJson, 'error'))
        setError(fetchResultsJson);
      else
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

  let resultDisplay = '';
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

    resultDisplay = <Accordion>{accordionList}</Accordion>;
    if (results[0].new) {
      console.log('Setting defaultActiveKey: ' + results[0].uuid);
      resultDisplay = <Accordion defaultActiveKey={results[0].uuid}>{accordionList}</Accordion>;
    }
  } else if (error) {
    resultDisplay = (
      <Accordion defaultActiveKey='0'>
        <Accordion.Item eventKey='0' key='0' className='border-danger'>
          <Accordion.Header>Error executing query</Accordion.Header>
          <Accordion.Body>
            <p>{ error.message || error.error }</p>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    );
  }

  return (
    <div className={mailAliasesStyle.mainContainer}>
      <h1 className={mailAliasesStyle.textCenter}>mikesoh.com mail aliases</h1>
      <form onSubmit={sendQuery} className={mailAliasesStyle.textCenter}>
        <Tabs>
          <Tab eventKey='Search' title='Search'>
            <br/>
            <Row className='align-items-top'>
              <Col xs={10}>
                <QueryInputField defaultValue={query} />
              </Col>
              <Col>
                <Button type="submit">Search</Button>
              </Col>
            </Row>
          </Tab>
          <Tab eventKey='Create' title='Create'>
            <br/>
            <Row className='align-items-top'>
              <Col xs={10}>
                <InputGroup className='mb-3'>
                  <Button variant='outline-secondary' id='randomizer'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-shuffle" viewBox="0 0 16 16">
                      <path fill-rule="evenodd" d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.43.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3v1c-1.798 0-3.173 1.01-4.126 2.082A9.624 9.624 0 0 0 7.556 8a9.624 9.624 0 0 0 1.317 1.918C9.828 10.99 11.204 12 13 12v1c-2.202 0-3.827-1.24-4.874-2.418A10.595 10.595 0 0 1 7 9.05c-.26.43-.636.98-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1 0-1H1c1.798 0 3.173-1.01 4.126-2.082A9.624 9.624 0 0 0 6.444 8a9.624 9.624 0 0 0-1.317-1.918C4.172 5.01 2.796 4 1 4H.5a.5.5 0 0 1-.5-.5"/>
                      <path d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192zm0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192z"/>
                    </svg>
                  </Button>
                  <QueryInputField defaultValue={query} className='w-50' />
                  <DomainDropdown configDomains={tacoMailDomains} />
                </InputGroup>
              </Col>
              <Col>
                <Button type="submit">Search</Button>
              </Col>
            </Row>
          </Tab>
        </Tabs>
      </form>
      {results || error ? <>{ resultDisplay }</> : 'no results'}
      <Modal show={ showEmailModel } fullscreen={true} onHide={ handleClose }>
        <Modal.Header closeButton />
        <Modal.Body className={mailAliasesStyle.modalBody}>{thisAlias}</Modal.Body>
      </Modal>
    </div>
  );
}

