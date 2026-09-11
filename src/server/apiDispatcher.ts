import type { IncomingMessage, ServerResponse } from 'http';

// Dynamic import of Route Handlers
export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const fullUrl = `http://${req.headers.host || 'localhost'}${req.url || ''}`;
  const urlObj = new URL(fullUrl);
  const pathname = urlObj.pathname;

  if (!pathname.startsWith('/api/')) {
    return false;
  }

  try {
    // Read request body if present
    let bodyBuffer = Buffer.alloc(0);
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      bodyBuffer = Buffer.concat(chunks);
    }

    // Convert IncomingMessage to web-standard Request
    const headers = new Headers();
    for (const [key, val] of Object.entries(req.headers)) {
      if (val) {
        if (Array.isArray(val)) {
          val.forEach((v) => headers.append(key, v));
        } else {
          headers.set(key, val);
        }
      }
    }

    const webRequest = new Request(fullUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' && bodyBuffer.length > 0 ? bodyBuffer : undefined,
      // @ts-ignore
      duplex: 'half',
    });

    let handlerModule: any = null;

    if (pathname === '/api/health/ai') {
      handlerModule = await import('../app/api/health/ai/route');
    } else if (pathname === '/api/ai/summary') {
      handlerModule = await import('../app/api/ai/summary/route');
    } else if (pathname === '/api/timeline') {
      handlerModule = await import('../app/api/timeline/route');
    } else if (pathname === '/api/profile') {
      handlerModule = await import('../app/api/profile/route');
    } else if (pathname === '/api/consent') {
      handlerModule = await import('../app/api/consent/route');
    } else if (pathname === '/api/demo/seed') {
      handlerModule = await import('../app/api/demo/seed/route');
    } else if (pathname === '/api/demo/clear') {
      handlerModule = await import('../app/api/demo/clear/route');
    } else if (pathname === '/api/documents/upload') {
      handlerModule = await import('../app/api/documents/upload/route');
    } else if (pathname === '/api/export/summary') {
      handlerModule = await import('../app/api/export/summary/route');
    }

    if (handlerModule) {
      const method = req.method?.toUpperCase() || 'GET';
      const handler = handlerModule[method];

      if (typeof handler === 'function') {
        const webResponse: Response = await handler(webRequest);
        res.statusCode = webResponse.status;
        webResponse.headers.forEach((value, name) => {
          res.setHeader(name, value);
        });

        const responseBuffer = Buffer.from(await webResponse.arrayBuffer());
        res.end(responseBuffer);
        return true;
      } else {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: `Method ${method} Not Allowed` }));
        return true;
      }
    }

    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: `API route not found: ${pathname}` }));
    return true;
  } catch (error) {
    console.error(`API Error handling ${pathname}:`, error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal Server Error',
      })
    );
    return true;
  }
}
