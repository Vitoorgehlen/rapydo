// "use client";

// import { useEffect } from "react";
// import { LexicalComposer } from "@lexical/react/LexicalComposer";
// import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
// import { ContentEditable } from "@lexical/react/LexicalContentEditable";
// import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
// import { EditorThemeClasses } from "lexical";
// import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
// import { ParagraphNode, TextNode } from "lexical";
// import { HeadingNode, QuoteNode } from "@lexical/rich-text";
// import styles from "./LexicalEditor.module.css";

// const theme: EditorThemeClasses = {
//   paragraph: "editor-paragraph",
//   textBold: "editor-bold",
//   textItalic: "editor-italic",
//   textUnderline: "editor-underline",
// };

// const DEFAULT_EDITOR_STATE = JSON.stringify({
//   root: {
//     children: [{ type: "paragraph", children: [{ text: "" }] }],
//     direction: "ltr",
//     format: "",
//     indent: 0,
//     type: "root",
//     version: 1,
//   },
// });

// const RestoreEditorState = ({ content }: { content: string }) => {
//   const [editor] = useLexicalComposerContext();

//   useEffect(() => {
//     let validContent = typeof content === "string" ? content : JSON.stringify(content);

//     if (!validContent || validContent.trim() === "") {
//       console.warn("Conteúdo vazio, usando estado padrão.");
//       validContent = DEFAULT_EDITOR_STATE;
//     }

//     try {
//       const parsedContent = JSON.parse(validContent);

//       if (!parsedContent.root || parsedContent.root.type !== "root") {
//         console.warn("JSON inválido, usando estado padrão.");
//         validContent = DEFAULT_EDITOR_STATE;
//       }

//       const editorState = editor.parseEditorState(validContent);

//       if (!editorState.isEmpty()) {
//         editor.setEditorState(editorState);
//       } else {
//         console.warn("EditorState inválido, resetando para padrão.");
//         editor.setEditorState(editor.parseEditorState(DEFAULT_EDITOR_STATE));
//       }
//     } catch (error) {
//       console.error("Erro ao restaurar o estado do editor:", error, "Conteúdo:", validContent);
//       editor.setEditorState(editor.parseEditorState(DEFAULT_EDITOR_STATE));
//     }
//   }, [content, editor]);

//   return null;
// };

// export default function LexicalEditor({ content }: { content: string }) {
//   const safeContent =
//     typeof content === "string" && content.startsWith("{") ? content : JSON.stringify(content || DEFAULT_EDITOR_STATE);

//   return (
//     <LexicalComposer
//       initialConfig={{
//         namespace: "MyEditor",
//         theme,
//         onError: (error) => console.error("Erro no editor:", error),
//         editable: false,
//         nodes: [ParagraphNode, TextNode, HeadingNode, QuoteNode],
//       }}
//     >
//       <RestoreEditorState content={safeContent} />
//       <RichTextPlugin contentEditable={<ContentEditable className={styles.editor} />} placeholder={null} ErrorBoundary={LexicalErrorBoundary} />
//     </LexicalComposer>
//   );
// }
