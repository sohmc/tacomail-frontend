'use client';
import { pinoLogger } from '@/serverComponents/pinoLogger';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Col, Row, Tabs, Tab, Button, InputGroup, Form, Modal } from 'react-bootstrap';
import { useState, useEffect } from 'react';

import { DomainDropdown } from './components/tacomail-components';
import { RandomizerButton } from './components/inputRandomizer';
import { BuildEmailAccordion, BuildErrorAccordion } from './components/reportAccordion';
import { DomainConfigAccordion } from './components/tacomail-config';


export default function OpenPage() {
  const [query, _setQuery] = useState('');
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const [tacoMailDomains, setTacoMailDomains] = useState({});

  const closeConfigModal = () => setShowConfigModal(false);
  useEffect(() => {
    async function getConfig() {
      const fetchResults = await fetch('api/config', { method: 'POST' });
      const fetchedConfig = await fetchResults.json();

      pinoLogger.debug('(page.useEffect.getConfig) fetchedConfig: ' + JSON.stringify(fetchedConfig));
      setTacoMailDomains(fetchedConfig);
    }
    getConfig();
  }, []);

  async function sendQuery(q) {
    q.preventDefault();

    // Read the form data
    const formData = new FormData(q.target);
    const formJson = Object.fromEntries(formData.entries());

    pinoLogger.info('(page.sendQuery) formJson: ' + JSON.stringify(formJson));

    if ((Object.hasOwn(formJson, 'search') && formJson.search.length > 0)
        || (Object.hasOwn(formJson, 'create') && formJson.create.length > 0)
        || (Object.hasOwn(formJson, 'domain') && formJson.domain.length > 0)) {
      const apiRequest = {
        method: 'POST',
        body: formData,
      };

      const fetchResults = await fetch('api', apiRequest);

      const fetchResultsJson = await fetchResults.json();
      if (Object.hasOwn(fetchResultsJson, 'message') || Object.hasOwn(fetchResultsJson, 'error'))
        setError(fetchResultsJson);
      else
        setResults(fetchResultsJson);
    }
  }

  return (
    <div className='w-50 m-auto'>
      <h1 className='text-center'>mikesoh.com mail aliases</h1>
      <Tabs defaultActiveKey='Search'>
        <Tab eventKey='Search' title='Search'>
          <form onSubmit={sendQuery} className='text-center pb-3'>
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
          <form onSubmit={sendQuery} className='text-center'>
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
        <Tab eventKey='Config' title='Config'>
            <DomainConfigAccordion configDomains={tacoMailDomains} configModal={setShowConfigModal} />
            <Modal show={ showConfigModal } onHide={ closeConfigModal } size='lg'>
              <Modal.Header closeButton>Add Domain</Modal.Header>
              <Modal.Body className='text-center'>
                <form onSubmit={sendQuery}>
                  <Row className='align-items-top'>
                    <Col xs={9}>
                      <Form.Control type="text" name='domain' defaultValue={query}/>
                    </Col>
                    <Col>
                      <Button type='submit'>Add Domain</Button>
                    </Col>
                  </Row>
                </form>
              </Modal.Body>
            </Modal>
        </Tab>
      </Tabs>
      { results ? <BuildEmailAccordion emailArray={results} onResultMutate={setResults} /> : <BuildErrorAccordion errorObject={error} />}
    </div>
  );
}

