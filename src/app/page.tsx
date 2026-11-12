import Link from "next/link";

export default function Home() {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Everyday, considered</p>
          <h1 className="hero-title">Good things, for every day.</h1>
          <p className="hero-description">
            Explore thoughtfully selected watches, shoes, T-shirts, and gadgets made for everyday life.
          </p>
          <div className="button-row">
            <Link href="/products" className="button button-primary">Explore the collection <span aria-hidden="true">→</span></Link>
            <Link href="/products" className="button button-secondary">Discover more</Link>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-card">
            <div className="art-disc" />
            <div className="art-vase" />
            <span className="art-label">The quiet edit</span>
            <span className="art-index">01 / 04</span>
          </div>
        </div>
      </section>
      <section className="value-strip" aria-label="Shopping benefits">
        <div className="value-item"><strong>Thoughtfully selected</strong>Curated for quality and everyday use</div>
        <div className="value-item"><strong>Simple, secure checkout</strong>A smooth experience from start to finish</div>
        <div className="value-item"><strong>Made to be kept</strong>Considered pieces, beyond the moment</div>
      </section>
    </div>
  );
}
