const LoadingSpinner = () => (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-white border-b-4" />
  </div>
);

export default LoadingSpinner;
