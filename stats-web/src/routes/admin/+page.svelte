<script lang="ts">
  import { goto } from "$app/navigation";
  import { signOut } from "@auth/sveltekit/client";

  export let data;
</script>

<div class="m-4">
  <div class="flex flex-row w-full justify-start items-baseline gap-2">
    <div class="btn btn-primary">vorfahrt admin</div>
    <div class="btn btn-secondary" on:click={() => goto("/")}>Back to Public Page</div>
    <div class="flex-grow" />
    <div class="btn btn-outline" on:click={() => signOut({ callbackUrl: "/" })}>Sign Out</div>
    <div class="btn btn-error">Kill Server</div>
  </div>
</div>

<div class="m-4">
  <div class="flex flex-row w-100 max-w gap-3 min-h-[80vh] overflow-hidden">
    <ul class="menu bg-base-200 rounded-box w-56 pb-3 h-fit flex-shrink-0">
      <div class="divider my-2">Scrapers</div>
      {#each data?.scrapers as scraper}
      <li><p on:click={() => true}>{scraper.name}</p></li>
      {/each}
      <div class="divider my-2">Influx Clients</div>
      to be developed
    </ul>
    <div class="flex-grow bg-base-200 rounded-box p-4 overflow-hidden">
      <p class="break-words">
        <a class="btn btn-accent" href={"https://jwt.io?value=" + data?.session?.accessToken} target="_blank">Analyse Access Token</a>
      </p>
    </div>
  </div>
</div>
