<script lang="ts">
    let { text, background, color } = $props();
</script>

<span
    style={`background-color: ${background}; color: ${color}; padding: 1px 5px; border-radius: 4px; font-weight: 600;`}
>
    {text}
</span>