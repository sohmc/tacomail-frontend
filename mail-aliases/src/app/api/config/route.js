import { winstonLogger } from '@/serverComponents/logger';
import { sendApiRequest } from '@/serverComponents/executeLambda';

export async function POST() {
  const endpoint = '/domain';
  const responseJson = await sendApiRequest('GET', endpoint);

  winstonLogger.debug('(config/route.POST) Got the following domain objects: ' + JSON.stringify(responseJson));
  return Response.json(responseJson);
}

export function GET() {
  const tacomailNpmVersion = process.env.npm_package_version || 'undefined';
  // "0.1.0+build.19-commit.a37074cc008d90ec9b87279232cc6014e3312e9c"

  winstonLogger.info('(getTacomailVersion) npm.version: ' + tacomailNpmVersion);
  winstonLogger.info('(getTacomailVersion) env: ' + JSON.stringify(process.env));

  const tacomailVersion = {
    'version': tacomailNpmVersion.split('+')[0],
  };

  if (tacomailNpmVersion.split('+').length > 1) {
    const buildMetadata = tacomailNpmVersion.split('+')[1].split('-');
    for (let index = 0; index < buildMetadata.length; index++) {
      const [ name, value ] = buildMetadata[index].split('.');
      if (name.length > 0)
        tacomailVersion[name] = (value.length > 0 ? value : 'undefined');
    }
  }

  return Response.json(tacomailVersion);
}
