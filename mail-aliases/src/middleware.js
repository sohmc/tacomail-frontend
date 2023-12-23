import { NextRequest, NextResponse } from 'next/server';

export function middleware(request) {
  const requestedUrl = request.nextUrl.clone();

  // const requestedHost = request.headers.get('X-Forwarded-Host');
  const forwardedPath = request.headers.get('X-Forwarded-Path');

  console.log('requestedUrl: ' + requestedUrl);
  console.log('X-Forwarded-Path: ' + forwardedPath);

  if ((forwardedPath !== null) && (requestedUrl.toString().indexOf(forwardedPath) >= 0)) {
    const pathForward = requestedUrl.toString().split(forwardedPath).pop();
    console.log('Will forward to: ' + pathForward);
    return NextResponse.redirect(new URL('/', pathForward));
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