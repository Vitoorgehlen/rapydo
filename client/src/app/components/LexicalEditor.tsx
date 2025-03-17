"use client";

import { useEffect } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { EditorThemeClasses } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ParagraphNode, TextNode } from "lexical";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import styles from "./LexicalEditor.module.css";

const theme: EditorThemeClasses = {
  paragraph: "editor-paragraph",
  textBold: "editor-bold",
  textItalic: "editor-italic",
  textUnderline: "editor-underline",
  textCode: "editor-code"

};

const DEFAULT_EDITOR_STATE = JSON.stringify({
  root: {
    children: [{ type: "paragraph", children: [{ text: "" }] }],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
});

// 🔹 Componente para restaurar o estado salvo
const RestoreEditorState = ({ content }: { content: string }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    console.log({content, editor})
    let validContent =
      typeof content === "string" ? content : JSON.stringify(content);

    try {
      const parsedContent = JSON.parse(validContent);

      if (!parsedContent?.root || parsedContent.root.type !== "root") {
        console.warn("JSON inválido, usando estado padrão.");
        validContent = DEFAULT_EDITOR_STATE;
      }

      const editorState = editor.parseEditorState(validContent);
      editor.setEditorState(editorState);
    } catch (error) {
      console.error("Erro ao restaurar o estado do editor:", error);
      localStorage.removeItem("editorState");
      editor.setEditorState(editor.parseEditorState(DEFAULT_EDITOR_STATE));
    }
  }, [content, editor]);

  return null;
};

// 🔹 Componente para salvar automaticamente o conteúdo
const SaveEditorState = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      const json = editorState.toJSON();
      localStorage.setItem("editorState", JSON.stringify(json));
    });
  }, [editor]);

  return null;
};

// 🔹 Componente Principal do Editor com suporte a readOnly
export default function LexicalEditor({ content, readOnly = false, className }: { content: string; readOnly?: boolean; className?: string }) {
  const safeContent = (() => {
    try {
      if (typeof content === "string" && content.startsWith("{")) {
        return content;
      }
      return JSON.stringify(content || JSON.parse(DEFAULT_EDITOR_STATE));
    } catch {
      return DEFAULT_EDITOR_STATE;
    }
  })();

  return (
    <LexicalComposer
      initialConfig={{
        namespace: "MyEditor",
        theme,
        onError: (error) => console.error("Erro no editor:", error),
        editable: !readOnly,
        nodes: [ParagraphNode, TextNode, HeadingNode, QuoteNode],
      }}
    >
      <RestoreEditorState content={safeContent} />
      {!readOnly && <SaveEditorState />}
      <RichTextPlugin
        contentEditable={<ContentEditable className={`${styles.editor} ${className || ""}`} />} 
        placeholder={null}
        ErrorBoundary={LexicalErrorBoundary}
      />
    </LexicalComposer>
  );
}