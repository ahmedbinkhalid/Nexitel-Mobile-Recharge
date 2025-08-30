// Shared USA Carrier data with authentic carrier information
export const USA_CARRIERS = [
  { 
    name: "T-Mobile", 
    code: "tmobile",
    color: "bg-pink-500",
    textColor: "text-white",
    amounts: [5, 10, 15, 25, 30, 40, 50, 75, 100]
  },
  { 
    name: "AT&T", 
    code: "att",
    color: "bg-blue-600",
    textColor: "text-white",
    amounts: [10, 15, 25, 30, 40, 50, 60, 75, 100]
  },
  { 
    name: "Verizon", 
    code: "verizon",
    color: "bg-red-600",
    textColor: "text-white",
    amounts: [15, 20, 25, 30, 40, 50, 75, 100, 150]
  },
  { 
    name: "Surf USA", 
    code: "surfusa",
    color: "bg-cyan-500",
    textColor: "text-white",
    amounts: [10, 20, 30, 50, 100]
  },
  { 
    name: "Boom Mobile", 
    code: "boom",
    color: "bg-orange-500",
    textColor: "text-white",
    amounts: [10, 20, 30, 40, 50]
  },
  { 
    name: "Ultra Mobile", 
    code: "ultra",
    color: "bg-purple-600",
    textColor: "text-white",
    amounts: [19, 29, 39, 49, 59]
  },
  { 
    name: "Lycamobile", 
    code: "lyca",
    color: "bg-green-600",
    textColor: "text-white",
    amounts: [10, 19, 29, 35, 50]
  },
  { 
    name: "H2O Wireless", 
    code: "h2o",
    color: "bg-blue-400",
    textColor: "text-white",
    amounts: [10, 20, 30, 40, 50, 60]
  },
  { 
    name: "Gen Mobile", 
    code: "gen",
    color: "bg-indigo-500",
    textColor: "text-white",
    amounts: [10, 25, 35, 50, 75]
  },
  { 
    name: "Boss Revolution", 
    code: "boss",
    color: "bg-yellow-600",
    textColor: "text-white",
    amounts: [5, 10, 20, 30, 50, 100]
  },
  { 
    name: "Mint Mobile", 
    code: "mint",
    color: "bg-green-500",
    textColor: "text-white",
    amounts: [15, 25, 35, 45]
  },
  { 
    name: "Cricket Wireless", 
    code: "cricket",
    color: "bg-green-700",
    textColor: "text-white",
    amounts: [15, 25, 35, 45, 55]
  }
] as const;

export type USACarrier = typeof USA_CARRIERS[number];

export function getCarrierByCode(code: string): USACarrier | undefined {
  return USA_CARRIERS.find(carrier => carrier.code === code);
}

export function getCarrierAmounts(code: string): readonly number[] {
  const carrier = getCarrierByCode(code);
  return carrier ? carrier.amounts : [];
}