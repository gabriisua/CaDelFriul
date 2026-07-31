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
});
