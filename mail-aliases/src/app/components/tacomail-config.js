import { useState } from 'react';

import { Button, Accordion } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';

export function DomainConfigAccordion({ configDomains, configModal }) {
  if (!Array.isArray(configDomains)) return (null);
  const subDomains = configDomains.map((i) => i.subdomain);
  subDomains.sort();
  return (
    <>
      <Accordion defaultActiveKey={['0']} alwaysOpen>
        { configToolbar(subDomains, configModal) }
        { configDomains ? subDomains.map(thisSubdomain => domainConfigDetails(configDomains.find((i) => i.subdomain == thisSubdomain))) : null }
      </Accordion>
    </>
  );
}

function domainConfigDetails(selectedDomainObject) {
  return (
    <Accordion.Item eventKey={selectedDomainObject.subdomain} key={selectedDomainObject.subdomain}>
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
              <td>{ selectedDomainObject.description }</td>
              <td>{ convertEpochToDate(selectedDomainObject.created_datetime) } </td>
              <td>{ convertEpochToDate(selectedDomainObject.modified_datetime) }</td>
              <td>{ selectedDomainObject.active ? 'Active' : 'Inactive' }</td>
            </tr>
          </tbody>
        </Table>

        { selectedDomainObject.active ? <Button variant='warning'>Deactivate</Button> : <Button variant='success'>Activate</Button> } {' '}
      </Accordion.Body>
    </Accordion.Item>
  );
}

function configToolbar(subDomains, configModal) {
  return (
    <Accordion.Item eventKey="0" key="0">
      <Accordion.Header>{ subDomains.length == 0 ? "No Config Found" : "tacomail config Toolbar" }</Accordion.Header>
      <Accordion.Body>
        <Table hover>
          <thead>
            <tr>
              <th>Domains Configured</th>
              <th>tacomail version</th>
              <th>dynamoDB Table Name</th>
              <th>env</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{ subDomains.length }</td>
              <td>v1.2.3</td>
              <td>someTableName</td>
              <td>someEnvs</td>
            </tr>
          </tbody>
        </Table>

        <Button variant='info' onClick={ () => configModal(true)}>Add Domain</Button>
      </Accordion.Body>
    </Accordion.Item>
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