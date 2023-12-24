import { winstonLogger } from '@/serverComponents/logger';
import { sendApiRequest } from '@/serverComponents/executeLambda';

export async function POST(request) {
  let returnObject = {};

  const formData = await request.formData();

  if (formData.get('search')) {
    const searchString = formData.get('search').toLowerCase();
    winstonLogger.info('(api/route.POST) request.search -- ' + JSON.stringify(formData.get('search')));

    returnObject = await searchDatabase(searchString);

    winstonLogger.debug('(api/route.POST) request.search -- RETURNING ' + JSON.stringify(returnObject));
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
    winstonLogger.info('(api/route.POST) request.create -- ' + JSON.stringify(formData.get('create')) + JSON.stringify(formData.get('selectedDomain')));

    if (!formData.get('selectedDomain') || formData.get('selectedDomain').length == 0)
      return Response.json({ 'error': 'Invalid domain selected: ' + formData.get('selectedDomain') });
    else if (!formData.get('create').toLowerCase().trim().length == 0)
      return Response.json({ 'error': 'Must provide an alias.' });

    returnObject = await createAlias(formData.get('create').toLowerCase().trim(), formData.get('selectedDomain').toLowerCase());

    winstonLogger.info('(api/route.POST) request.create -- RETURNING ' + JSON.stringify(returnObject));
    return Response.json(returnObject);
  }
}

async function createAlias(alias, subdomain) {
  const endpoint = '/alias';

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

