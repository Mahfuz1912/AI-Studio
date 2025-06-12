import { saveAs } from "file-saver";
import { useState } from "react";

function DownloadPage({ downloadedImages, deleteImage, updateImageMetadata }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedImages, setSelectedImages] = useState([]);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);

  const openImageDetails = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const toggleSelectImage = (id) => {
    setSelectedImages((prev) =>
      prev.includes(id) ? prev.filter((imgId) => imgId !== id) : [...prev, id]
    );
  };

  const handleBulkDownload = async () => {
    setIsBulkDownloading(true);
    try {
      for (const id of selectedImages) {
        const image = downloadedImages.find((img) => img.id === id);
        if (image) {
          const response = await fetch(image.url);
          const blob = await response.blob();
          saveAs(blob, `ai-image-${image.id}.jpg`);
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    } catch (err) {
      console.error("Bulk download error:", err);
    } finally {
      setIsBulkDownloading(false);
      setSelectedImages([]);
    }
  };

  const handleRemoveSelected = () => {
    selectedImages.forEach((id) => deleteImage(id));
    setSelectedImages([]);
  };

  const filteredImages = downloadedImages.filter(
    (image) =>
      image.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (image.tags &&
        image.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ))
  );

  const sortedImages = [...filteredImages].sort((a, b) => {
    if (sortBy === "newest") return b.id - a.id;
    if (sortBy === "oldest") return a.id - b.id;
    return 0;
  });

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-bold">
          Downloads <span className="text-2xl">👋</span>
        </h2>
        {selectedImages.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleRemoveSelected}
              className="bg-red-600 hover:bg-red-700 cursor-pointer text-white py-2 px-4 rounded-md flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Remove Selected
            </button>
            <button
              onClick={handleBulkDownload}
              disabled={isBulkDownloading}
              className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center gap-2"
            >
              {isBulkDownloading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                  Downloading {selectedImages.length} images...
                </>
              ) : (
                <>
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
                  Download Selected ({selectedImages.length})
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
            placeholder="Search images..."
            className="pl-10 pr-4 py-2 w-full bg-zinc-900/10 border border-zinc-700/70 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="flex gap-4">
          <select
            className="px-3 py-2 bg-zinc-900/10 border border-zinc-700/70 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      <div>
        {sortedImages.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {sortedImages.map((image) => (
                <div
                  key={image.id}
                  className={`image-card rounded-xl overflow-hidden relative transition-all ${
                    selectedImages.includes(image.id)
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                >
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedImages.includes(image.id)}
                      onChange={() => toggleSelectImage(image.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 cursor-pointer rounded border-zinc-700 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  {!selectedImages.includes(image.id) && (
                    <div
                      className="absolute cursor-pointer top-2 right-2 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteImage(image.id);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-red-500 hover:text-red-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </div>
                  )}

                  <img
                    src={image.url}
                    alt={image.prompt || "Downloaded image"}
                    className="w-full h-48 object-cover"
                    onClick={() => openImageDetails(image)}
                  />
                  <div
                    className="p-2 bg-zinc-900/80 text-xs text-zinc-300 line-clamp-2"
                    onClick={() => openImageDetails(image)}
                  >
                    {image.prompt}
                  </div>
                </div>
              ))}
            </div>

            {selectedImage && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-zinc-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold">Image Details</h3>
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
                          className="max-h-[70vh] max-w-full rounded-lg object-contain"
                        />
                      </div>
                      <div>
                        <div className="space-y-4">
                          <div>
                            <label className="font-medium text-zinc-400">
                              Prompt
                            </label>
                            <input
                              className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white mt-1"
                              value={selectedImage.prompt}
                              onChange={(e) =>
                                updateImageMetadata(selectedImage.id, {
                                  prompt: e.target.value,
                                })
                              }
                              rows={3}
                            />
                          </div>
                          <div>
                            <label className="font-medium text-zinc-400">
                              Tags (comma separated)
                            </label>
                            <input
                              type="text"
                              className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white mt-1"
                              value={selectedImage.tags?.join(", ") || ""}
                              onChange={(e) =>
                                updateImageMetadata(selectedImage.id, {
                                  tags: e.target.value
                                    .split(",")
                                    .map((tag) => tag.trim())
                                    .filter((tag) => tag),
                                })
                              }
                              placeholder="Simple Image"
                            />
                          </div>
                          <div>
                            <label className="font-medium text-zinc-400">
                              Model
                            </label>
                            <p className="text-white text-sm">
                              {selectedImage.model}
                            </p>
                          </div>
                          <div>
                            <label className="font-medium text-zinc-400">
                              Seed
                            </label>
                            <p className="text-white text-sm">
                              {selectedImage.seed}
                            </p>
                          </div>
                          <div>
                            <label className="font-medium text-zinc-400">
                              Resolution
                            </label>
                            <p className="text-white text-sm">
                              {selectedImage.width} × {selectedImage.height}
                            </p>
                          </div>
                          <div>
                            <label className="font-medium text-zinc-400">
                              Created
                            </label>
                            <p className="text-white text-sm">
                              {new Date(selectedImage.id).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="mt-6 flex gap-3">
                          <button
                            onClick={() => {
                              saveAs(
                                selectedImage.url,
                                `ai-image-${selectedImage.id}.jpg`
                              );
                              closeModal();
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center gap-2 cursor-pointer"
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
                            Download
                          </button>
                          <button
                            onClick={() => {
                              deleteImage(selectedImage.id);
                              closeModal();
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md flex items-center gap-2 cursor-pointer"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-zinc-400">
            {searchTerm
              ? "No images match your search."
              : "No images downloaded yet. Generate and download some images first."}
          </div>
        )}
      </div>
    </>
  );
}

export default DownloadPage;
