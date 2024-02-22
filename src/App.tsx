import "./App.css";
import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?worker";
import type { TextItem } from "pdfjs-dist/types/src/display/api";

pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker();

function App() {
  const [hasFileBeenSelected, setHasFileBeenSelected] = useState(false);
  const [text, setText] = useState<string>("");

  function readArrayBufferFromFile(file: File) {
    const reader = new FileReader();
    reader.onload = async function (event) {
      const arrayBuffer = event.target!.result!;
      if (arrayBuffer instanceof ArrayBuffer) {
        const loadingTask = pdfjsLib.getDocument(arrayBuffer);
        return loadingTask.promise.then(async function (pdf) {
          const totalPageCount = pdf.numPages;
          const countPromises = [];
          for (
            let currentPage = 1;
            currentPage <= totalPageCount;
            currentPage++
          ) {
            const page = pdf.getPage(currentPage);
            countPromises.push(
              page.then(async function (page) {
                const textContent = page.getTextContent();
                const text = await textContent;
                return text.items.map(function (s) {
                  const textItem = s as TextItem;
                  console.log(textItem.str);
                  return textItem.str;
                });
              }),
            );
          }
          const texts = await Promise.all(countPromises);
          console.log(texts);
          setText(texts.flat(2).join("\n"));
        });
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setHasFileBeenSelected(true);
    readArrayBufferFromFile(event.target.files![0]);
  }

  return hasFileBeenSelected ? (
    <>
      <p>Worked! Here's the text:</p>
      <p>{text}</p>
    </>
  ) : (
    <>
      <label htmlFor="pdf_input">Select a pdf file</label>
      <input
        type="file"
        id="pdf_input"
        name="pdf_input"
        accept=".pdf"
        style={{ opacity: 0 }}
        onChange={handleInputChange}
      />
    </>
  );
}

export default App;
