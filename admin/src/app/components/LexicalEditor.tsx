import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { EditorState } from "lexical";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import styles from "./LexicalEditor.module.css";  // Certifique-se de que o caminho está correto
import { Toolbar } from "./Toolbar"; 

const theme = {
  paragraph: "editor-paragraph",
  textBold: "editor-bold",
  textItalic: "editor-italic",
  textUnderline: "editor-underline",
  textCode: "editor-code",
};

interface LexicalEditorProps {
  onChange?: (editorState: EditorState) => void;
  className?: string;
}

export default function LexicalEditor({ onChange }: LexicalEditorProps) {
  const editorConfig = {
    namespace: "MyEditor",
    theme,
    onError(error: Error) {
      console.error("Lexical error:", error);
    },
  };

  const handleChange = (editorState: EditorState) => {
    console.log("Editor state changed:", editorState);
    onChange?.(editorState);
  };

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <Toolbar />
      <RichTextPlugin
        contentEditable={
          <ContentEditable className={styles.editor} />  // Usando styles.editor como fallback
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <OnChangePlugin onChange={handleChange} />
      <HistoryPlugin />
    </LexicalComposer>
  );
}
