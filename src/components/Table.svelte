<script lang="ts">
    let { data }: { data: { [key: string]: unknown }[] } = $props();
    let columns = ["row", ...Object.keys(data[0])];

    let startRow = $state(0);
    let endRow = $state(4);
    let rows = $derived(
        data
            .map((row, i) => [i, ...Object.values(row)])
            .slice(startRow, endRow + 1),
    );
</script>

{#if data.length > 5}
    <div style="display:flex; flex-wrap: wrap; gap: 10px; font-size: small;">
        <div style="display: flex; align-items:center;">
            <label for="startRow">Start item:</label>
            <input
                type="number"
                bind:value={startRow}
                min="0"
                max={data.length}
                style="margin: 0;"
            />
        </div>
        <div style="display: flex; align-items:center;">
            <label for="endRow">End item:</label>
            <input
                type="number"
                bind:value={endRow}
                min="0"
                max={data.length}
                style="margin: 0;"
            />
        </div>
    </div>
{/if}

<figure
    style={data.length >= 5
        ? "margin-top: 0.75rem; margin-bottom: 0.50rem"
        : ""}
>
    <table style="margin: 0;">
        <thead>
            <tr>
                {#each columns as column}
                    <th>{column}</th>
                {/each}
            </tr>
        </thead>
        <tbody>
            {#each rows as row}
                <tr>
                    {#each row as cell}
                        <td>{cell}</td>
                    {/each}
                </tr>
            {/each}
        </tbody>
    </table>
</figure>

{#if data.length > 5}
    <p style="margin-top: 0rem; margin-bottom: 1rem; font-size: small;">
        Displaying {Math.max(0, endRow + 1 - startRow)} items out of {data.length}.
    </p>
{/if}