import ProductCard from "../_components/ProductCard";

const products = [
  {
    name: "Friulano DOC",
    price: "€28",
    description:
      "A crisp, elegant white wine from the Collio region. Notes of almond and white flowers.",
  },
  {
    name: "Extra Virgin Olive Oil",
    price: "€18",
    description:
      "Cold-pressed from our estate groves. Golden-green with a peppery finish.",
  },
  {
    name: "Gift Basket — Rustic",
    price: "€65",
    description:
      "A curated selection of local cheeses, cured meats, honey, and a bottle of Refosco.",
  },
  {
    name: "Saffron Threads",
    price: "€12",
    description:
      "Premium Friulian saffron, hand-harvested from the plains of San Daniele.",
  },
  {
    name: "Gift Basket — Premium",
    price: "€120",
    description:
      "Our finest selection: Friulano DOC, olive oil, truffle pâté, aged cheese, and grappa.",
  },
  {
    name: "Grappa di Picolit",
    price: "€45",
    description:
      "An aromatic grappa distilled from Picolit grapes. Smooth and floral.",
  },
];

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <h1 className="font-heading text-3xl font-semibold md:text-4xl">
        Local Products
      </h1>
      <p className="mt-3 text-muted-foreground">
        Take a piece of Friuli home with you. Our selection of local wines, artisanal
        foods, and handcrafted gifts.
      </p>
      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.name} {...product} />
        ))}
      </div>
    </div>
  );
}
