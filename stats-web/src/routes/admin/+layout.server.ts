import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "../$types";
import { PUBLIC_ADMIN_URL } from "$env/static/public";

export const load: LayoutServerLoad = async (event) => {
  const session = await event.locals.getSession();
  if (!session?.user) throw redirect(303, "/login?redirect=" + event.route.id);

  // fixme not reaching the admin api will result in 500
  try {
    // todo trpc
    const session = await event.locals.getSession();
    const scrapersRes = await fetch(PUBLIC_ADMIN_URL + "/scraper", {
      headers: {
        "Authorization": "Bearer " + session!.accessToken
      }
    })
    const scrapers = await scrapersRes.json();
    return { scrapers };
  } catch (e) {
    console.error(e);
    return {
      scrapers: [],
      error: {
        message: "Admin API not reachable",
        error: e?.toString?.() || JSON.stringify(e)
      }
    }
  }
};