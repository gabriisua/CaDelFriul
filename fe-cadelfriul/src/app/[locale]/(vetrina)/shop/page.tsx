"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { fetchProducts, type Product } from "@/lib/api";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ProductCard from "../_components/ProductCard";

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { items: cartItems, addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        fetchProducts()
            .then(setProducts)
            .catch(() => setError("Failed to load products. Please try again later."))
            .finally(() => setLoading(false));
    }, []);

    const handleAddToCart = (product: Product) => {
        if (!isAuthenticated) {
            toast("Sign in to add items to your cart", {
                description: "Create an account to start building your order.",
                action: {
                    label: "Sign In",
                    onClick: () => router.push("/login"),
                },
            });
            return;
        }
        addToCart({
            productId: product.id,
            productName: product.name,
            price: product.price,
            imageUrl: product.imageUrls && product.imageUrls.length > 0 ? `http://localhost:8080${product.imageUrls[0]}` : "",
            stockQuantity: product.stockQuantity,
        });
        toast.success(`${product.name} added to cart`);
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
            <h1 className="font-heading text-3xl font-semibold md:text-4xl">
                Our Products
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
                Take a piece of Friuli home with you. Our curated selection of local
                wines, artisanal foods, and handcrafted gifts from the heart of the
                Friulian countryside.
            </p>

            {error && (
                <div className="mt-8 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {loading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <Skeleton className="aspect-[4/3] w-full rounded-none" />
                            <CardHeader>
                                <Skeleton className="h-5 w-2/3" />
                                <Skeleton className="h-4 w-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-6 w-16" />
                            </CardContent>
                        </Card>
                    ))
                    : products.map((product) => {
                        const cartItem = cartItems.find((ci) => ci.productId === product.id);
                        const isAtMax =
                          cartItem &&
                          product.stockQuantity !== undefined &&
                          cartItem.quantity >= product.stockQuantity;
                        const isOutOfStock = product.stockQuantity === 0;

                        return (
                        <div key={product.id} className="flex flex-col">
                            <ProductCard
                                name={product.name}
                                price={`€${product.price.toFixed(2)}`}
                                description={product.description}
                                imageUrls={product.imageUrls}
                                href={`/shop/${product.id}`}
                            />
                            {product.stockQuantity !== undefined &&
                              product.stockQuantity <= 5 &&
                              product.stockQuantity > 0 && (
                                <p className="text-xs text-muted-foreground mt-1 px-1">
                                  Only {product.stockQuantity} left in stock
                                </p>
                              )}
                            <div className="mt-3 flex justify-end px-1">
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleAddToCart(product)}
                                    disabled={
                                      !product.available ||
                                      !isAuthenticated ||
                                      isOutOfStock ||
                                      !!isAtMax
                                    }
                                >
                                    <ShoppingCart className="mr-1.5 size-3.5" />
                                    {!isAuthenticated
                                        ? "Sign In to Buy"
                                        : isOutOfStock
                                          ? "Out of Stock"
                                          : isAtMax
                                            ? "Max in Cart"
                                            : product.available
                                              ? "Add to Cart"
                                              : "Unavailable"}
                                </Button>
                            </div>
                        </div>
                        );
                    })}
            </div>

            {!loading && products.length === 0 && !error && (
                <div className="mt-16 text-center text-muted-foreground">
                    <p className="text-lg">No products available at the moment.</p>
                    <p className="mt-2 text-sm">Check back soon for new arrivals.</p>
                </div>
            )}
        </div>
    );
}