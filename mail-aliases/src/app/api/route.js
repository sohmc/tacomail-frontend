require('dotenv').config({ path: '../../.env.local'});

import { SignatureV4 } from '@aws-sdk/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-js';

export async function POST(request) {
  const formData = await request.formData();
  console.log('route:request -- ' + JSON.stringify(formData.get('query')));
  
  const baseUrl = process.env.LAMBDA_URL;
  const endpoint = '/alias?alias=' + formData.get('query');
  const apiUrl = new URL(endpoint, baseUrl);

  const sigv4 = new SignatureV4({
    service: 'lambda',
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
    sha256: Sha256,
  });

  let canonicalQueryObject = {};
  const params = apiUrl.searchParams.toString().split('&');
  params.forEach(element => {
    const [p, v] = element.split('=');
    canonicalQueryObject[decodeURIComponent(p)] = decodeURIComponent(v);
  });
 
  const signed = await sigv4.sign({
    method: 'GET',
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

  console.log('route:signed -- ' + JSON.stringify(signed));

  const fetchResults = await fetch(apiUrl.href, {
    method: 'GET',
    headers: signed.headers,
  });
  
  const data = await fetchResults.json();

  console.log('route:data -- ' + JSON.stringify(data));
  return Response.json(data);
}
