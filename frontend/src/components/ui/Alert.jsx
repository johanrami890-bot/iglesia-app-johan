export default function Alert({ type = 'success', message }) {
  const typeConfig = {
    success: {
      bg: 'bg-green-900/20',
      border: 'border-green-700/50',
      text: 'text-green-400',
      icon: '✓'
    },
    error: {
      bg: 'bg-red-900/20',
      border: 'border-red-700/50',
      text: 'text-red-400',
      icon: '⚠'
    },
    info: {
      bg: 'bg-blue-900/20',
      border: 'border-blue-700/50',
      text: 'text-blue-400',
      icon: 'ℹ'
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className={`${config.bg} border ${config.border} ${config.text} px-4 py-3 rounded-lg mb-4 flex items-start gap-3`}>
      <span className="text-lg flex-shrink-0">{config.icon}</span>
      <p className="flex-1">{message}</p>
    </div>
  );
}
