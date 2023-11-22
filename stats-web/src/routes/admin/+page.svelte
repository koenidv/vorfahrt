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
  <div class="flex flex-row w-100 gap-3 min-h-[80vh]">
    <ul class="menu bg-base-200 rounded-box w-56 pb-3 h-fit">
      <div class="divider my-2">Scrapers</div>
      <li><p on:click={() => true}>Dings 1</p></li>
      <li><p on:click={() => true}>Dings 2</p></li>
      <li><p on:click={() => true}>Dings 3</p></li>
      <div class="divider my-2">Influx Clients</div>
      to be developed
    </ul>
    <div class="flex-grow bg-base-200 rounded-box p-4">
      {data?.session?.accessToken}

    </div>
  </div>
</div>
