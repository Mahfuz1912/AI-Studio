import { useEffect, useRef, useState } from "react";

function CreatePage({
  addDownloadedImage,
  generatedImages,
  setGeneratedImages,
  prompt,
  setPrompt,
  selectedModel,
  setSelectedModel,
  width,
  setWidth,
  height,
  setHeight,
  seed,
  setSeed,
  selectedStyle,
  setSelectedStyle,
}) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFetchingModels, setIsFetchingModels] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  const submitRef = useRef();

  const stylePresets = [
    { name: "Realistic", prompt: "realistic, highly detailed, 8k" },
    { name: "Anime", prompt: "anime style, vibrant colors" },
    { name: "Watercolor", prompt: "watercolor painting, artistic" },
    { name: "Cyberpunk", prompt: "cyberpunk style, neon lights" },
    { name: "Minimalist", prompt: "minimalist, simple, clean" },
    { name: "Fantasy", prompt: "fantasy art, magical, dreamy" },
  ];

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

  // Generate seed on initial load
  useEffect(() => {
    if (!seed) {
      setSeed(generateRandomSeed().toString());
    }
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

  const applyStyle = (style) => {
    let newPrompt = prompt;
    if (selectedStyle) {
      newPrompt = newPrompt.replace(`, ${selectedStyle.prompt}`, "").trim();
    }

    newPrompt = newPrompt ? `${newPrompt} , ${style.prompt}` : style.prompt;

    setPrompt(newPrompt);
    setSelectedStyle(style);
  };

  const openImageDetails = (image) => {
    setSelectedImage({
      ...image,
      prompt: prompt,
      model: selectedModel,
      width: width,
      height: height,
    });
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handleDownload = async (imageUrl) => {
    try {
      addDownloadedImage({
        url: imageUrl,
        prompt: prompt,
        model: selectedModel,
        seed: seed,
        width: width,
        height: height,
      });

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
        )}?width=${width}&height=${height}&seed=${currentSeed}&nologo=true`;

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
              Style Presets
            </label>
            <select
              className="w-full px-3 py-2 bg-zinc-900/10 border border-zinc-700/70 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={selectedStyle?.name || ""}
              onChange={(e) => {
                const selected = stylePresets.find(
                  (style) => style.name === e.target.value
                );
                if (selected) {
                  applyStyle(selected);
                } else {
                  setSelectedStyle(null);
                  if (selectedStyle) {
                    setPrompt((prev) =>
                      prev.replace(`, ${selectedStyle.prompt}`, "").trim()
                    );
                  }
                }
              }}
            >
              <option value="" className="bg-zinc-900">
                No Style
              </option>
              {stylePresets.map((style) => (
                <option
                  key={style.name}
                  value={style.name}
                  className="bg-zinc-900"
                >
                  {style.name}
                </option>
              ))}
            </select>
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
                <div
                  className="cursor-pointer"
                  onClick={() => image.url && openImageDetails(image)}
                >
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
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-extrabold">Image Details</h3>
                <button
                  onClick={closeModal}
                  className="text-zinc-400 cursor-pointer hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex justify-center">
                  <img
                    src={selectedImage.url}
                    alt="Detailed view"
                    className="max-h-[70vh] max-w-full rounded-lg"
                  />
                </div>
                <div>
                  <div className="space-y-4">
                    <div>
                      <h4 className=" font-medium text-zinc-400">Prompt</h4>
                      <p className="text-white text-sm">
                        {selectedImage.prompt}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-zinc-400">Model</h4>
                      <p className="text-white text-sm">
                        {selectedImage.model}
                      </p>
                    </div>
                    <div>
                      <h4 className=" font-medium text-zinc-400">Seed</h4>
                      <p className="text-white text-sm">{selectedImage.seed}</p>
                    </div>
                    <div>
                      <h4 className=" font-medium text-zinc-400">Resolution</h4>
                      <p className="text-white text-sm">
                        {selectedImage.width} × {selectedImage.height}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(selectedImage.url)}
                    className="mt-6 bg-blue-600 cursor-pointer hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download Image
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CreatePage;