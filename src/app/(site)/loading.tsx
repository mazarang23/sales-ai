export default function SiteLoading() {
    return (
      <div className="container-tight py-24 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        <p className="muted mt-4 text-sm">در حال بارگذاری...</p>
      </div>
    );
  }