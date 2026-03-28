"use client";

import { useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun?: () => void;
  disabled?: boolean;
  tableNames?: string[];
}

const keywordCompletions = [
  "SELECT", "FROM", "WHERE", "JOIN", "LEFT JOIN", "INNER JOIN",
  "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "OFFSET", "AS",
  "ON", "AND", "OR", "NOT", "IN", "EXISTS", "BETWEEN", "LIKE",
  "IS NULL", "IS NOT NULL", "COUNT", "SUM", "AVG", "MIN", "MAX",
  "DISTINCT", "CASE", "WHEN", "THEN", "ELSE", "END",
  "ROUND", "COALESCE", "NULLIF", "CAST",
]

export function SqlEditor({ value, onChange, onRun, disabled, tableNames = [] }: SqlEditorProps) {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (!disabled && onRun) onRun();
    });

    monaco.languages.registerCompletionItemProvider("sql", {
      provideCompletionItems: (model:any, position:any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const tableCompletions = tableNames.map((name) => ({
          label: name,
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: name,
          range,
          detail: "Table",
        }));

        keywordCompletions.map((kw) => ({
          label: kw,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: kw,
          range,
        }));

        return { suggestions: [...tableCompletions, ...keywordCompletions] };
      },
    });

    editor.focus();
  };

  return (
    <div className="h-full w-full overflow-hidden rounded-b-none">
      <Editor
        height="100%"
        defaultLanguage="sql"
        value={value}
        onChange={(val) => onChange(val ?? "")}
        onMount={handleMount}
        theme="vs-dark"
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          lineNumbers: "on",
          roundedSelection: true,
          cursorStyle: "line",
          wordWrap: "on",
          tabSize: 2,
          renderLineHighlight: "line",
          scrollbar: {
            vertical: "auto",
            horizontal: "auto",
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
          },
          suggest: { showKeywords: true },
          quickSuggestions: { other: true, comments: false, strings: false },
          readOnly: disabled,
          contextmenu: false,
        }}
      />
    </div>
  );
}