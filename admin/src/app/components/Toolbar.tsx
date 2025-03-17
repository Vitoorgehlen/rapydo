"use client";
import { $getSelection, $isRangeSelection } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $patchStyleText } from "@lexical/selection";

export function Toolbar() {
  const [editor] = useLexicalComposerContext();

  const toggleFontSize = (delta: number) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, {
          "font-size": (currentStyle) => {
            const currentSize = currentStyle ? parseInt(currentStyle) : 16;
            const newSize = Math.max(8, currentSize + delta);
            return `${newSize}px`; // 🔹 Correção aqui!
          },
        });
      }
    });
  };

  const applyFormat = (format: "bold" | "italic") => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.formatText(format);
      }
    });
  };

  const toggleUnderline = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, {
          "text-decoration": (currentStyle) =>
            currentStyle === "underline" ? "none" : "underline",
        });
      }
    });
  };

  const applyCode = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.formatText("code");
      }
    });
  };

  return (
    <div className="toolbar">
      <button onClick={(e) => { e.preventDefault(); applyFormat("bold"); }}>B</button>
      <button onClick={(e) => { e.preventDefault(); applyFormat("italic"); }}>I</button>
      <button onClick={(e) => { e.preventDefault(); toggleUnderline(); }}>U</button>
      <button onClick={(e) => { e.preventDefault(); applyCode(); }}>{"</>"}</button>
      <button onClick={(e) => { e.preventDefault(); toggleFontSize(2); }}>A+</button>
      <button onClick={(e) => { e.preventDefault(); toggleFontSize(-2); }}>A-</button>
    </div>
  );
}
