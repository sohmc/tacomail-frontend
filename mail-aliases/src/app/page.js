'use client';
import { pinoLogger } from '@/serverComponents/pinoLogger';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Col, Row, Tabs, Tab, Button, InputGroup, Form } from 'react-bootstrap';
import { useState, useEffect } from 'react';

import { DomainDropdown } from './components/tacomail-components';
import { RandomizerButton } from './components/inputRandomizer';
import { BuildEmailAccordion, BuildErrorAccordion } from './components/reportAccordion';
import { DomainConfigDropdown } from './components/tacomail-config';


export default function OpenPage() {
  const [query, _setQuery] = useState('');
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const [tacoMailDomains, setTacoMailDomains] = useState({});

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

    if (((Object.prototype.hasOwnProperty.call(formJson, 'search') && formJson.search.length > 0)
        || ((Object.prototype.hasOwnProperty.call(formJson, 'create') && formJson.create.length > 0)))) {
      const apiRequest = {
        method: 'POST',
        body: formData,
      };

      const fetchResults = await fetch('api', apiRequest);

      const fetchResultsJson = await fetchResults.json();
      if (Object.prototype.hasOwnProperty.call(fetchResultsJson, 'message') || Object.prototype.hasOwnProperty.call(fetchResultsJson, 'error'))
        setError(fetchResultsJson);
      else
        setResults(fetchResultsJson);
    }
  }

  return (
    <div className='w-50 m-auto'>
      <h1 className='text-center'>mikesoh.com mail aliases</h1>
      <Tabs defaultActiveKey='Config'>
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
          <form onSubmit={sendQuery}>
            <br/>
            <DomainConfigDropdown configDomains={tacoMailDomains} />
          </form>
        </Tab>
      </Tabs>
      { results ? <BuildEmailAccordion emailArray={results} onResultMutate={setResults} /> : <BuildErrorAccordion errorObject={error} />}
    </div>
  );
}

