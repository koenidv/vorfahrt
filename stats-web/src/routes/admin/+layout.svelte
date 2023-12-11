<script lang="ts">
  import { page } from "$app/stores";
  import { trpc } from "$lib/trpc";
  import { onMount } from "svelte";
  import AdminHeader from "./AdminHeader.svelte";
  import AdminSidebar from "./AdminSidebar.svelte";
  import { writable } from "svelte/store";
  import { services } from "$lib/adminStore";

  export let data;
  $services = data.services;
  
  onMount(() => {

    trpc.services.status.subscribe(undefined, {
      onData(update) {
        console.log(update);
        services.update((s) => {
          s[update.id].running = update.running;
          return s;
        });
      },
      onError(error) {
        console.log(error);
      },
    });
  });
</script>

<AdminHeader />

{#if !$page.data.error}
  <div class="m-4">
    <div class="flex flex-row w-100 max-w gap-3 min-h-[80vh] overflow-hidden">
      <AdminSidebar services={$services} />
      <div class="flex-grow bg-base-200 rounded-box p-4 overflow-hidden">
        <slot services={services} />
      </div>
    </div>
  </div>
{:else}
  <div class="flex w-full justify-center">
    <div class="flex flex-col jusify-center items-center rounded-box bg-error px-8 py-4 mt-12">
      <h2 class="text-error-content text-md">{$page.data.error.message}</h2>
      <p class="text-error-content">{$page.data.error.error}</p>
    </div>
  </div>
{/if}
