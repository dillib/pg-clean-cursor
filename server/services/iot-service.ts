import { storage } from "../storage";
import { eventBus } from "../events/event-bus";
import type { 
  IoTDevice, 
  InsertIoTDevice, 
  IoTSensorReading,
  IoTDeviceStatus 
} from "@shared/schema";

export class IoTService {
  async registerDevice(data: InsertIoTDevice): Promise<IoTDevice> {
    const device = await storage.createIoTDevice(data);
    
    await eventBus.publish({
      type: "com.photonictag.trace.recorded",
      source: "iot-service",
      data: { 
        eventType: "iot_device_registered",
        deviceId: device.id, 
        productId: device.productId,
        deviceType: device.deviceType 
      },
      subject: device.productId,
    });

    return device;
  }

  async getDevice(id: string): Promise<IoTDevice | undefined> {
    return storage.getIoTDevice(id);
  }

  async getDeviceByDeviceId(deviceId: string): Promise<IoTDevice | undefined> {
    return storage.getIoTDeviceByDeviceId(deviceId);
  }

  async getDevicesByProductId(productId: string): Promise<IoTDevice[]> {
    return storage.getIoTDevicesByProductId(productId);
  }

  async getAllDevices(): Promise<IoTDevice[]> {
    return storage.getAllIoTDevices();
  }

  async updateDeviceStatus(id: string, status: IoTDeviceStatus): Promise<IoTDevice | undefined> {
    return storage.updateIoTDeviceStatus(id, status);
  }

  async recordSensorReading(deviceId: string, reading: IoTSensorReading): Promise<IoTDevice | undefined> {
    const device = await storage.getIoTDeviceByDeviceId(deviceId);
    if (!device) return undefined;

    const updatedDevice = await storage.recordIoTReading(device.id, reading);

    await eventBus.publish({
      type: "com.photonictag.trace.recorded",
      source: "iot-service",
      data: { 
        eventType: "sensor_reading",
        deviceId: device.id,
        productId: device.productId,
        reading 
      },
      subject: device.productId,
    });

    return updatedDevice;
  }

  async scanDevice(deviceId: string, location?: { lat: number; lng: number }): Promise<{
    device: IoTDevice;
    product: unknown;
  } | undefined> {
    const device = await storage.getIoTDeviceByDeviceId(deviceId);
    if (!device) return undefined;

    const reading: IoTSensorReading = {
      timestamp: new Date().toISOString(),
      location,
    };

    await storage.recordIoTReading(device.id, reading);

    const product = await storage.getProduct(device.productId);

    await eventBus.publish({
      type: "com.photonictag.trace.recorded",
      source: "iot-service",
      data: { 
        eventType: "device_scanned",
        deviceId: device.id,
        productId: device.productId,
        location 
      },
      subject: device.productId,
    });

    return { device, product };
  }

  async deleteDevice(id: string): Promise<boolean> {
    return storage.deleteIoTDevice(id);
  }
}

export const iotService = new IoTService();
