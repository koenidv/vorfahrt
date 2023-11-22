<script lang="ts">
  import { signOut } from "@auth/sveltekit/client";
  import { page } from "$app/stores";
</script>

<div class="m-4">
  <div class="flex flex-row w-full justify-start items-baseline gap-2">
    <a class="btn btn-primary" href="/admin">vorfahrt admin</a>
    <a class="btn btn-secondary" href="/">Back to Public Page</a>
    <div class="flex-grow" />
    <div class="btn btn-outline" on:click={() => signOut({ callbackUrl: "/" })}>Sign Out</div>
    <div class="btn btn-error">Kill Server</div>
  </div>
</div>

<div class="m-4">
  <div class="flex flex-row w-100 max-w gap-3 min-h-[80vh] overflow-hidden">
    <ul class="menu bg-base-200 rounded-box w-56 pb-3 h-fit flex-shrink-0">
      <li><a href="/admin" class={$page?.route?.id === "/admin" ? "active": ""}>Overview</a></li>
      <div class="divider my-2">Scrapers</div>
      {#each $page.data.scrapers as scraper}
        <li>
          <a
            href={"/admin/scraper/" + scraper.name}
            class={$page?.params?.scraperId === scraper.name ? "active" : ""}>
            {scraper.name}</a>
        </li>
      {/each}
      <div class="divider my-2">Influx Clients</div>
      to be developed
    </ul>
    <div class="flex-grow bg-base-200 rounded-box p-4 overflow-hidden">
      <slot />
    </div>
  </div>
</div>
