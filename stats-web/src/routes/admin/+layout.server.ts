import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "../$types";
import { Readable } from "stream";
import { trpc } from "$lib/trpc";

export const load: LayoutServerLoad = async (event) => {
  const session = await event.locals.getSession();
  if (!session?.user) throw redirect(303, "/login?redirect=" + event.route.id);

  const readable = new Readable({ objectMode: true })

  try {
    const session = await event.locals.getSession();
    const services = await trpc.services.list.query();
    return { services };
  } catch (e) {
    console.error(e);
    return {
      services: [],
      error: {
        message: "Admin API not reachable",
        error: e?.toString?.() || JSON.stringify(e)
      }
    }
  }
};