import { logger } from '@/serverComponents/logger';
import { sendApiRequest } from '@/serverComponents/executeLambda';

export async function POST() {
  const endpoint = '/domain';
  const responseJson = await sendApiRequest('GET', endpoint);

  logger.debug('(config/route.POST) Got the following domain objects: ' + JSON.stringify(responseJson));
  return Response.json(responseJson);
}
