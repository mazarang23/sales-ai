export const metadata = { title: "درباره ما" };

export default function About() {
  return (
    <section className="container-tight py-20 max-w-3xl">
      <h1 className="h1">درباره فروشیار AI</h1>
      <p className="muted mt-6 leading-8">
        ما معتقدیم صاحبان فروشگاه‌های کوچک و متوسط در ایران، داده‌های ارزشمندی دارند که
        در اکسل خاک می‌خورند. فروشیار AI این داده‌ها را به بینش و اقدام تبدیل می‌کند.
      </p>
      <p className="muted mt-4 leading-8">
        هدف ما ساده است: هر فروشگاه، یک مشاور رشد هوشمند داشته باشد.
      </p>
    </section>
  );
}