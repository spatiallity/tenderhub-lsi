import React from 'react';
import { 
  FileText, 
  Search, 
  AlertCircle, 
  Inbox, 
  Filter,
  Database,
  Users,
  Calendar,
  TrendingUp
} from 'lucide-react';
import Button from './Button';

/**
 * EmptyState Component - Display when no data is available
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Icon component
 * @param {string} props.title - Title text
 * @param {string} props.description - Description text
 * @param {React.ReactNode} props.action - Action button or element
 * @param {string} props.illustration - Illustration type
 * @param {string} props.className - Additional CSS classes
 */
const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  illustration,
  className = '',
}) => {
  // Default icon based on illustration type
  const defaultIcons = {
    search: Search,
    filter: Filter,
    error: AlertCircle,
    inbox: Inbox,
    database: Database,
    users: Users,
    calendar: Calendar,
    chart: TrendingUp,
  };
  
  const DisplayIcon = Icon || (illustration && defaultIcons[illustration]) || Inbox;
  
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {/* Icon */}
      <div className="mb-4 p-4 bg-slate-100 rounded-full">
        <DisplayIcon size={48} className="text-slate-400" />
      </div>
      
      {/* Title */}
      {title && (
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          {title}
        </h3>
      )}
      
      {/* Description */}
      {description && (
        <p className="text-sm text-slate-600 max-w-md mb-6">
          {description}
        </p>
      )}
      
      {/* Action */}
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
};

/**
 * NoResults - Empty state for search/filter with no results
 */
export const NoResults = ({ 
  searchTerm, 
  onClear,
  className = '' 
}) => (
  <EmptyState
    illustration="search"
    title="Tidak Ada Hasil"
    description={
      searchTerm 
        ? `Tidak ditemukan hasil untuk "${searchTerm}". Coba kata kunci lain atau hapus filter.`
        : 'Tidak ada data yang sesuai dengan filter yang dipilih.'
    }
    action={
      onClear && (
        <Button variant="secondary" onClick={onClear}>
          Hapus Filter
        </Button>
      )
    }
    className={className}
  />
);

/**
 * NoData - Empty state when no data exists
 */
export const NoData = ({ 
  title = 'Belum Ada Data',
  description = 'Data akan muncul di sini setelah Anda menambahkan item pertama.',
  actionText,
  onAction,
  className = '' 
}) => (
  <EmptyState
    illustration="inbox"
    title={title}
    description={description}
    action={
      actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )
    }
    className={className}
  />
);

/**
 * ErrorState - Empty state for errors
 */
export const ErrorState = ({ 
  title = 'Terjadi Kesalahan',
  description = 'Maaf, terjadi kesalahan saat memuat data. Silakan coba lagi.',
  onRetry,
  className = '' 
}) => (
  <EmptyState
    illustration="error"
    title={title}
    description={description}
    action={
      onRetry && (
        <Button variant="primary" onClick={onRetry}>
          Coba Lagi
        </Button>
      )
    }
    className={className}
  />
);

/**
 * NoTenders - Empty state for tender list
 */
export const NoTenders = ({ 
  hasFilters = false,
  onClearFilters,
  onViewAll,
  className = '' 
}) => {
  if (hasFilters) {
    return (
      <NoResults
        searchTerm=""
        onClear={onClearFilters}
        className={className}
      />
    );
  }
  
  return (
    <EmptyState
      icon={FileText}
      title="Belum Ada Tender"
      description="Tender yang relevan akan muncul di sini. Pastikan keyword sudah dikonfigurasi dengan benar."
      action={
        onViewAll && (
          <Button variant="secondary" onClick={onViewAll}>
            Lihat Semua Tender
          </Button>
        )
      }
      className={className}
    />
  );
};

/**
 * NoExperts - Empty state for expert list
 */
export const NoExperts = ({ 
  onAddExpert,
  className = '' 
}) => (
  <EmptyState
    illustration="users"
    title="Belum Ada Tenaga Ahli"
    description="Mulai membangun database tenaga ahli Anda dengan menambahkan profil ahli pertama."
    action={
      onAddExpert && (
        <Button variant="primary" onClick={onAddExpert}>
          Tambah Tenaga Ahli
        </Button>
      )
    }
    className={className}
  />
);

/**
 * NoRup - Empty state for RUP list
 */
export const NoRup = ({ 
  hasFilters = false,
  onClearFilters,
  className = '' 
}) => {
  if (hasFilters) {
    return (
      <NoResults
        searchTerm=""
        onClear={onClearFilters}
        className={className}
      />
    );
  }
  
  return (
    <EmptyState
      illustration="database"
      title="Belum Ada RUP"
      description="Paket RUP yang relevan akan muncul di sini sebagai radar awal sebelum tender dibuka."
      className={className}
    />
  );
};

/**
 * NoActivity - Empty state for activity/timeline
 */
export const NoActivity = ({ className = '' }) => (
  <EmptyState
    illustration="calendar"
    title="Belum Ada Aktivitas"
    description="Aktivitas terbaru akan muncul di sini."
    className={className}
  />
);

/**
 * NoChartData - Empty state for charts
 */
export const NoChartData = ({ 
  title = 'Tidak Ada Data',
  description = 'Data chart akan muncul setelah ada tender yang diikuti.',
  className = '' 
}) => (
  <EmptyState
    illustration="chart"
    title={title}
    description={description}
    className={className}
  />
);

/**
 * ComingSoon - Empty state for features under development
 */
export const ComingSoon = ({ 
  title = 'Segera Hadir',
  description = 'Fitur ini sedang dalam pengembangan dan akan segera tersedia.',
  className = '' 
}) => (
  <EmptyState
    illustration="inbox"
    title={title}
    description={description}
    className={className}
  />
);

export default EmptyState;
