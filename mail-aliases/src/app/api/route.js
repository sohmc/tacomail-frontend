require('dotenv').config({ path: '../../.env.local' });

import { SignatureV4 } from '@aws-sdk/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-js';

export async function POST(request) {
  let returnObject = {};

  const formData = await request.formData();

  if (formData.get('query')) {
    const queryString = formData.get('query').toLowerCase();
    console.log('route:request -- ' + JSON.stringify(formData.get('query')));

    if (queryString.startsWith('new:')) {
      // remove 'new:'
      returnObject = await createAlias(queryString.slice(3));
    } else {
      returnObject = await queryDatabase(queryString);
    }

    return Response.json(returnObject);
  } else if (formData.get('action')) {
    const action = formData.get('action');
    const aliasUuid = formData.get('uuid');

    if (['activate', 'deactivate', 'ignore'].indexOf(action) == -1)
      return Response.json({'error': 'Invalid alias operation: ' + action});
    if (!formData.get('uuid'))
      return Response.json({'error': 'Invalid alias uuid: ' + aliasUuid});

    returnObject = await aliasOperation(action, aliasUuid);
    return Response.json(returnObject);
  }
}

async function createAlias(newAlias) {
  const endpoint = '/alias';
  const requestBody = {
    'alias': newAlias,
    'domain': subdomain,
    'destination': ''
  }
  return newAlias;
}

async function aliasOperation(action, aliasUuid) {
  const endpoint = '/alias/' + aliasUuid + '/' + action

  const responseJson = await sendApiRequest('GET', endpoint);
  return responseJson;
}


async function queryDatabase(queryString) {
  const endpoint = '/alias?q=' + queryString;

  const responseJson = await sendApiRequest('GET', endpoint);
  return responseJson;
}


async function sendApiRequest(requestMethod = 'GET', endpoint, _payload = {}) {
  const baseUrl = process.env.LAMBDA_URL;
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

  // Build singing Payload
  const signPayload = {
    method: requestMethod,
    hostname: apiUrl.host,
    path: apiUrl.pathname,
    protocol: apiUrl.protocol,
    headers: {
      'Content-Type': 'application/json',
      host: apiUrl.hostname,
    },
  };

  // Check query endpoint for URL Parameters
  console.log('route:searchParams -- ' + apiUrl.searchParams.toString());
  if (apiUrl.searchParams.toString().length > 0) {
    const params = apiUrl.searchParams.toString().split('&');
    const canonicalQueryObject = {};
    
    params.forEach(element => {
      const [p, v] = element.split('=');
      canonicalQueryObject[decodeURIComponent(p)] = decodeURIComponent(v);
    });

    signPayload.query = canonicalQueryObject;
  }

  // Get Signature
  const signed = await sigv4.sign(signPayload);
  console.log('route:signedRequest -- ' + JSON.stringify(signed));

  const fetchResults = await fetch(apiUrl.href, {
    method: requestMethod,
    headers: signed.headers,
  });

  const data = await fetchResults.json();
  console.log('route:sendApiRequest -- ' + JSON.stringify(data));
  return data;
}
