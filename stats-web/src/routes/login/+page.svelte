<script lang="ts">
  import { goto } from "$app/navigation";
  import { signIn } from "@auth/sveltekit/client";
  import { onMount } from "svelte";

  export let data;

  onMount(() => {
    if (data?.session?.user) {
      goto(data.redirect || "/", { replaceState: true });
    } else {
      signIn("auth0", { callbackUrl: data.redirect || "/" });
    }
  });
</script>
