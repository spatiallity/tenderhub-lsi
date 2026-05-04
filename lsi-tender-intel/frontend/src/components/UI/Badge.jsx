import React from 'react';
import { colors } from '../../styles/design-tokens';
import { daysFromNow } from '../../utils/helpers';

/**
 * Badge Component - Enhanced with design tokens and better variants
 * 
 * @param {Object} props
 * @param {'gray'|'blue'|'green'|'amber'|'red'|'purple'|'cyan'|'indigo'|'teal'} props.color - Badge color
 * @param {'sm'|'md'|'lg'} props.size - Badge size
 * @param {boolean} props.dot - Show dot indicator
 * @param {boolean} props.removable - Show remove button
 * @param {Function} props.onRemove - Remove callback
 * @param {string} props.className - Additional CSS classes
 */
const Badge = ({
  children,
  color = 'gray',
  size = 'md',
  dot = false,
  removable = false,
  onRemove,
  className = '',
  ...props
}) => {
  // Get color from design tokens
  const stageColor = colors.stage[color] || colors.stage.gray;
  
  // Size styles
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-0.5 text-[11px] gap-1.5',
    lg: 'px-3 py-1 text-xs gap-2',
  };
  
  // Dot size
  const dotSize = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };
  
  return (
    <span
      className={`inline-flex items-center font-bold whitespace-nowrap rounded-full border ${sizeStyles[size]} ${className}`}
      style={{
        backgroundColor: stageColor.bg,
        color: stageColor.text,
        borderColor: stageColor.border,
      }}
      {...props}
    >
      {dot && (
        <span
          className={`rounded-full flex-shrink-0 ${dotSize[size]}`}
          style={{ backgroundColor: stageColor.text }}
        />
      )}
      <span className="truncate">{children}</span>
      {removable && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="flex-shrink-0 hover:opacity-70 transition-opacity focus:outline-none focus:ring-1 focus:ring-offset-1 rounded-full"
          style={{ color: stageColor.text }}
          aria-label="Remove"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M9 3L3 9M3 3L9 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

/**
 * CountdownBadge - Shows the deadline date with color coding based on urgency
 * @param {string} dateStr - Date string (YYYY-MM-DD) to display
 * @param {number} days - Days left (used for color coding only)
 * @param {boolean} expired - Whether deadline has passed
 */
export const CountdownBadge = ({ days, daysLeft, dateStr, expired, className = '' }) => {
  const dDays = days !== undefined ? days : (daysLeft !== undefined ? daysLeft : daysFromNow(dateStr));
  
  // Return early if no date information
  if (!dateStr || (days === undefined && daysLeft === undefined && dDays === 999)) {
    return <Badge color="gray" dot className={className}>Tidak tersedia</Badge>;
  }

  let displayText = '-';
  if (dateStr) {
    try {
      const d = new Date(`${dateStr}T00:00:00+07:00`);
      if (!isNaN(d.getTime())) {
        displayText = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
      } else {
        displayText = dateStr;
      }
    } catch (e) {
      displayText = dateStr;
    }
  }

  // Consistent color coding and display
  if (expired || dDays < 0) {
    return <Badge color="red" dot className={className}>{displayText} (Berakhir)</Badge>;
  }
  
  if (dDays === 0) {
    return <Badge color="red" dot className={className}>Hari ini ({displayText})</Badge>;
  }
  
  if (dDays === 1) {
    return <Badge color="red" dot className={className}>Besok ({displayText})</Badge>;
  }

  if (dDays <= 3) return <Badge color="red" dot className={className}>{displayText}</Badge>;
  if (dDays <= 7) return <Badge color="amber" dot className={className}>{displayText}</Badge>;
  return <Badge color="green" dot className={className}>{displayText}</Badge>;
};

/**
 * StatusBadge - Shows internal status with proper colors
 */
export const StatusBadge = ({ status, className = '' }) => {
  const statusColors = {
    'Dipantau': 'gray',
    'Akan Diikuti': 'amber',
    'Sudah Diikuti': 'green',
    'Menang': 'green',
    'Kalah': 'red',
    'Tidak Relevan': 'red',
  };
  
  return (
    <Badge color={statusColors[status] || 'gray'} className={className}>
      {status}
    </Badge>
  );
};

/**
 * PortfolioBadge - Shows portfolio with proper colors
 */
export const PortfolioBadge = ({ portfolio, className = '' }) => {
  const portfolioColors = {
    'FLP': 'blue',
    'SDA': 'green',
    'FITI': 'amber',
  };
  
  return (
    <Badge color={portfolioColors[portfolio] || 'gray'} className={className}>
      {portfolio}
    </Badge>
  );
};

/**
 * LevelBadge - Shows level with proper colors
 */
export const LevelBadge = ({ level, className = '' }) => {
  const levelColors = {
    'K/L': 'gray',
    'Provinsi': 'blue',
    'Kab/Kota': 'teal',
  };
  
  return (
    <Badge color={levelColors[level] || 'gray'} className={className}>
      {level}
    </Badge>
  );
};

export default Badge;
