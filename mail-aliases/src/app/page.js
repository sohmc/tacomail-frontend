'use client';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Col, Row, Tabs, Tab, Button, Accordion, Modal, InputGroup, Form } from 'react-bootstrap';
import { useState, useEffect } from 'react';

import { GetIcons, DomainDropdown } from './components/tacomail-components';
import mailAliasesStyle from '../stylesheets/mail-aliases.module.css';
import { RandomizerButton } from './components/inputField';


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

    // Read the form data
    const formData = new FormData(q.target);
    const formJson = Object.fromEntries(formData.entries());

    console.log('page.sendQuery -- formJson: ' + JSON.stringify(formJson));

    if (((Object.prototype.hasOwnProperty.call(formJson, 'search') && formJson.search.length > 0)
        || ((Object.prototype.hasOwnProperty.call(formJson, 'create') && formJson.create.length > 0)))) {
      const apiRequest = {
        method: 'POST',
        body: formData,
      };

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
      <Tabs>
        <Tab eventKey='Search' title='Search'>
          <form onSubmit={sendQuery} className={mailAliasesStyle.textCenter}>
            <br/>
            <Row className='align-items-top'>
              <Col xs={10}>
                <Form.Control type="text" name='search' defaultValue={query}/>
              </Col>
              <Col>
                <Button type='submit'>Search</Button>
              </Col>
            </Row>
          </form>
        </Tab>
        <Tab eventKey='Create' title='Create'>
          <form onSubmit={sendQuery} className={mailAliasesStyle.textCenter}>
            <br/>
            <Row className='align-items-top'>
              <Col xs={10}>
                <InputGroup className='mb-3'>
                  <RandomizerButton/>
                  <Form.Control type="text" name='create' defaultValue={query} className='w-50'/>
                  <InputGroup.Text>@</InputGroup.Text>
                  <DomainDropdown configDomains={tacoMailDomains} />
                </InputGroup>
              </Col>
              <Col>
                <Button type='submit'>Create</Button>
              </Col>
            </Row>
          </form>
        </Tab>
      </Tabs>
      {results || error ? <>{ resultDisplay }</> : 'no results'}
      <Modal show={ showEmailModel } fullscreen={true} onHide={ handleClose }>
        <Modal.Header closeButton />
        <Modal.Body className='fs-1 text-break text-center'>{thisAlias}</Modal.Body>
      </Modal>
    </div>
  );
}

