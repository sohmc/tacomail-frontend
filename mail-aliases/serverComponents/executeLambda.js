import { winstonLogger } from '@/serverComponents/logger';
import { getIamCredentials } from '@/serverComponents/fetchIamCredentials';

// Signing code based on:
//   https://arpadt.com/articles/signing-requests-with-aws-sdk
import { SignatureV4 } from '@smithy/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-js';

export async function sendApiRequest(requestMethod = 'GET', endpoint, payload = {}) {
  const baseUrl = process.env.LAMBDA_URL;
  const apiUrl = new URL(endpoint, baseUrl);

  const iamCredentials = await getIamCredentials();
  winstonLogger.info('(config/route) Using credentials: ' + iamCredentials.Source);

  // Prepare to sign the request
  const sigv4 = new SignatureV4({
    service: 'lambda',
    region: 'us-east-1',
    credentials: {
      accessKeyId: iamCredentials.AccessKeyId,
      secretAccessKey: iamCredentials.SecretAccessKey,
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
  winstonLogger.info('(config/route.sendApiRequest) searchParams -- ' + apiUrl.searchParams.toString());
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
  winstonLogger.info('(config/route.sendApiRequest) payload -- ' + JSON.stringify(payload));
  if (Object.keys(payload).length > 0) signPayload.body = JSON.stringify(payload);

  // Get Signature
  const signed = await sigv4.sign(signPayload);
  winstonLogger.debug('(config/route.sendApiRequest) signedRequest -- ' + JSON.stringify(signed));

  // fetch
  const fetchParams = {
    method: requestMethod,
    headers: signed.headers,
  };

  // If there is a payload, attach it to the body.
  if (Object.keys(payload).length > 0) fetchParams.body = JSON.stringify(payload);
  const fetchResults = await fetch(apiUrl.href, fetchParams);

  const data = await fetchResults.json();
  winstonLogger.debug('(config/route.sendApiRequest) fetchResults -- ' + JSON.stringify(data));
  return data;
}
