<script lang="ts">
  import { goto } from "$app/navigation";
  import { signIn } from "@auth/sveltekit/client";

  export let data;

  function gotoAdmin() {
    if (data?.session?.user) {
      goto("/admin");
    } else {
      signIn("auth0", { callbackUrl: "/admin" });
    }
  }
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<button class="btn btn-primary" on:click={gotoAdmin}>Admin Panel</button>
