import { createTRPCProxyClient, createWSClient, httpBatchLink, wsLink } from '@trpc/client';
import type { AppRouter } from "../../../scraper/src/web-api/appRouter";
import { PUBLIC_ADMIN_WS } from '$env/static/public';
import { PUBLIC_ADMIN_HTTP } from '$env/static/public';
import { browser } from '$app/environment';


let link;

if (browser) {
    const wsClient = createWSClient({
        url: PUBLIC_ADMIN_WS,
    });
    link = wsLink({ client: wsClient });
} else {
    link = httpBatchLink({ url: PUBLIC_ADMIN_HTTP });
}

export const trpc = createTRPCProxyClient<AppRouter>({
    links: [link],
});
