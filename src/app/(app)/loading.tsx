export default function AppLoading() {
    return (
      <div className="container-tight py-16 max-w-md text-center" dir="rtl">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        <p className="muted mt-4 text-sm">در حال بارگذاری...</p>
      </div>
    );
  }