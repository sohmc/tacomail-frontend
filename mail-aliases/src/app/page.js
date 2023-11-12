"use client";

import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import { useState } from 'react';

import mailAliasesStyle from '../stylesheets/mail-aliases.module.css';


export default function FirstPost() {
  const [query, setQuery] = useState('');
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  async function sendQuery(q) {
    q.preventDefault();

    const form = q.target;
    const formData = new FormData(q.target)
    const formJson = Object.fromEntries(formData.entries());

    const fetchResults = await fetch('/api', {
      method: 'GET'
    });
    
    const fetchResultsJson = await fetchResults.json();
    setResults(fetchResultsJson.data.uuid);
  }

  return (
    <form onSubmit={sendQuery}>
      <h1>mikesoh.com mail aliases</h1>
      <input type="text" name="query" value={query} className={mailAliasesStyle.textbox} />{'  '}
      <Button type="submit">Execute</Button>
      <br/>
      <p>{results ? results : 'no results'}</p>
    </form>
  );
}
