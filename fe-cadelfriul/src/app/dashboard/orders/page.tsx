"use client";

import {useState, useEffect} from "react";
import Link from "next/link";
import {fetchOrders, type Order} from "@/lib/api";
import {Skeleton} from "@/components/ui/skeleton";

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchOrders();
                if (!cancelled) {
                    setOrders(data);
                }
            } catch {
                if (!cancelled) {
                    setError("Unable to load orders. Please try again later.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    function statusBadgeClass(status: string): string {
        switch (status.toUpperCase()) {
            case "DELIVERED":
                return "bg-green-100 text-green-800";
            case "PROCESSING":
            case "PLACED":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    }

    return (
        <div>
            <h1 className="font-heading text-2xl font-semibold">Orders</h1>
            <p className="mt-2 text-muted-foreground">
                View your order history and track current orders.
            </p>

            {loading && (
                <div className="mt-8 overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-secondary text-secondary-foreground">
                        <tr>
                            <th className="px-4 py-3 font-medium">Order #</th>
                            <th className="px-4 py-3 font-medium">Date</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium">Total</th>
                        </tr>
                        </thead>
                        <tbody>
                        {[1, 2, 3].map((i) => (
                            <tr key={i} className="border-t border-border">
                                <td className="px-4 py-3">
                                    <Skeleton className="h-4 w-20"/>
                                </td>
                                <td className="px-4 py-3">
                                    <Skeleton className="h-4 w-24"/>
                                </td>
                                <td className="px-4 py-3">
                                    <Skeleton className="h-5 w-16 rounded-full"/>
                                </td>
                                <td className="px-4 py-3">
                                    <Skeleton className="h-4 w-16"/>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && error && (
                <div className="mt-8 text-center">
                    <p className="text-muted-foreground">{error}</p>
                </div>
            )}

            {!loading && !error && orders.length === 0 && (
                <div className="mt-8 text-center">
                    <p className="text-muted-foreground">No orders yet.</p>
                    <Link
                        href="/shop"
                        className="mt-4 inline-block text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                    >
                        Browse the shop
                    </Link>
                </div>
            )}

            {!loading && !error && orders.length > 0 && (
                <div className="mt-8 overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-secondary text-secondary-foreground">
                        <tr>
                            <th className="px-4 py-3 font-medium">Order #</th>
                            <th className="px-4 py-3 font-medium">Date</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium">Total</th>
                        </tr>
                        </thead>
                        <tbody>
                        {orders.map((order) => (
                            <tr key={order.id} className="border-t border-border">
                                <td className="px-4 py-3 font-medium">
                                    {order.id}
                                </td>

                                <td className="px-4 py-3 text-muted-foreground">
                                    {new Date(order.createdAt).toLocaleDateString("it-IT")}
                                </td>

                                <td className="px-4 py-3">
                                     <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(order.status)}`}>
                                         {order.status}
                                    </span>
                                </td>

                                <td className="px-4 py-3 text-muted-foreground">
                                    €{order.totalAmount.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
