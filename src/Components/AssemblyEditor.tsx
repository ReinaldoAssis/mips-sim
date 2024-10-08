import { useColorMode } from "@chakra-ui/react";
import Editor from "@monaco-editor/react";
import React, { useEffect } from "react";
import { useRef } from "react";
import SharedData, { IProcessor } from "../Service/SharedData";

function AssemblyEditor(props: {
  onEditorChange: (value: string | undefined, event: any) => void;
}) {
  const monacoRef = useRef(null);
  const { colorMode } = useColorMode()

  const share: SharedData = SharedData.instance;

  let keywords = [
    "add",
    "or",
    "call",
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

  const directives = [
    "def",
    "dw",
    "org",
    "include"
  ]

  keywords.push(...keywords.map(x => x.toUpperCase()))

  // React.useEffect(() => {
  //   if (share.monacoEditor && share.monacoEditor.languages) {
  //     share.monacoEditor.languages.setMonarchTokensProvider("mips", {
  //       keywords: keywords,
  //       tokenizer: {
  //         root: [
  //           [
  //             /@?\$?[a-zA-Z][\w$]*/,
  //             {
  //               cases: {
  //                 "@keywords": "keyword",
  //                 "@default": "identifier",
  //               },
  //             },
  //           ],
  //           [/".*?"/, "string"],
  //           [/\d+/, "number"],
  //           [/#.*$/, "comment"],
  //         ],
  //       },
  //     });
  //   }
  // }, [keywords]);

  function handleEditorWillMount(monaco: any) {
    //keywords = share.currentProcessor?.instructionSet ?? keywords;

    // here you can access to the monaco instance before it is initialized
    // register the language
    monaco.languages.register({ id: "mips" });
    // register a tokens provider for the language
    monaco.languages.setMonarchTokensProvider("mips", {
      keywords: keywords.concat(directives),
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

    monaco.editor.defineTheme("mipslight", {
      base: "vs", // Tema claro como base
      inherit: true,
      colors: {
        "editor.foreground": "#000000", // Texto padrão preto
        "editor.background": "#dfe7f0", // Cor de fundo clara
      },
    
      rules: [
        { token: "comment", foreground: "#757575", fontStyle: "italic" }, // Comentários em cinza e itálico
        { token: "keyword", foreground: "#0000FF", fontStyle: "bold" }, // Palavras-chave em azul e negrito
        { token: "identifier", foreground: "#007ACC" }, // Identificadores em um azul mais claro
        { token: "number", foreground: "#098658" }, // Números em verde
        { token: "string", foreground: "#D69D85" }, // Strings em uma cor de tom pêssego
      ],
    });

    //TODO: fix suggestions - suggesting instructions that are not in the instruction set
    let suggestions = keywords.map((k) => {
      return {
        label: k,
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: k,
      };
    });

      // TODO: check the impact of un-commenting this
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
    share.monacoEditor = editor;
    share.monaco = monaco;

    monaco.editor.setTheme(colorMode == "dark" ? "mipsdark" : "mipslight");

    // makes sure the editor mounts with the right code
    if(share.code != "") {
      editor.setValue(share.code);
    }
    else editor.setValue(defaultcode);
    
  }

  const defaultcode = share.defaultCode

  return (
    <Editor
      onChange={props.onEditorChange}
      height="80vh"
      defaultLanguage="mips"
      theme={colorMode == "dark" ? "mipsdark" : "mipslight"}
      defaultValue={
        "# MIPS Assembly Sim. by Reinaldo Assis \n# Project supervisor: prof. Bruno Costa\n\n"
      }
      options={{
        scrollBeyondLastLine: false,
        fontSize: 20,
      }}
      beforeMount={handleEditorWillMount}
      onMount={handleEditorDidMount}
    />
  );
}

export default AssemblyEditor;
