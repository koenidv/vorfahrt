import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "../$types";

export const load: LayoutServerLoad = async (event) => {
  const session = await event.locals.getSession();
  console.log(event.route.id)
  if (!session?.user) throw redirect(303, "/login?redirect=" + event.route.id);
  return {};
};