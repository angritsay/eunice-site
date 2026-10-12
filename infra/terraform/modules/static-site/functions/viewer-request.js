// CloudFront Function (cloudfront-js-2.0), viewer request.
// - www.<domain> redirects to <domain>, keeping the path and query (UTM tags survive).
// - /path/ is served from /path/index.html, as the static build writes it; /path
//   redirects to /path/.
// CANONICAL_HOST is replaced by Terraform.
function query(request) {
  const parts = [];
  const qs = request.querystring || {};
  for (const key of Object.keys(qs)) {
    const entry = qs[key];
    const values = entry.multiValue ? entry.multiValue.map((v) => v.value) : [entry.value];
    for (const value of values) parts.push(`${key}=${value}`);
  }
  return parts.length ? `?${parts.join('&')}` : '';
}

function redirect(location) {
  return { statusCode: 301, statusDescription: 'Moved Permanently', headers: { location: { value: location } } };
}

// biome-ignore lint/correctness/noUnusedVariables: CloudFront calls handler by name.
function handler(event) {
  const request = event.request;
  const host = request.headers.host ? request.headers.host.value : '';
  if (host.startsWith('www.')) {
    return redirect(`https://CANONICAL_HOST${request.uri}${query(request)}`);
  }
  const uri = request.uri;
  if (uri.endsWith('/')) {
    request.uri = `${uri}index.html`;
  } else if (uri.lastIndexOf('.') < uri.lastIndexOf('/')) {
    // No extension in the last segment: a page, not an asset.
    return redirect(`${uri}/${query(request)}`);
  }
  return request;
}
