"use client";

export function PrintReportButton() {
  return <button type="button" onClick={() => window.print()} className="btn-primary no-print">چاپ / ذخیره PDF</button>;
}
