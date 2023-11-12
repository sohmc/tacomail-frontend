export async function GET(request) {
  console.log('route:request -- ' + JSON.stringify(request));


  const fetchResults = await fetch('https://httpbin.org/uuid?query=12345');
  const data = await fetchResults.json();

  const returnObject = await Response.json({data});

  console.log('route:data -- ' + JSON.stringify(data));
  return Response.json({data});
}
