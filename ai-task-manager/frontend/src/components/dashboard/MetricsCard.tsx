import React from 'react';
import clsx from 'clsx';

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'red' | 'purple' | 'yellow';
  subtitle?: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-600',
    green: 'bg-green-500 text-green-600',
    red: 'bg-red-500 text-red-600',
    purple: 'bg-purple-500 text-purple-600',
    yellow: 'bg-yellow-500 text-yellow-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={clsx(
          'flex-shrink-0 p-3 rounded-lg',
          colorClasses[color].split(' ')[0] + '20'
        )}>
          <Icon className={clsx('h-6 w-6', colorClasses[color].split(' ')[1])} />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricsCard;