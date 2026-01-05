import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Wifi, Radio, Bluetooth, QrCode, Activity, Signal, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { IoTDevice } from "@shared/schema";

const deviceTypeIcons: Record<string, typeof Wifi> = {
  nfc: Radio,
  rfid: Signal,
  ble: Bluetooth,
  qr: QrCode,
  optical: Activity,
};

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  inactive: "secondary",
  lost: "destructive",
  damaged: "destructive",
};

export default function IoTDevices() {
  const { data: devices, isLoading } = useQuery<IoTDevice[]>({
    queryKey: ["/api/iot/devices"],
  });

  const devicesByType = devices?.reduce((acc, device) => {
    const type = device.deviceType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(device);
    return acc;
  }, {} as Record<string, IoTDevice[]>) || {};

  const activeCount = devices?.filter(d => d.status === "active").length || 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" data-testid="text-iot-title">
            IoT Devices
          </h1>
          <p className="text-muted-foreground">
            Manage NFC, RFID, BLE tags and sensors linked to your products.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {["nfc", "rfid", "ble", "qr", "optical"].map(type => {
          const Icon = deviceTypeIcons[type];
          const count = devicesByType[type]?.length || 0;
          return (
            <Card key={type}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium uppercase">{type}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <div className="text-2xl font-bold" data-testid={`text-${type}-count`}>
                    {count}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {type === "nfc" && "Near Field Communication"}
                  {type === "rfid" && "Radio Frequency ID"}
                  {type === "ble" && "Bluetooth Low Energy"}
                  {type === "qr" && "QR Code Tags"}
                  {type === "optical" && "Optical Sensors"}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            All Registered Devices
            <Badge variant="secondary" className="ml-2">{activeCount} active</Badge>
          </CardTitle>
          <CardDescription>
            Physical tags and sensors linked to Digital Product Passports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : devices?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-1">No IoT devices registered</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                IoT devices are automatically created when products are registered with NFC, RFID, or BLE tags.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {devices?.map(device => {
                const Icon = deviceTypeIcons[device.deviceType] || Wifi;
                const metadata = device.metadata as { productName?: string } | null;
                return (
                  <div
                    key={device.id}
                    className="flex items-center gap-4 p-3 rounded-lg border hover-elevate"
                    data-testid={`iot-device-${device.id}`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium font-mono text-sm" data-testid="text-device-id">
                          {device.deviceId}
                        </span>
                        <Badge variant="outline" className="uppercase text-xs" data-testid={`badge-type-${device.id}`}>
                          {device.deviceType}
                        </Badge>
                        <Badge variant={statusColors[device.status]} data-testid={`badge-status-${device.id}`}>
                          {device.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                        <span>{device.manufacturer} {device.model}</span>
                        {metadata?.productName && (
                          <>
                            <span className="text-muted-foreground/50">|</span>
                            <Link href={`/products/${device.productId}`} className="hover:underline" data-testid={`link-product-${device.productId}`}>
                              {metadata.productName}
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      {device.lastSeenAt ? (
                        <>
                          Last seen
                          <br />
                          {new Date(device.lastSeenAt).toLocaleDateString()}
                        </>
                      ) : (
                        "Never scanned"
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
