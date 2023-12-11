<script lang="ts">
  export let data;
</script>

<p class="break-words">
  <a
    class="btn btn-accent"
    href={"https://jwt.io?value=" + data?.session?.accessToken}
    target="_blank">Analyse Access Token</a>
</p>
