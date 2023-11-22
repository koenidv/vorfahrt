<script lang="ts">
  import { page } from "$app/stores";
  import AdminHeader from "./AdminHeader.svelte";
  import AdminSidebar from "./AdminSidebar.svelte";
</script>

<AdminHeader />

{#if !$page.data.error}
  <div class="m-4">
    <div class="flex flex-row w-100 max-w gap-3 min-h-[80vh] overflow-hidden">
      <AdminSidebar />
      <div class="flex-grow bg-base-200 rounded-box p-4 overflow-hidden">
        <slot />
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
