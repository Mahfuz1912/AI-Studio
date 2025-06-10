function DownloadPage({ downloadedImages }) {
  return (
    <>
      <h2 className="text-4xl font-bold mb-8">
        Downloaded <span className="text-2xl">👋</span>
      </h2>

      <div>
        {downloadedImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {downloadedImages.map((image, index) => (
              <div
                key={`${image.url}-${index}`}
                className="image-card rounded-xl overflow-hidden relative"
              >
                <img
                  src={image.url}
                  alt={`Downloaded image ${index + 1}`}
                  className="w-full h-48 object-cover"
                />
              </div>
            ))}
          </div>
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
