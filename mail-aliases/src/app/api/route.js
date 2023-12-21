require('dotenv').config({ path: '../../.env.local' });

// Signing code based on:
//   https://arpadt.com/articles/signing-requests-with-aws-sdk
import { SignatureV4 } from '@smithy/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-js';

export async function POST(request) {
  let returnObject = {};

  const formData = await request.formData();

  if (formData.get('search')) {
    const searchString = formData.get('search').toLowerCase();
    console.log('route.request.search -- ' + JSON.stringify(formData.get('search')));

    returnObject = await searchDatabase(searchString);

    console.log('route:request:search -- RETURNING ' + JSON.stringify(returnObject));
    return Response.json(returnObject);
  } else if (formData.get('action')) {
    const action = formData.get('action');
    const aliasUuid = formData.get('uuid');

    if (['activate', 'deactivate', 'ignore'].indexOf(action) == -1)
      return Response.json({ 'error': 'Invalid alias operation: ' + action });
    if (!formData.get('uuid'))
      return Response.json({ 'error': 'Invalid alias uuid: ' + aliasUuid });

    returnObject = await aliasOperation(action, aliasUuid);
    return Response.json(returnObject);
  } else if (formData.get('create')) {
    console.log('route.request.create -- ' + JSON.stringify(formData.get('create')) + JSON.stringify(formData.get('selectedDomain')));

    const createString = formData.get('create').toLowerCase() + '@' + formData.get('selectedDomain').toLowerCase();

    returnObject = await createAlias(createString);

    console.log('route:request:create -- RETURNING ' + JSON.stringify(returnObject));
    return Response.json(returnObject);
  }
}

async function createAlias(newAlias) {
  const endpoint = '/alias';

  const [ alias, subdomain ] = newAlias.split('@');
  const requestBody = {
    'alias': alias,
    'domain': subdomain,
    'destination': 'S3',
  };

  const responseJson = await sendApiRequest('POST', endpoint, requestBody);

  // If we get an array and the fullEmailAddress is the same as the newAlias,
  // then return the alias record, and add 'new' to the object.
  if (Array.isArray(responseJson) && (responseJson[0].fullEmailAddress == newAlias))
    return [{ ...responseJson[0], 'new': true }];
  else
    return responseJson;
}

async function aliasOperation(action, aliasUuid) {
  const endpoint = '/alias/' + aliasUuid + '/' + action;

  const responseJson = await sendApiRequest('GET', endpoint);
  return responseJson;
}


async function searchDatabase(searchString) {
  const endpoint = '/alias?q=' + searchString;

  const responseJson = await sendApiRequest('GET', endpoint);
  return responseJson;
}


async function sendApiRequest(requestMethod = 'GET', endpoint, payload = {}) {
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

  // Check if there is a payload
  console.log('route:payload -- ' + JSON.stringify(payload));
  if (Object.keys(payload).length > 0) signPayload.body = JSON.stringify(payload);

  // Get Signature
  const signed = await sigv4.sign(signPayload);
  console.log('route:signedRequest -- ' + JSON.stringify(signed));

  // fetch
  const fetchParams = {
    method: requestMethod,
    headers: signed.headers,
  };

  // If there is a payload, attach it to the body.
  if (Object.keys(payload).length > 0) fetchParams.body = JSON.stringify(payload);
  const fetchResults = await fetch(apiUrl.href, fetchParams);

  const data = await fetchResults.json();
  console.log('route:sendApiRequest -- ' + JSON.stringify(data));
  return data;
}
