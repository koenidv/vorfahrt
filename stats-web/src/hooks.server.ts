import { SvelteKitAuth, type SvelteKitAuthConfig } from '@auth/sveltekit';
import Auth0Provider from "@auth/core/providers/auth0";
import type { Provider } from "@auth/core/providers";
import type { Handle } from "@sveltejs/kit";
import { AUTH_SECRET, AUTH0_BASE_URL, AUTH0_CLIENT_ID, AUTH0_SECRET } from "$env/static/private"

const config: SvelteKitAuthConfig = {
    providers: [
        Auth0Provider({
            id: "auth0",
            name: "Auth0",
            clientId: AUTH0_CLIENT_ID,
            clientSecret: AUTH0_SECRET,
            issuer: AUTH0_BASE_URL,
            wellKnown: AUTH0_BASE_URL + ".well-known/openid-configuration"
        }) as Provider
    ],
    secret: AUTH_SECRET,
    debug: true,
    session: {
        strategy: "jwt",
        maxAge: 1800 // 30 mins
    }
};

export const handle = SvelteKitAuth(config) satisfies Handle;