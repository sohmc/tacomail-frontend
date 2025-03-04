import { useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import Accordion from 'react-bootstrap/Accordion';

export function DomainConfigDropdown({ configDomains }) {
  const [configDomain, setConfigDomain] = useState();
  
  if (!Array.isArray(configDomains)) return (null);
  const activeDomains = configDomains.sort();
  return (
    <>
      <Row className='align-items-top'>
        <Col xs={3}>
          Domains: 
        </Col>
        <Col>    
          <Form.Select size='sm' name='selectedDomain' onChange={ (e) => setConfigDomain(e.target.value) }>
            { activeDomains.length > 0 ? (<option value=''>Select a Domain</option>) : null }
            { activeDomains.length > 0 ? activeDomains.sort().map(element => (<option value={element.subdomain} key={element.subdomain}>{element.subdomain}</option>)) : (<option value='noconfig'>No Configuration Set</option>) }
            <option value='new' key='new'>Add new domain</option>
          </Form.Select>
        </Col>
      </Row>
      <p/>
      { configDomain ? domainConfigDetails(configDomains.find((i) => i.subdomain == configDomain)) : null }
    </>
  );
}

function domainConfigDetails(selectedDomainObject) {
  return (
    <Accordion defaultActiveKey="0">
      <Accordion.Item eventKey="0">
        <Accordion.Header>{selectedDomainObject.subdomain}</Accordion.Header>
        <Accordion.Body>
          <Table hover>
            <thead>
              <tr>
                <th>Description</th>
                <th>Created</th>
                <th>Modified</th>
                <th>Flags</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{ selectedDomainObject.destination }</td>
                <td>{ convertEpochToDate(selectedDomainObject.created_datetime) } </td>
                <td>{ convertEpochToDate(selectedDomainObject.modified_datetime) }</td>
                <td>{ selectedDomainObject.active ? 'Active' : 'Inactive' }</td>
              </tr>
            </tbody>
            </Table>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}


function convertEpochToDate(epoch) {
  const epochDate = new Date(epoch * 1000);
  let options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  };
  return new Intl.DateTimeFormat("en-US", options).format(epochDate);
};