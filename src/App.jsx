import { useState } from "react";
import CreatePage from "./CreatePage";
import DownloadPage from "./DownloadPage";

function App() {
  const [route, setRoute] = useState("create");
  const [downloadedImages, setDownloadedImages] = useState([]);
  const [generatedImages, setGeneratedImages] = useState([]);

  const addDownloadedImage = (imageObj) => {
    setDownloadedImages((prev) => {
      const exists = prev.some((img) => img.url === imageObj.url);
      if (exists) return prev;
      return [...prev, { url: imageObj.url, id: Date.now() }];
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="flex items-center mb-12 justify-between">
        <div className="flex items-center">
          <img src="/public/logo.svg" className="h-10" alt="AI Studio" />
        </div>
        <ul className="ml-4 text-sm text-zinc-400 flex gap-8">
          <a
            href="#create"
            onClick={(e) => {
              e.preventDefault();
              setRoute("create");
            }}
            className={`hover:text-zinc-200 cursor-pointer transition-all ${
              route === "create" ? "font-medium text-zinc-200" : ""
            }`}
          >
            Create Image
          </a>
          <a
            href="#download"
            onClick={(e) => {
              e.preventDefault();
              setRoute("download");
            }}
            className={`hover:text-zinc-200 cursor-pointer transition-all ${
              route === "download" ? "font-medium text-zinc-200" : ""
            }`}
          >
            Downloaded
          </a>
        </ul>
      </header>

      <div className="fixed -bottom-1/4 -right-0">
        <div className="h-96 w-96 bg-gradient-to-r from-pink-600 to-indigo-400 rotate-90 rounded-full blur-[180px]"></div>
      </div>

      <main className="relative z-10">
        {route === "create" ? (
          <CreatePage
            addDownloadedImage={addDownloadedImage}
            generatedImages={generatedImages}
            setGeneratedImages={setGeneratedImages}
          />
        ) : (
          <DownloadPage downloadedImages={downloadedImages} />
        )}
      </main>
    </div>
  );
}

export default App;
