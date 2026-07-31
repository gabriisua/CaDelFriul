"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Address,
  AddressRequest,
  fetchAddresses,
  addAddress,
  updateAddress,
  deleteAddress as deleteAddressApi,
  setDefaultShipping,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const emptyFormData: AddressRequest = {
  street: "",
  houseNumber: "",
  city: "",
  zipCode: "",
  province: "",
  country: "Italy",
  additionalInfo: "",
};

export default function AddressesPage() {
  const { user, loading: authLoading } = useAuth();
  const customerId = user?.id; // Prendiamo l'ID direttamente dal context!

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add/Edit dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<AddressRequest>(emptyFormData);
  const [saving, setSaving] = useState(false);

  const loadAddresses = (custId: string) => {
    setLoading(true);
    setError(null);
    fetchAddresses(custId)
        .then(setAddresses)
        .catch(() => setError("Could not load addresses."))
        .finally(() => setLoading(false));
  };

  // Sostituito il vecchio fetchProfile() con l'ascolto del context
  useEffect(() => {
    if (!customerId) return;
    loadAddresses(customerId);
  }, [customerId]);

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingAddress(null);
    }
  };

  const openAddDialog = () => {
    setEditingAddress(null);
    setFormData({ ...emptyFormData });
  };

  const openEditDialog = (addr: Address) => {
    setEditingAddress(addr);
    setFormData({
      street: addr.street,
      houseNumber: addr.houseNumber,
      city: addr.city,
      zipCode: addr.zipCode,
      province: addr.province,
      country: addr.country,
      additionalInfo: addr.additionalInfo ?? "",
    });
    setDialogOpen(true);
  };

  const handleFormChange = (
      field: keyof AddressRequest,
      value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!customerId) return;
    setSaving(true);
    try {
      if (editingAddress) {
        await updateAddress(customerId, editingAddress.id, formData);
        toast("Address updated successfully!");
      } else {
        await addAddress(customerId, formData);
        toast("New address added successfully!");
      }
      setDialogOpen(false);
      setEditingAddress(null);
      loadAddresses(customerId);
    } catch {
      toast.error("Could not save address. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addr: Address) => {
    if (!customerId) return;
    if (!window.confirm(`Are you sure you want to delete the address at ${addr.street} ${addr.houseNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteAddressApi(customerId, addr.id);
      toast("Address deleted successfully.");
      loadAddresses(customerId);
    } catch {
      toast.error("Could not delete address. It might be your only address.");
    }
  };

  const handleSetDefault = async (addr: Address) => {
    if (!customerId) return;
    try {
      await setDefaultShipping(customerId, addr.id);
      toast("Default shipping address updated.");
      loadAddresses(customerId);
    } catch {
      toast.error("Could not update default address.");
    }
  };

  // Se l'auth sta ancora caricando, mostriamo gli skeleton
  const isInitialLoading = authLoading || loading;

  return (
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-semibold">Addresses</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your saved addresses for orders and billing.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger
                onClick={openAddDialog}
                render={
                  <Button>
                    <Plus className="mr-2 size-4" />
                    Add New Address
                  </Button>
                }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingAddress ? "Edit Address" : "Add New Address"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Street</Label>
                    <Input
                        id="street"
                        placeholder="Via Roma"
                        value={formData.street}
                        onChange={(e) =>
                            handleFormChange("street", e.target.value)
                        }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="houseNumber">House Number</Label>
                    <Input
                        id="houseNumber"
                        placeholder="123"
                        value={formData.houseNumber}
                        onChange={(e) =>
                            handleFormChange("houseNumber", e.target.value)
                        }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                        id="city"
                        placeholder="Udine"
                        value={formData.city}
                        onChange={(e) =>
                            handleFormChange("city", e.target.value)
                        }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input
                        id="zipCode"
                        placeholder="33100"
                        value={formData.zipCode}
                        onChange={(e) =>
                            handleFormChange("zipCode", e.target.value)
                        }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <Input
                        id="province"
                        placeholder="UD"
                        value={formData.province}
                        onChange={(e) =>
                            handleFormChange("province", e.target.value)
                        }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) =>
                            handleFormChange("country", e.target.value)
                        }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">
                    Additional Info (optional)
                  </Label>
                  <textarea
                      id="additionalInfo"
                      placeholder="Apartment, floor, doorbell, etc."
                      value={formData.additionalInfo ?? ""}
                      onChange={(e) =>
                          handleFormChange("additionalInfo", e.target.value)
                      }
                      className={cn(
                          "h-20 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                          "resize-y"
                      )}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving
                      ? "Saving..."
                      : editingAddress
                          ? "Update"
                          : "Create"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
            <div className="mt-6 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
        )}

        {isInitialLoading ? (
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              {[1, 2].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-20" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-24" />
                    </CardContent>
                  </Card>
              ))}
            </div>
        ) : addresses.length === 0 ? (
            <div className="mt-16 text-center text-muted-foreground">
              <p className="text-sm">No addresses saved yet.</p>
              <p className="mt-1 text-xs">
                Click &ldquo;Add New Address&rdquo; to get started.
              </p>
            </div>
        ) : (
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              {addresses.map((addr) => (
                  <Card key={addr.id}>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                      <div className="flex items-center gap-2">
                        <CardTitle className="font-heading text-base">
                          {addr.street} {addr.houseNumber}
                        </CardTitle>
                        {addr.isDefaultShipping && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                      <Star className="size-3 fill-current" />
                      Default Shipping
                    </span>
                        )}
                        {addr.isDefaultBilling && !addr.isDefaultShipping && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                      <Star className="size-3 fill-current" />
                      Default Billing
                    </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => openEditDialog(addr)}
                            aria-label={`Edit address at ${addr.street} ${addr.houseNumber}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(addr)}
                            aria-label={`Delete address at ${addr.street} ${addr.houseNumber}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">
                        {addr.street} {addr.houseNumber}
                      </p>
                      <p>
                        {addr.city}, {addr.zipCode}
                      </p>
                      <p>
                        {addr.province && `${addr.province}, `}
                        {addr.country}
                      </p>
                      {addr.additionalInfo && (
                          <p className="mt-1 text-xs italic">
                            {addr.additionalInfo}
                          </p>
                      )}
                      {!addr.isDefaultShipping && (
                          <Button
                              variant="link"
                              className="mt-2 h-auto p-0 text-xs"
                              onClick={() => handleSetDefault(addr)}
                          >
                            Set as default shipping
                          </Button>
                      )}
                    </CardContent>
                  </Card>
              ))}
            </div>
        )}
      </div>
  );
}