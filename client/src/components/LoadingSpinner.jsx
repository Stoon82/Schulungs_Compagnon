function LoadingSpinner({ size = 'md', text = 'Laden...' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizes[size]} relative`}>
        <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
      {text && (
        <p className="text-gray-300 text-sm animate-pulse">{text}</p>
      )}
    </div>
  );
}

export default LoadingSpinner;
