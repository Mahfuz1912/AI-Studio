import { useState } from "react";
function DownloadPage({ downloadedImages }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const openImageDetails = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <h2 className="text-4xl font-bold mb-8">
        Downloaded <span className="text-2xl">👋</span>
      </h2>

      <div>
        {downloadedImages.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {downloadedImages.map((image, index) => (
                <div
                  key={`${image.url}-${index}`}
                  className="image-card rounded-xl overflow-hidden relative cursor-pointer"
                  onClick={() => openImageDetails(image)}
                >
                  <img
                    src={image.url}
                    alt={`Downloaded image ${index + 1}`}
                    className="w-full h-48 object-cover"
                  />
                </div>
              ))}
            </div>

            {selectedImage && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-zinc-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold">Downloaded Image</h3>
                      <button
                        onClick={closeModal}
                        className="text-zinc-400 hover:text-white"
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

                    <div className="flex justify-center">
                      <img
                        src={selectedImage.url}
                        alt="Detailed view"
                        className="overflow-hidden rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-zinc-400">
            No images downloaded yet. Generate and download some images first.
          </div>
        )}
      </div>
    </>
  );
}

export default DownloadPage;