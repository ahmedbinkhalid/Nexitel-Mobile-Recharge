// Shared Nexitel carrier/network data
export const NEXITEL_CARRIERS = [
  { 
    value: "nexitel-purple", 
    label: "Nexitel Purple", 
    color: "bg-purple-100 text-purple-800",
    brandColor: "purple",
    description: "Premium Nexitel Purple network service"
  },
  { 
    value: "nexitel-blue", 
    label: "Nexitel Blue", 
    color: "bg-blue-100 text-blue-800",
    brandColor: "blue", 
    description: "Reliable Nexitel Blue network service"
  },
] as const;

// Export as NEXITEL_NETWORKS for backwards compatibility with SIM swap
export const NEXITEL_NETWORKS = NEXITEL_CARRIERS;

export type NexitelCarrier = typeof NEXITEL_CARRIERS[number];

export function getNexitelCarrierByValue(value: string): NexitelCarrier | undefined {
  return NEXITEL_CARRIERS.find(carrier => carrier.value === value);
}

export function getNexitelCarrierLabel(value: string): string {
  const carrier = getNexitelCarrierByValue(value);
  return carrier ? carrier.label : value;
}

export function getNexitelCarrierColor(value: string): string {
  const carrier = getNexitelCarrierByValue(value);
  return carrier ? carrier.color : "bg-gray-100 text-gray-800";
}