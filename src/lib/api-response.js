const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
};

export function json(data, status = 200) {
  return Response.json(data, { status, headers: CORS_HEADERS });
}

export function errorResponse(message, status = 400) {
  return json({ message }, status);
}

export function optionsResponse() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
