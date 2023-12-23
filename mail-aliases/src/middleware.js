import { _NextRequest, NextResponse } from 'next/server';

export function middleware(request) {
  const requestedUrl = request.nextUrl.clone();
  const basePath = '/tmail';

  // const requestedHost = request.headers.get('X-Forwarded-Host');
  // const forwardedPath = request.headers.get('X-Forwarded-Path');

  console.log('basePath set: ' + basePath);
  console.log('requestedUrl: ' + requestedUrl.toString());
  console.log('basePath index: ' + requestedUrl.toString().indexOf(basePath));
  // console.log('X-Forwarded-Path: ' + forwardedPath);

  if (requestedUrl.toString().indexOf(basePath) == -1) {
    console.log('basePath not detected.');

    const pathForward = basePath + requestedUrl.toString().split('localhost:3000').pop();
    console.log('Will forward to: ' + pathForward);
    return NextResponse.rewrite(new URL(pathForward));
  }

  // if (isProduction && requestedHost && !requestedHost.match(/example.com/)) {
  //   const host = `example.com`; // set your main domain

  //   const requestedPort = request.headers.get('X-Forwarded-Port');
  //   const requestedProto = request.headers.get('X-Forwarded-Proto');

  //   url.host = host;
  //   url.protocol = requestedProto || url.protocol;
  //   url.port = requestedPort || url.port;

  //   return NextResponse.redirect(url);
  // }

  return NextResponse.next();
}