import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, cleanup } from "@testing-library/react";
import ProductDetailPage from "./page";

const { mockFetchProduct, mockAddToCart, mockPush } = vi.hoisted(() => ({
  mockFetchProduct: vi.fn(),
  mockAddToCart: vi.fn(),
  mockPush: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  fetchProduct: mockFetchProduct,
  getImageUrl: (filename: string) =>
    filename.startsWith("http")
      ? filename
      : `http://localhost:8080${filename}`,
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

vi.mock("@/context/CartContext", () => ({
  useCart: () => ({
    items: [],
    addToCart: mockAddToCart,
    removeFromCart: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("Product Detail Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the product data after the fetch resolves", async () => {
    mockFetchProduct.mockResolvedValue({
      id: "p1",
      name: "Test Lavender Oil",
      description: "Small-batch steam-distilled",
      price: 24,
      imageUrls: ["/api/products/p1/img1.jpg"],
      attributes: { ingredients: "100% pure" },
      available: true,
      stockQuantity: 10,
    });

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ id: "p1" })} />);
    });

    expect(
      await screen.findByRole("heading", { name: /test lavender oil/i })
    ).toBeDefined();
    expect(screen.getByText("€24.00")).toBeDefined();
  });

  it("shows an error message when the fetch fails", async () => {
    mockFetchProduct.mockRejectedValue(new Error("network down"));

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ id: "p1" })} />);
    });

    expect(
      await screen.findByText(/failed to load product/i)
    ).toBeDefined();
    expect(
      screen.queryByRole("heading", { name: /test lavender oil/i })
    ).toBeNull();
  });

  it("renders a single full-width 500px image for 1-image products", async () => {
    mockFetchProduct.mockResolvedValue({
      id: "p1",
      name: "Test Lavender Oil",
      description: "Small-batch steam-distilled",
      price: 24,
      imageUrls: ["/img1.jpg"],
      available: true,
      stockQuantity: 10,
    });

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ id: "p1" })} />);
    });

    const section = screen.getByLabelText(/photo gallery/i);
    // Mobile carousel wrappers are h-[400px], so h-[500px] is desktop-only.
    const wrapper = section.querySelector<HTMLElement>('[class*="h-[500px]"]');
    expect(wrapper).not.toBeNull();
    const imgs = wrapper?.querySelectorAll("img") ?? [];
    expect(imgs).toHaveLength(1);
    expect(imgs[0]?.parentElement?.className).toContain("h-[500px]");
    expect(imgs[0]?.parentElement?.className).toContain("rounded-xl");
    expect(
      screen.queryByRole("button", { name: /show all photos/i })
    ).toBeNull();
  });

  it("renders two 500px images side by side in a 2-column grid for 2-image products", async () => {
    mockFetchProduct.mockResolvedValue({
      id: "p1",
      name: "Test Lavender Oil",
      description: "Small-batch steam-distilled",
      price: 24,
      imageUrls: ["/img1.jpg", "/img2.jpg"],
      available: true,
      stockQuantity: 10,
    });

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ id: "p1" })} />);
    });

    const section = screen.getByLabelText(/photo gallery/i);
    const grid = section.querySelector<HTMLElement>('[class*="grid-cols-2"]');
    expect(grid).not.toBeNull();
    expect(grid?.className).toContain("grid-cols-2");
    const imgs = grid?.querySelectorAll("img") ?? [];
    expect(imgs).toHaveLength(2);
    imgs.forEach((img) => {
      expect(img.parentElement?.className).toContain("h-[500px]");
    });
    expect(
      screen.queryByRole("button", { name: /show all photos/i })
    ).toBeNull();
  });

  it("renders a bento grid with a col-span-2 row-span-2 first image for 3-image products", async () => {
    mockFetchProduct.mockResolvedValue({
      id: "p1",
      name: "Test Lavender Oil",
      description: "Small-batch steam-distilled",
      price: 24,
      imageUrls: ["/a.jpg", "/b.jpg", "/c.jpg"],
      available: true,
      stockQuantity: 10,
    });

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ id: "p1" })} />);
    });

    const section = screen.getByLabelText(/photo gallery/i);
    const grid = section.querySelector<HTMLElement>('[class*="grid-cols-3"]');
    expect(grid).not.toBeNull();
    expect(grid?.className).toContain("grid-cols-3");
    expect(grid?.className).toContain("grid-rows-2");
    const imgs = grid?.querySelectorAll("img") ?? [];
    expect(imgs).toHaveLength(3);
    expect(imgs[0]?.parentElement?.className).toContain("col-span-2");
    expect(imgs[0]?.parentElement?.className).toContain("row-span-2");
    expect(
      screen.queryByRole("button", { name: /show all photos/i })
    ).toBeNull();
  });

  it("caps the bento grid at 5 images and shows 'Show all photos' for 6-image products", async () => {
    mockFetchProduct.mockResolvedValue({
      id: "p1",
      name: "Test Lavender Oil",
      description: "Small-batch steam-distilled",
      price: 24,
      imageUrls: Array.from(
        { length: 6 },
        (_, i) => `/img${i + 1}.jpg`
      ),
      available: true,
      stockQuantity: 10,
    });

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ id: "p1" })} />);
    });

    const section = screen.getByLabelText(/photo gallery/i);
    const grid = section.querySelector<HTMLElement>('[class*="grid-cols-4"]');
    expect(grid).not.toBeNull();
    expect(grid?.className).toContain("grid-cols-4");
    expect(grid?.querySelectorAll("img")).toHaveLength(5);
    // Desktop + mobile each render the button once for 6+ images.
    expect(
      screen.getAllByRole("button", { name: /show all photos/i }).length
    ).toBeGreaterThan(0);
  });
});
