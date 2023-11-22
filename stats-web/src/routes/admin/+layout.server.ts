import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "../$types";
import { PUBLIC_ADMIN_URL } from "$env/static/public";
import { trpc } from "$lib/trpc";

export const load: LayoutServerLoad = async (event) => {
  const session = await event.locals.getSession();
  if (!session?.user) throw redirect(303, "/login?redirect=" + event.route.id);

  // fixme not reaching the admin api will result in 500
  try {
    // todo trpc
    const session = await event.locals.getSession();
    const scrapers = await trpc.services.list.query();
    console.log(scrapers)
    return { services: scrapers };
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