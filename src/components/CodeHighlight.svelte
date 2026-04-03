<script lang="ts">
    import hljs from "highlight.js/lib/core";
    import typescript from "highlight.js/lib/languages/typescript";

    let { code, filename }: { code: string; filename: string } = $props();

    hljs.registerLanguage("typescript", typescript);

    function addCode(node: Element, code: string) {
        node.innerHTML =
            "\n" +
            hljs
                .highlight(code, {
                    language: "typescript",
                })
                .value.trim();
    }
</script>

<div style="position: relative; font-size: 0.9rem;">
    <p
        style="position:absolute; top: 0px; margin:0; border-radius: 5px 5px 0 0; padding: 0.25rem 1.5rem; background-color: #e6e6e6; width: 100%; font-family: var(--mono-font); display: flex; justify-content: space-between; align-items: center;"
    >
        {filename}
        <button
            onclick={() => navigator.clipboard.writeText(code)}
            style="background: none; border: none; cursor: pointer; font-size: 1rem; margin: 0;"
            aria-label="Copy to clipboard"
        >
            <svg
                width="17"
                height="17"
                viewBox="0 0 15 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                ><path
                    d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM11 2V2.25C11 2.66421 10.6642 3 10.25 3H4.75C4.33579 3 4 2.66421 4 2.25V2H3.5C3.22386 2 3 2.22386 3 2.5V12.5C3 12.7761 3.22386 13 3.5 13H11.5C11.7761 13 12 12.7761 12 12.5V2.5C12 2.22386 11.7761 2 11.5 2H11Z"
                    fill="black"
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                ></path></svg
            >
        </button>
    </p>
    <pre style="padding-top: 2.5rem;"><code
            class="language-typescript"
            use:addCode={code}></code></pre>
</div>
