import { useEffect, useRef, useState } from "react";

function CreatePage({
  addDownloadedImage,
  generatedImages,
  setGeneratedImages,
}) {
  const [prompt, setPrompt] = useState("");
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("flux");
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFetchingModels, setIsFetchingModels] = useState(true);
  const [seed, setSeed] = useState("");

  const submitRef = useRef();

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch("https://image.pollinations.ai/models");
        if (!response.ok) throw new Error("Failed to fetch models");
        const data = await response.json();
        setModels(data);
        setSelectedModel(data[0] || "flux");
      } catch (err) {
        console.error("Error fetching models:", err);
        setError("Failed to load models. Using default options.");
        setModels(["flux", "turbo"]);
        setSelectedModel("flux");
      } finally {
        setIsFetchingModels(false);
      }
    };
    fetchModels();
  }, []);

  const generateRandomSeed = () => {
    return Math.floor(Math.random() * 1000000000);
  };

  useEffect(() => {
    setSeed(generateRandomSeed().toString());
  }, []);

  const handleRatioChange = (ratio) => {
    switch (ratio) {
      case "1:1":
        setWidth(1024);
        setHeight(1024);
        break;
      case "16:9":
        setWidth(1920);
        setHeight(1080);
        break;
      case "4:3":
        setWidth(1600);
        setHeight(1200);
        break;
      case "3:2":
        setWidth(1200);
        setHeight(800);
        break;
      default:
        break;
    }
  };

  const handleDownload = async (imageUrl) => {
    try {
      addDownloadedImage({ url: imageUrl });

      const response = await fetch(imageUrl, { mode: "cors" });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      const ImageName = `ai-image-${Date.now()}.jpg`;
      link.setAttribute("download", ImageName);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      setError("Failed to download image.");
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedImages([]);

    // Determine the seed to use
    let baseSeed;
    if (seed) {
      baseSeed = parseInt(seed);
    } else {
      baseSeed = generateRandomSeed();
      setSeed(baseSeed.toString());
    }

    const imagesToGenerate = 9;
    const successfulImages = [];

    const loadImageWithTimeout = (url, seed) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        let timedOut = false;
        const timeout = setTimeout(() => {
          timedOut = true;
          reject(new Error("Image load timeout"));
        }, 10000);

        img.onload = () => {
          if (!timedOut) {
            clearTimeout(timeout);
            resolve({ url, seed });
          }
        };

        img.onerror = () => {
          if (!timedOut) {
            clearTimeout(timeout);
            reject(new Error("Image load failed"));
          }
        };

        img.src = url;
      });
    };

    try {
      for (let i = 0; i < imagesToGenerate; i++) {
        const currentSeed = baseSeed + i;
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
          `${prompt}${selectedModel ? `,model:${selectedModel}` : ""}`
        )}?width=${width}&height=${height}&seed=${currentSeed}`;

        try {
          const img = await loadImageWithTimeout(url, currentSeed);
          successfulImages.push(img);
        } catch {
          successfulImages.push({ url: null, seed: currentSeed });
        }
      }

      setGeneratedImages(successfulImages);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  submitRef.current = () => handleSubmit();

  const handleSeedChange = (e) => {
    setSeed(e.target.value);
  };

  return (
    <>
      <h2 className="text-4xl font-bold mb-8">
        Let's create a masterpiece! <span className="text-2xl">👋</span>
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="relative mb-8 rounded-full overflow-hidden border border-zinc-700 bg-zinc-900/10 backdrop-blur-sm">
          <div className="flex items-center">
            <div className="pl-5 pr-2">
              <svg
                className="w-5 h-5 text-zinc-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Create with Prompts"
              className="outline-none w-full py-4 px-2 bg-transparent text-white placeholder-zinc-400 text-lg"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              type="submit"
              className="bg-zinc-800 hover:bg-zinc-700 transition-colors p-4 mr-1 rounded-full"
              disabled={loading || isFetchingModels}
            >
              {loading ? (
                <svg
                  className="animate-spin h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-white transform rotate-90"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </form>

      <div className="border border-zinc-700/70 mb-6 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">Advanced Settings</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Model
            </label>
            {isFetchingModels ? (
              <div className="animate-pulse h-10 bg-zinc-800/50 rounded-md"></div>
            ) : (
              <select
                className="w-full px-3 py-2 bg-zinc-900/10 border border-zinc-700/70 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={isFetchingModels}
              >
                {models.map((model) => (
                  <option key={model} value={model} className="bg-zinc-900">
                    {model}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Seed (for reproducible results)
            </label>
            <input
              type="number"
              className="w-full bg-zinc-900/10 px-3 py-2 border border-zinc-700/70 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Random seed will be generated"
              value={seed}
              onChange={handleSeedChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Width
            </label>
            <input
              type="number"
              className="w-full bg-zinc-900/10 px-3 py-2 border border-zinc-700/70 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Height
            </label>
            <input
              type="number"
              className="w-full bg-zinc-900/10 px-3 py-2 border border-zinc-700/70 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Aspect Ratio Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {["1:1", "16:9", "4:3", "3:2"].map((r) => (
                <button
                  key={r}
                  type="button"
                  className="rounded-md border border-zinc-700 px-2 py-1 text-xs hover:bg-zinc-700/30 transition"
                  onClick={() => handleRatioChange(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md p-2 bg-red-600 mb-6 max-w-xl">{error}</div>
      )}

      <div>
        <h3 className="text-zinc-200 mb-4 font-bold text-lg">Result</h3>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <svg
              className="animate-spin h-12 w-12 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {generatedImages.map((image, index) => (
              <div
                key={`${image.seed}-${index}`}
                className="image-card rounded-xl overflow-hidden relative"
              >
                <div className="absolute bottom-2 right-2 p-1">
                  <button
                    onClick={() => image.url && handleDownload(image.url)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="cursor-pointer lucide lucide-image-down"
                    >
                      <path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21" />
                      <path d="m14 19 3 3v-5.5" />
                      <path d="m17 22 3-3" />
                      <circle cx="9" cy="9" r="2" />
                    </svg>
                  </button>
                </div>
                {image.url ? (
                  <img
                    src={image.url}
                    alt={`Generated ${index + 1}`}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center text-red-500 bg-zinc-800 text-sm">
                    Unable to load
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default CreatePage;