import { AppProps } from "next/app";
import "../styles/globals.css";


export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

// import { useState } from "react";
// import dynamic from "next/dynamic";

// const MonacoEditor = dynamic(import("react-monaco-editor"), { ssr: false });

// export default function App({ Component, pageProps }: AppProps) {
//   const [postBody, setPostBody] = useState("");

//   return (<div>
//     <MonacoEditor
//       editorDidMount={() => {
//         window.MonacoEnvironment.getWorkerUrl = (
//           _moduleId: string,
//           label: string
//         ) => {
//           if (label === "json")
//             return "_next/static/json.worker.js";
//           if (label === "css")
//             return "_next/static/css.worker.js";
//           if (label === "html")
//             return "_next/static/html.worker.js";
//           if (
//             label === "typescript" ||
//             label === "javascript"
//           )
//             return "_next/static/ts.worker.js";
//           return "_next/static/editor.worker.js";
//         };
//       }}
//       width="800"
//       height="600"
//       language="markdown"
//       theme="vs-dark"
//       value={postBody}
//       options={{
//         minimap: {
//           enabled: false
//         }
//       }}
//       onChange={setPostBody}
//     />
//   </div>)
// }