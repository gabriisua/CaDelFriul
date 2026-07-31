import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const reservations = [
  {
    id: "RES-001",
    room: "Deluxe Room",
    checkIn: "2026-08-15",
    checkOut: "2026-08-18",
    status: "Confirmed",
    total: "€960",
  },
  {
    id: "RES-002",
    room: "Junior Suite",
    checkIn: "2026-09-01",
    checkOut: "2026-09-05",
    status: "Pending",
    total: "€1,800",
  },
];

export default function ReservationsPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Reservations</h1>
      <p className="mt-2 text-muted-foreground">
        View and manage your upcoming and past reservations.
      </p>
      <div className="mt-8 space-y-4">
        {reservations.map((res) => (
          <Card key={res.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="font-heading text-lg">
                    {res.room}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{res.id}</p>
                </div>
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    res.status === "Confirmed"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {res.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Check-in</p>
                  <p className="font-medium">{res.checkIn}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Check-out</p>
                  <p className="font-medium">{res.checkOut}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-medium text-accent">{res.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
