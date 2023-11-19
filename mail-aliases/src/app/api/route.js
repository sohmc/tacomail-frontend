require('dotenv').config({ path: '../../.env.local'});

import { SignatureV4 } from '@aws-sdk/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-js';

export async function POST(request) {
  let returnObject = {};

  const formData = await request.formData();
  const queryString = formData.get('query').toLowerCase();

  console.log('route:request -- ' + JSON.stringify(formData.get('query')));

  if (queryString.startsWith('new:')) {
    returnObject = await createAlias(queryString.slice(3));
  } else {
    returnObject = await queryDatabase(queryString);
  }
  
  return Response.json(returnObject);
}

async function createAlias(newAlias) {
  return {}
}


async function queryDatabase(queryString) {
  const endpoint = '/alias?q=' + queryString;

  const responseJson = await sendApiRequest('GET', endpoint);
  return responseJson;
}


async function sendApiRequest(requestMethod = 'GET', endpoint, payload = {}) {
  const baseUrl = process.env.LAMBDA_URL
  const apiUrl = new URL(endpoint, baseUrl);

  // Prepare to sign the request
  const sigv4 = new SignatureV4({
    service: 'lambda',
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
    sha256: Sha256,
  });

  // Check query endpoint for URL Parameters
  let canonicalQueryObject = {};
  const params = apiUrl.searchParams.toString().split('&');
  params.forEach(element => {
    const [p, v] = element.split('=');
    canonicalQueryObject[decodeURIComponent(p)] = decodeURIComponent(v);
  });

  // Send Signing Request
  const signed = await sigv4.sign({
    method: requestMethod,
    hostname: apiUrl.host,
    path: apiUrl.pathname,
    protocol: apiUrl.protocol,
    query: canonicalQueryObject,
    // query: {"alias": "testing.trumpet@capricadev.tk"},
    headers: {
      'Content-Type': 'application/json',
      host: apiUrl.hostname,
    },
  });

  console.log('route:signedRequest -- ' + JSON.stringify(signed));

  const fetchResults = await fetch(apiUrl.href, {
    method: requestMethod,
    headers: signed.headers,
  });

  const data = await fetchResults.json();
  console.log('route:sendApiRequest -- ' + JSON.stringify(data));
  return data;
}