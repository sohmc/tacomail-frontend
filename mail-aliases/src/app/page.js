"use client";

import mailAliasesStyle from '../stylesheets/mail-aliases.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import { useState } from 'react';


export default function FirstPost() {
  const [query, setQuery] = useState('');
  const [error, setError] = useState(null);
  const [resultsArray, setRestultsArray] = useState(null);

  function sendQuery(q) {
    q.preventDefault();

    const form = q.target;
    const formData = new FormData(form)
    const formJson = Object.fromEntries(formData.entries());

    console.log(JSON.stringify(formJson));
  }

  return (
    <form method="post" onSubmit={sendQuery}>
      <h1>mikesoh.com mail aliases</h1>
      <input type="text" name="query" defaultValue={query} className={mailAliasesStyle.textbox} />{'  '}
      <Button type="submit">Execute</Button>
    </form>
  );
}
