import React, { useRef, useEffect } from "react";
import * as monaco from "monaco-editor";

const CodeEditor = ({ code, language }) => {
  const editorRef = useRef();

  useEffect(() => {
    const editor = monaco.editor.create(editorRef.current, {
      value: code,
      language,
    });

    return () => {
      editor.dispose();
    };
  }, [code, language]);

  return <div ref={editorRef} style={{ height: "500px" }}></div>;
};

export default CodeEditor;
