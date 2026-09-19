// WebDecoy/app#1186: does an injected edge function that forwards a modified
// request through context.next() change what netlify.toml rewrites and
// redirects do? Copied into .netlify/edge-functions by the build command,
// where the Netlify SDK injects extension functions.
export default async (request: Request, context: { next: (r?: Request) => Promise<Response> }) => {
  const url = new URL(request.url);
  if (url.pathname.startsWith('/rw-plain/')) return undefined;
  if (url.pathname.startsWith('/rw-next/')) {
    const h = new Headers(request.headers);
    h.set('x-wd-clearance', 'unscoped');
    const res = await context.next(new Request(request, { headers: h }));
    const out = new Response(res.body, res);
    out.headers.set('x-spike-injected', 'forwarded');
    return out;
  }
  return undefined;
};

export const config = { path: ['/rw-plain/*', '/rw-next/*'] };
