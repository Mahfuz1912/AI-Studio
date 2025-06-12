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
  const [generationCache, setGenerationCache] = useState({});

  const submitRef = useRef();

  const stylePresets = [
    {
      name: "Realistic",
      prompt:
        "realistic, highly detailed, 4k, lifelike images with fine details and natural textures",
    },
    {
      name: "Watercolor",
      prompt:
        "watercolor painting, artistic, soft and flowing paint effect resembling hand-drawn watercolor artwork",
    },
    {
      name: "Anime",
      prompt:
        "anime style, vibrant colors, stylized characters and scenes inspired by Japanese anime art",
    },
    {
      name: "Cyberpunk",
      prompt:
        "cyberpunk style, neon lights, futuristic scenes with neon glow and dark tones",
    },
    {
      name: "Minimalist",
      prompt:
        "minimalist, simple, clean, minimal elements with soft colors and a modern aesthetic",
    },
    {
      name: "Fantasy",
      prompt:
        "fantasy art, magical, dreamy, mystical environments and characters from a fantasy world",
    },
    {
      name: "Oil Painting",
      prompt:
        "oil painting, textured brush strokes, classic painting style with rich color blending",
    },
    {
      name: "Pixel Art",
      prompt:
        "pixel art, 8-bit style, retro pixel-style visuals like old-school video games",
    },
    {
      name: "Sketch",
      prompt:
        "pencil sketch, hand drawn, black and white hand-drawn appearance with fine lines",
    },
    {
      name: "3D Render",
      prompt:
        "3d render, CGI, realistic lighting, computer-generated depth and lighting like 3D modeling",
    },
    {
      name: "Cartoon",
      prompt:
        "cartoon style, bold lines, bright colors, playful and exaggerated features like animations",
    },
    {
      name: "Surreal",
      prompt:
        "surrealism, dreamlike, abstract, imaginative visuals that challenge reality",
    },
    {
      name: "Logo (Generic)",
      prompt:
        "minimalist logo design, flat vector style, high contrast, modern, clean lines, branding quality, white background",
    },
    {
      name: "Logo (Tech Company)",
      prompt:
        "technology logo, flat design, blue color scheme, futuristic, vector style, professional, branding ready",
    },
    {
      name: "Logo (Game Studio)",
      prompt:
        "gaming logo, emblem style, aggressive, vibrant colors, neon highlights, esport team logo, bold vector style",
    },
    {
      name: "Logo (Organic Product)",
      prompt:
        "eco-friendly logo, green color palette, natural elements, leaves and plants, hand-drawn vector style",
    },
    {
      name: "Logo (Fashion Brand)",
      prompt:
        "luxury fashion brand logo, elegant serif font, black and gold, minimal, high-end branding aesthetic",
    },
  ];

  // ... (stylePresets array remains the same)

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
  }, [setSelectedModel]);

  const generateRandomSeed = () => {
    return Math.floor(Math.random() * 1000000000);
  };

  // Generate seed on initial load
  useEffect(() => {
    if (!width) setWidth(1024);
    if (!height) setHeight(1024);
  }, [setWidth, setHeight, width, height]);

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
    setSelectedStyle(style);
  };

  const getFullPrompt = () => {
    return selectedStyle
      ? `${prompt}${prompt ? ", " : ""}${selectedStyle.prompt}`
      : prompt;
  };

  const openImageDetails = (image) => {
    setSelectedImage({
      ...image,
      prompt: prompt,
      model: selectedModel,
      width: width,
      height: height,
      style: selectedStyle?.name || null,
      timestamp: new Date().toISOString(),
    });
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handleDownload = async (imageUrl) => {
    try {
      const headResponse = await fetch(imageUrl, { method: "HEAD" });
      if (!headResponse.ok) throw new Error("Image not available");

      const imageData = {
        url: imageUrl,
        prompt: prompt,
        model: selectedModel,
        seed: seed,
        width: width,
        height: height,
        style: selectedStyle?.name || null,
        timestamp: new Date().toISOString(),
      };

      addDownloadedImage(imageData);

      const response = await fetch(imageUrl, { mode: "cors" });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      const imageName = `ai-image-${Date.now()}.jpg`;
      link.setAttribute("download", imageName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      setError(`Failed to download image: ${err.message}`);
    }
  };

  const generateImageBatch = async (startIndex, count, passedSeed = null) => {
    const fullPrompt = getFullPrompt();
    const batchImages = [];

    const loadImageWithTimeout = (url, seed) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        let timedOut = false;
        const timeout = setTimeout(() => {
          timedOut = true;
          reject(new Error("Image load timeout"));
        }, 15000);

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

    for (let i = 0; i < count; i++) {
      const currentSeed = passedSeed ? passedSeed + startIndex + i : null;
      const baseUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
        `${fullPrompt}${selectedModel ? `,model:${selectedModel}` : ""}`
      )}?width=${width}&height=${height}&nologo=true`;

      const url = currentSeed ? `${baseUrl}&seed=${currentSeed}` : baseUrl;

      try {
        const img = await loadImageWithTimeout(url, currentSeed);
        batchImages.push(img);
      } catch {
        batchImages.push({ url: null, seed: currentSeed });
      }
    }

    return batchImages;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const fullPrompt = getFullPrompt();
    if (!fullPrompt.trim()) {
      setError("Please enter a prompt");
      return;
    }
    let currentSeed = seed;
    if (!currentSeed || currentSeed.toString().trim() === "") {
      currentSeed = generateRandomSeed();
      setSeed(currentSeed);
    }

    // Caching logic
    const cacheKey = `${fullPrompt}-${
      currentSeed || "random"
    }-${selectedModel}-${width}-${height}-${selectedStyle?.name || "no-style"}`;

    if (generationCache[cacheKey]) {
      setGeneratedImages(generationCache[cacheKey]);
      return;
    }

    setLoading(true);
    try {
      const firstBatch = await generateImageBatch(
        0,
        9,
        currentSeed ? parseInt(currentSeed) : null
      );
      setGeneratedImages(firstBatch);
      setGenerationCache((prev) => ({ ...prev, [cacheKey]: firstBatch }));
    } catch {
      setError("Failed to generate images.");
    } finally {
      setLoading(false);
    }
  };
  submitRef.current = () => handleSubmit();

  const handleSeedChange = (e) => {
    const value = e.target.value;
    // Allow empty string or valid numbers
    if (value === "" || (!isNaN(value) && parseInt(value) >= 0)) {
      setSeed(value);
    }
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
                applyStyle(selected || null);
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
              Width
            </label>
            <input
              type="number"
              className="w-full bg-zinc-900/10 px-3 py-2 border border-zinc-700/70 rounded-md"
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
              className="w-full bg-zinc-900/10 px-3 py-2 border border-zinc-700/70 rounded-md"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Seed (for reproducible results)
            </label>
            <input
              type="number"
              className="w-full bg-zinc-900/10 px-3 py-2 border border-zinc-700/70 rounded-md"
              value={seed || ""}
              placeholder="Leave Empty OR Set Seed"
              onChange={handleSeedChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Aspect Ratio Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { ratio: "1:1", width: 1024, height: 1024 },
                { ratio: "16:9", width: 1920, height: 1080 },
                { ratio: "4:3", width: 1600, height: 1200 },
                { ratio: "3:2", width: 1200, height: 800 },
              ].map((preset) => {
                const isActive =
                  width === preset.width && height === preset.height;
                return (
                  <button
                    key={preset.ratio}
                    type="button"
                    className={`rounded-md border px-2 py-1 text-xs transition ${
                      isActive
                        ? "bg-blue-600 border-blue-600"
                        : "border-zinc-700 hover:bg-zinc-700/30"
                    }`}
                    onClick={() => handleRatioChange(preset.ratio)}
                  >
                    {preset.ratio}
                  </button>
                );
              })}
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {generatedImages.map((image, index) => (
              <div
                key={index}
                className="image-card rounded-xl overflow-hidden relative bg-zinc-800"
              >
                {image.url ? (
                  <img
                    src={image.url}
                    alt={`Generated ${index + 1}`}
                    className="w-full h-48 object-cover"
                    onClick={() => image.url && openImageDetails(image)}
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center text-red-500">
                    Unable to load
                  </div>
                )}
                <div className="absolute bottom-2 right-2 p-1">
                  {image.url && (
                    <button onClick={() => handleDownload(image.url)}>
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
                  )}
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
                      <h4 className="font-medium text-zinc-400">Prompt</h4>
                      <p className="text-white text-sm">
                        {selectedImage.prompt}
                      </p>
                    </div>
                    {selectedImage.style && (
                      <div>
                        <h4 className="font-medium text-zinc-400">Style</h4>
                        <p className="text-white text-sm">
                          {selectedImage.style}
                        </p>
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-zinc-400">Model</h4>
                      <p className="text-white text-sm">
                        {selectedImage.model}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-zinc-400">Seed</h4>
                      <p className="text-white text-sm">{selectedImage.seed}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-zinc-400">Resolution</h4>
                      <p className="text-white text-sm">
                        {selectedImage.width} × {selectedImage.height}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-zinc-400">Created</h4>
                      <p className="text-white text-sm">
                        {new Date(selectedImage.timestamp).toLocaleString()}
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
