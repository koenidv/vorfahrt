import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from "../../../scraper/src/web-api/appRouter";
import { PUBLIC_ADMIN_URL } from '$env/static/public';

export const trpc = createTRPCProxyClient<AppRouter>({
    links: [httpBatchLink({ url: PUBLIC_ADMIN_URL })],
});

