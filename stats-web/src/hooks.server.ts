import { SvelteKitAuth, type SvelteKitAuthConfig } from '@auth/sveltekit';
import Auth0Provider from "@auth/core/providers/auth0";
import type { Provider } from "@auth/core/providers";
import type { Handle } from "@sveltejs/kit";
import { AUTH_SECRET, AUTH0_BASE_URL, AUTH0_CLIENT_ID, AUTH0_SECRET } from "$env/static/private"

// fixme authjs session interface - https://next-auth.js.org/getting-started/typescript
declare module "@auth/core" {
    interface Session {
        accessToken: string;
    }
}

const config: SvelteKitAuthConfig = {
    providers: [
        Auth0Provider({
            id: "auth0",
            name: "Auth0",
            clientId: AUTH0_CLIENT_ID,
            clientSecret: AUTH0_SECRET,
            issuer: AUTH0_BASE_URL,
            wellKnown: AUTH0_BASE_URL + ".well-known/openid-configuration",
            authorization: {
                params: {
                    audience: "https://api.admin.vorfahrt.dev",
                }
            }
        }) as Provider
    ],
    secret: AUTH_SECRET,
    session: {
        strategy: "jwt",
        maxAge: 3600
    },
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token, user }) {
            session.accessToken = token.accessToken as string;
            return session;
        }
    }
};

export const handle = SvelteKitAuth(config) satisfies Handle;