import Editor from "@monaco-editor/react";
import { useRef } from "react";

function AssemblyEditor() {
  const monacoRef = useRef(null);
  const keywords = [
    "add",
    "and",
    "div",
    "mult",
    "jr",
    "mfhi",
    "mflo",
    "sll",
    "sllv",
    "slt",
    "srl",
    "sub",
    "rte",
    "push",
    "pop",
    "addi",
    "beq",
    "bne",
    "ble",
    "bgt",
    "lb",
    "lh",
    "lui",
    "lw",
    "sb",
    "slti",
    "sw",
    "j",
    "jal",
  ];

  function handleEditorWillMount(monaco: any) {
    // here you can access to the monaco instance before it is initialized
    // register the language
    monaco.languages.register({ id: "mips" });
    // register a tokens provider for the language
    monaco.languages.setMonarchTokensProvider("mips", {
      keywords: keywords,
      tokenizer: {
        root: [
          [
            /@?\$?[a-zA-Z][\w$]*/,
            {
              cases: {
                "@keywords": "keyword",
                "@default": "identifier",
              },
            },
          ],
          [/".*?"/, "string"],
          [/\d+/, "number"],
          [/#.*$/, "comment"],
        ],
      },
    });

    // define a new theme that contains only rules that match this language
    monaco.editor.defineTheme("mipsdark", {
      base: "vs-dark",
      inherit: true,
      colors: {
        "editor.foreground": "#f8f8f2",
        "editor.background": "#282a36",
      },

      rules: [
        { token: "comment", foreground: "#6272a4", fontStyle: "bold" },
        { token: "keyword", foreground: "#bd93f9" },
        { token: "identifier", foreground: "#8be9fd" },
        { token: "number", foreground: "#ff79c6" },
        { token: "string", foreground: "#ffb86c" },
      ],
    });

    monaco.languages.registerCompletionItemProvider("mips", {
      provideCompletionItems: (model: any, position: any) => {
        const suggestions = [
          ...keywords.map((k) => {
            return {
              label: k,
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: k,
            };
          }),
        ];
        return { suggestions: suggestions };
      },
    });
  }

  function handleEditorDidMount(editor: any, monaco: any) {
    // here is another way to get monaco instance
    // you can also store it in `useRef` for further usage
    monacoRef.current = editor;

    monaco.editor.setTheme("mipsdark");
  }

  return (
    <Editor
      height="80vh"
      defaultLanguage="mips"
      theme="vs-dark"
      defaultValue={
        "# MIPS UFAL Assembly Sim. by Reinaldo Assis \n# Project supervisor: prof. Bruno Costa"
      }
      options={{
        scrollBeyondLastLine: false,
        fontSize: "20px",
      }}
      beforeMount={handleEditorWillMount}
      onMount={handleEditorDidMount}
    />
  );
}

export default AssemblyEditor;
