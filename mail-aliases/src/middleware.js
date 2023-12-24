/* eslint-disable no-console */
import { _NextRequest, NextResponse } from 'next/server';

export function middleware(request) {
  // If X-Forwarded-Host is not set, then don't bother with middleware.
  const forwardedHost = request.headers.get('X-Forwarded-Host');
  if (forwardedHost === null) return NextResponse.next();

  // Middleware starts here
  const requestedUrl = request.nextUrl.clone();
  const basePath = '/tacomail';

  // const requestedHost = request.headers.get('X-Forwarded-Host');
  // const forwardedPath = request.headers.get('X-Forwarded-Path');

  logger('basePath set: ' + basePath);
  logger('requestedUrl: ' + requestedUrl.toString());
  logger('basePath index: ' + requestedUrl.toString().indexOf(basePath));

  if (requestedUrl.toString().indexOf(basePath) == -1) {
    logger('basePath not detected in request.');

    const pathForward = basePath + requestedUrl.toString().split('localhost:3000').pop();
    logger('Will offer (proxy): ' + pathForward);
    return NextResponse.rewrite(new URL(pathForward, request.url));
  }

  return NextResponse.next();
}

function logger(msg) {
  const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV == 'development' ? 'debug' : 'info');

  if (logLevel == 'debug') console.log(msg);
}