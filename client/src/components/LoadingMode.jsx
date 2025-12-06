

// Reusable Loading Component
const Loading = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-full">
      {/* Spinner */}
      <div className="w-16 h-16 border-4 border-transparent border-t-[var(--green3)] rounded-full animate-spin"></div>

      {/* Custom Text */}
      <p className="mt-6 text-gray-700 text-lg font-medium">
        {text}
      </p>
    </div>
  );
};

function LoadingScreen({ text }) {
  return (
    <div className="absolute z-10">
      <Loading text={text} />
    </div>
  );
}

export default LoadingScreen;
