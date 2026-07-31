import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import SuccessPage from "./page";

const mockClearCart = vi.fn();
const mockPush = vi.fn();

vi.mock("@/context/CartContext", () => ({
  useCart: () => ({
    clearCart: mockClearCart,
    cartTotal: 0,
    itemCount: 0,
    items: [],
    addToCart: vi.fn(),
    removeFromCart: vi.fn(),
    updateQuantity: vi.fn(),
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === "session_id" ? "cs_test_123" : null),
  }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Checkout Success Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders a thank-you heading and confirmation message", () => {
    render(<SuccessPage />);
    expect(
      screen.getByRole("heading", { name: /grazie per il tuo ordine/i })
    ).toBeDefined();
    expect(
      screen.getByText(/il tuo ordine è stato confermato/i)
    ).toBeDefined();
  });

  it("calls clearCart on mount", () => {
    render(<SuccessPage />);
    expect(mockClearCart).toHaveBeenCalledTimes(1);
  });

  it("renders a link to /dashboard/orders", () => {
    render(<SuccessPage />);
    const links = screen.getAllByRole("link", {
      name: /gestisci i tuoi ordini/i,
    });
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(links[0].getAttribute("href")).toBe("/dashboard/orders");
  });

  it("auto-redirects to /dashboard/orders after 6 seconds", () => {
    render(<SuccessPage />);
    expect(mockPush).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(mockPush).toHaveBeenCalledWith("/dashboard/orders");
  });
});
