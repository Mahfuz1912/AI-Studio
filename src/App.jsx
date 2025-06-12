import { useEffect, useState } from "react";
import CreatePage from "./CreatePage";
import DownloadPage from "./DownloadPage";
import IMG from "/public/logo.svg";

function App() {
  const [route, setRoute] = useState("create");
  const [downloadedImages, setDownloadedImages] = useState(() => {
    const saved = localStorage.getItem("downloadedImages");
    return saved ? JSON.parse(saved) : [];
  });
  const [generatedImages, setGeneratedImages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("flux");
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [seed, setSeed] = useState("");
  const [selectedStyle, setSelectedStyle] = useState(null);

  useEffect(() => {
    localStorage.setItem("downloadedImages", JSON.stringify(downloadedImages));
  }, [downloadedImages]);

  const addDownloadedImage = (imageObj) => {
    setDownloadedImages((prev) => {
      const exists = prev.some((img) => img.url === imageObj.url);
      if (exists) return prev;
      const newImage = {
        ...imageObj,
        id: Date.now(),
        prompt: imageObj.prompt || "",
        model: imageObj.model || "",
        seed: imageObj.seed || "",
        width: imageObj.width || 0,
        height: imageObj.height || 0,
        tags: imageObj.tags || [],
      };
      return [newImage, ...prev];
    });
  };

  const deleteDownloadedImage = (id) => {
    setDownloadedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const updateImageMetadata = (id, updates) => {
    setDownloadedImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, ...updates } : img))
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="flex items-center mb-12 justify-between">
        <div className="flex items-center">
          <img src={IMG} className="h-10" alt="AI Studio" />
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
            Downloads ({downloadedImages.length})
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
            prompt={prompt}
            setPrompt={setPrompt}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            width={width}
            setWidth={setWidth}
            height={height}
            setHeight={setHeight}
            seed={seed}
            setSeed={setSeed}
            selectedStyle={selectedStyle}
            setSelectedStyle={setSelectedStyle}
          />
        ) : (
          <DownloadPage
            downloadedImages={downloadedImages}
            deleteImage={deleteDownloadedImage}
            updateImageMetadata={updateImageMetadata}
          />
        )}
      </main>
    </div>
  );
}

export default App;
