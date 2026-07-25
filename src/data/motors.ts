import { MotorConfig } from "../types";

export const STANDARD_MOTORS: MotorConfig[] = [
  // --- ESTES BLACK POWDER MOTORS ---
  {
    id: "estes-12a3-4t",
    name: "1/2A3-4T (Mini)",
    manufacturer: "Estes",
    totalMass: 5.6,
    propellantMass: 1.15,
    burnTime: 0.3,
    delayTime: 4.0,
    thrustPoints: [
      { time: 0, thrust: 0 },
      { time: 0.05, thrust: 8.3 },
      { time: 0.1, thrust: 5.0 },
      { time: 0.2, thrust: 3.5 },
      { time: 0.3, thrust: 0.0 }
    ]
  },
  {
    id: "estes-a8-3",
    name: "A8-3",
    manufacturer: "Estes",
    totalMass: 16.2,
    propellantMass: 3.1,
    burnTime: 0.5,
    delayTime: 3.0,
    thrustPoints: [
      { time: 0, thrust: 0 },
      { time: 0.05, thrust: 11.5 },
      { time: 0.1, thrust: 13.0 },
      { time: 0.15, thrust: 9.0 },
      { time: 0.2, thrust: 5.5 },
      { time: 0.3, thrust: 4.8 },
      { time: 0.4, thrust: 4.6 },
      { time: 0.5, thrust: 0.0 }
    ]
  },
  {
    id: "estes-b4-4",
    name: "B4-4",
    manufacturer: "Estes",
    totalMass: 19.8,
    propellantMass: 5.6,
    burnTime: 1.1,
    delayTime: 4.0,
    thrustPoints: [
      { time: 0, thrust: 0 },
      { time: 0.1, thrust: 10.5 },
      { time: 0.2, thrust: 12.0 },
      { time: 0.3, thrust: 4.8 },
      { time: 0.6, thrust: 4.0 },
      { time: 1.0, thrust: 3.8 },
      { time: 1.1, thrust: 0.0 }
    ]
  },
  {
    id: "estes-b6-4",
    name: "B6-4",
    manufacturer: "Estes",
    totalMass: 20.1,
    propellantMass: 6.2,
    burnTime: 0.82,
    delayTime: 4.0,
    thrustPoints: [
      { time: 0, thrust: 0 },
      { time: 0.05, thrust: 11.0 },
      { time: 0.1, thrust: 12.1 },
      { time: 0.15, thrust: 11.5 },
      { time: 0.2, thrust: 5.2 },
      { time: 0.4, thrust: 4.8 },
      { time: 0.6, thrust: 4.6 },
      { time: 0.8, thrust: 4.5 },
      { time: 0.82, thrust: 0.0 }
    ]
  },
  {
    id: "estes-c6-5",
    name: "C6-5",
    manufacturer: "Estes",
    totalMass: 25.8,
    propellantMass: 12.4,
    burnTime: 1.6,
    delayTime: 5.0,
    thrustPoints: [
      { time: 0, thrust: 0 },
      { time: 0.05, thrust: 14.1 },
      { time: 0.1, thrust: 15.3 },
      { time: 0.15, thrust: 13.5 },
      { time: 0.2, thrust: 5.2 },
      { time: 0.4, thrust: 4.8 },
      { time: 0.8, thrust: 4.6 },
      { time: 1.2, thrust: 4.5 },
      { time: 1.5, thrust: 4.3 },
      { time: 1.6, thrust: 0.0 }
    ]
  },
  {
    id: "estes-c11-5",
    name: "C11-5 (24mm)",
    manufacturer: "Estes",
    totalMass: 32.2,
    propellantMass: 11.0,
    burnTime: 0.8,
    delayTime: 5.0,
    thrustPoints: [
      { time: 0, thrust: 0 },
      { time: 0.05, thrust: 19.5 },
      { time: 0.1, thrust: 22.1 },
      { time: 0.2, thrust: 11.2 },
      { time: 0.4, thrust: 10.5 },
      { time: 0.6, thrust: 9.8 },
      { time: 0.8, thrust: 0.0 }
    ]
  },
  {
    id: "estes-d12-5",
    name: "D12-5 (24mm)",
    manufacturer: "Estes",
    totalMass: 42.1,
    propellantMass: 24.9,
    burnTime: 1.65,
    delayTime: 5.0,
    thrustPoints: [
      { time: 0, thrust: 0 },
      { time: 0.05, thrust: 24.5 },
      { time: 0.1, thrust: 29.7 },
      { time: 0.15, thrust: 25.0 },
      { time: 0.2, thrust: 12.1 },
      { time: 0.4, thrust: 11.0 },
      { time: 0.8, thrust: 10.5 },
      { time: 1.2, thrust: 9.8 },
      { time: 1.6, thrust: 8.5 },
      { time: 1.65, thrust: 0.0 }
    ]
  },
  {
    id: "estes-e12-6",
    name: "E12-6 (24mm)",
    manufacturer: "Estes",
    totalMass: 58.2,
    propellantMass: 35.9,
    burnTime: 2.4,
    delayTime: 6.0,
    thrustPoints: [
      { time: 0, thrust: 0 },
      { time: 0.1, thrust: 28.5 },
      { time: 0.2, thrust: 30.1 },
      { time: 0.3, thrust: 15.2 },
      { time: 0.6, thrust: 12.0 },
      { time: 1.2, thrust: 11.5 },
      { time: 1.8, thrust: 11.0 },
      { time: 2.4, thrust: 0.0 }
    ]
  },
  {
    id: "estes-f15-6",
    name: "F15-6 (29mm)",
    manufacturer: "Estes",
    totalMass: 90.3,
    propellantMass: 60.0,
    burnTime: 3.4,
    delayTime: 6.0,
    thrustPoints: [
      { time: 0, thrust: 0 },
      { time: 0.1, thrust: 22.0 },
      { time: 0.2, thrust: 24.5 },
      { time: 0.5, thrust: 16.0 },
      { time: 1.0, thrust: 15.5 },
      { time: 2.0, thrust: 14.8 },
      { time: 3.0, thrust: 14.2 },
      { time: 3.4, thrust: 0.0 }
    ]
  },

  // --- QUEST & Q-JET MOTORS ---
  {
    id: "quest-a6-4",
    name: "Quest A6-4",
    manufacturer: "Quest",
    totalMass: 15.5,
    propellantMass: 3.3,
    burnTime: 0.6,
    delayTime: 4.0,
    thrustPoints: [
      { time: 0, thrust: 0 },
      { time: 0.05, thrust: 10.0 },
      { time: 0.1, thrust: 12.0 },
      { time: 0.2, thrust: 5.5 },
      { time: 0.4, thrust: 5.0 },
      { time: 0.6, thrust: 0.0 }
    ]
  },
  {
    id: "quest-b6-4",
    name: "Quest B6-4",
    manufacturer: "Quest",
    totalMass: 19.2,
    propellantMass: 6.0,
    burnTime: 1.0,
    delayTime: 4.0,
    thrustPoints: [
      { time: 0, thrust: 0 },
      { time: 0.05, thrust: 11.5 },
      { time: 0.1, thrust: 12.5 },
      { time: 0.2, thrust: 5.8 },
      { time: 0.5, thrust: 5.5 },
      { time: 0.9, thrust: 5.0 },
      { time: 1.0, thrust: 0.0 }
    ]
  },
  {
    id: "quest-c6-5",
    name: "Quest C6-5",
    manufacturer: "Quest",
    totalMass: 24.5,
    propellantMass: 11.8,
    burnTime: 1.9,
    delayTime: 5.0,
    thrustPoints: [
      { time: 0, thrust: 0 },
      { time: 0.05, thrust: 13.0 },
      { time: 0.1, thrust: 14.0 },
      { time: 0.2, thrust: 5.5 },
      { time: 0.6, thrust: 5.2 },
      { time: 1.2, thrust: 4.8 },
      { time: 1.8, thrust: 4.5 },
      { time: 1.9, thrust: 0.0 }
    ]
  },
  {
    id: "quest-qjet-b4-4",
    name: "Q-Jet B4-4 (Composite)",
    manufacturer: "Quest",
    totalMass: 15.2,
    propellantMass: 4.5,
    burnTime: 1.2,
    delayTime: 4.0,
    thrustPoints: [
      { time: 0, thrust: 0 },
      { time: 0.1, thrust: 9.8 },
      { time: 0.2, thrust: 10.5 },
      { time: 0.4, thrust: 4.5 },
      { time: 0.8, thrust: 3.8 },
      { time: 1.2, thrust: 0.0 }
    ]
  },
  {
    id: "quest-qjet-c12-6",
    name: "Q-Jet C12-6 (Composite)",
    manufacturer: "Quest",
    totalMass: 17.5,
    propellantMass: 8.2,
    burnTime: 0.8,
    delayTime: 6.0,
    thrustPoints: [
      { time: 0, thrust: 0 },
      { time: 0.05, thrust: 24.5 },
      { time: 0.1, thrust: 26.0 },
      { time: 0.2, thrust: 12.5 },
      { time: 0.5, thrust: 11.0 },
      { time: 0.8, thrust: 0.0 }
    ]
  },
  {
    id: "quest-qjet-d16-6",
    name: "Q-Jet D16-6 (Composite)",
    manufacturer: "Quest",
    totalMass: 21.0,
    propellantMass: 10.5,
    burnTime: 0.9,
    delayTime: 6.0,
    thrustPoints: [
      { time: 0, thrust: 0 },
      { time: 0.05, thrust: 28.0 },
      { time: 0.1, thrust: 31.5 },
      { time: 0.2, thrust: 16.5 },
      { time: 0.5, thrust: 15.8 },
      { time: 0.9, thrust: 0.0 }
    ]
  },
  {
    id: "quest-qjet-e26-7",
    name: "Q-Jet E26-7 (Composite 24mm)",
    manufacturer: "Quest",
    totalMass: 35.0,
    propellantMass: 19.5,
    burnTime: 1.1,
    delayTime: 7.0,
    thrustPoints: [
      { time: 0, thrust: 0 },
      { time: 0.1, thrust: 42.0 },
      { time: 0.2, thrust: 48.0 },
      { time: 0.4, thrust: 26.5 },
      { time: 0.8, thrust: 24.0 },
      { time: 1.1, thrust: 0.0 }
    ]
  },
  {
    id: "quest-qjet-f43-7",
    name: "Q-Jet F43-7 (Composite 24mm)",
    manufacturer: "Quest",
    totalMass: 48.5,
    propellantMass: 28.5,
    burnTime: 0.8,
    delayTime: 7.0,
    thrustPoints: [
      { time: 0, thrust: 0 },
      { time: 0.05, thrust: 75.0 },
      { time: 0.1, thrust: 82.0 },
      { time: 0.2, thrust: 45.0 },
      { time: 0.5, thrust: 41.5 },
      { time: 0.8, thrust: 0.0 }
    ]
  },

  // --- AEROTECH COMPOSITE MOTORS ---
  {
    id: "aerotech-d10-5",
    name: "AeroTech D10-5",
    manufacturer: "Aerotech",
    totalMass: 28.0,
    propellantMass: 10.0,
    burnTime: 1.8,
    delayTime: 5.0,
    thrustPoints: [
      { time: 0, thrust: 0 },
      { time: 0.1, thrust: 18.0 },
      { time: 0.2, thrust: 12.0 },
      { time: 0.5, thrust: 10.2 },
      { time: 1.0, thrust: 9.8 },
      { time: 1.5, thrust: 9.2 },
      { time: 1.8, thrust: 0.0 }
    ]
  },
  {
    id: "aerotech-e15-7",
    name: "AeroTech E15-7",
    manufacturer: "Aerotech",
    totalMass: 52.0,
    propellantMass: 20.0,
    burnTime: 2.0,
    delayTime: 7.0,
    thrustPoints: [
      { time: 0, thrust: 0 },
      { time: 0.1, thrust: 32.0 },
      { time: 0.2, thrust: 24.5 },
      { time: 0.5, thrust: 15.5 },
      { time: 1.0, thrust: 14.8 },
      { time: 1.5, thrust: 14.2 },
      { time: 2.0, thrust: 0.0 }
    ]
  },
  {
    id: "aerotech-e20-6",
    name: "AeroTech E20-6",
    manufacturer: "Aerotech",
    totalMass: 55.0,
    propellantMass: 18.0,
    burnTime: 1.3,
    delayTime: 6.0,
    thrustPoints: [
      { time: 0, thrust: 0 },
      { time: 0.1, thrust: 38.0 },
      { time: 0.2, thrust: 42.0 },
      { time: 0.4, thrust: 22.0 },
      { time: 0.8, thrust: 19.8 },
      { time: 1.2, thrust: 18.5 },
      { time: 1.3, thrust: 0.0 }
    ]
  },
  {
    id: "aerotech-f15-8",
    name: "AeroTech F15-8",
    manufacturer: "Aerotech",
    totalMass: 102.0,
    propellantMass: 45.0,
    burnTime: 2.1,
    delayTime: 8.0,
    thrustPoints: [
      { time: 0, thrust: 0 },
      { time: 0.1, thrust: 21.0 },
      { time: 0.2, thrust: 25.6 },
      { time: 0.3, thrust: 23.4 },
      { time: 0.5, thrust: 16.5 },
      { time: 1.0, thrust: 15.2 },
      { time: 1.5, thrust: 14.8 },
      { time: 2.0, thrust: 13.9 },
      { time: 2.1, thrust: 0.0 }
    ]
  },
  {
    id: "aerotech-f20-7",
    name: "AeroTech F20-7",
    manufacturer: "Aerotech",
    totalMass: 88.0,
    propellantMass: 30.0,
    burnTime: 2.1,
    delayTime: 7.0,
    thrustPoints: [
      { time: 0, thrust: 0 },
      { time: 0.1, thrust: 34.0 },
      { time: 0.2, thrust: 38.5 },
      { time: 0.5, thrust: 21.0 },
      { time: 1.0, thrust: 19.5 },
      { time: 1.5, thrust: 18.2 },
      { time: 2.0, thrust: 17.5 },
      { time: 2.1, thrust: 0.0 }
    ]
  },
  {
    id: "aerotech-f40-6",
    name: "AeroTech F40-6",
    manufacturer: "Aerotech",
    totalMass: 93.0,
    propellantMass: 35.0,
    burnTime: 1.1,
    delayTime: 6.0,
    thrustPoints: [
      { time: 0, thrust: 0 },
      { time: 0.1, thrust: 72.0 },
      { time: 0.2, thrust: 81.0 },
      { time: 0.4, thrust: 42.0 },
      { time: 0.8, thrust: 38.0 },
      { time: 1.1, thrust: 0.0 }
    ]
  },
  {
    id: "aerotech-g40-7",
    name: "AeroTech G40-7",
    manufacturer: "Aerotech",
    totalMass: 125.0,
    propellantMass: 50.0,
    burnTime: 2.1,
    delayTime: 7.0,
    thrustPoints: [
      { time: 0, thrust: 0 },
      { time: 0.1, thrust: 65.0 },
      { time: 0.2, thrust: 52.0 },
      { time: 0.5, thrust: 41.0 },
      { time: 1.0, thrust: 39.5 },
      { time: 1.5, thrust: 38.2 },
      { time: 2.0, thrust: 37.0 },
      { time: 2.1, thrust: 0.0 }
    ]
  },
  {
    id: "aerotech-g80-10",
    name: "AeroTech G80-10",
    manufacturer: "Aerotech",
    totalMass: 145.0,
    propellantMass: 62.5,
    burnTime: 1.5,
    delayTime: 10.0,
    thrustPoints: [
      { time: 0, thrust: 0 },
      { time: 0.1, thrust: 92.0 },
      { time: 0.2, thrust: 112.5 },
      { time: 0.3, thrust: 98.0 },
      { time: 0.6, thrust: 84.0 },
      { time: 1.0, thrust: 78.0 },
      { time: 1.4, thrust: 70.0 },
      { time: 1.5, thrust: 0.0 }
    ]
  },
  {
    id: "aerotech-h128w-10",
    name: "AeroTech H128W-10 (L1 High Power)",
    manufacturer: "Aerotech",
    totalMass: 210.0,
    propellantMass: 98.0,
    burnTime: 1.5,
    delayTime: 10.0,
    thrustPoints: [
      { time: 0, thrust: 0 },
      { time: 0.1, thrust: 180.0 },
      { time: 0.2, thrust: 195.0 },
      { time: 0.4, thrust: 135.0 },
      { time: 0.8, thrust: 125.0 },
      { time: 1.2, thrust: 118.0 },
      { time: 1.5, thrust: 0.0 }
    ]
  },
  {
    id: "aerotech-i200w-14",
    name: "AeroTech I200W-14 (L1/L2 High Power)",
    manufacturer: "Aerotech",
    totalMass: 385.0,
    propellantMass: 190.0,
    burnTime: 1.9,
    delayTime: 14.0,
    thrustPoints: [
      { time: 0, thrust: 0 },
      { time: 0.1, thrust: 280.0 },
      { time: 0.2, thrust: 310.0 },
      { time: 0.5, thrust: 210.0 },
      { time: 1.0, thrust: 195.0 },
      { time: 1.5, thrust: 185.0 },
      { time: 1.9, thrust: 0.0 }
    ]
  },

  // --- USER DEFINED CUSTOM ---
  {
    id: "custom-g",
    name: "Custom (Type G Spec)",
    manufacturer: "User-Defined",
    totalMass: 110.0,
    propellantMass: 55.0,
    burnTime: 1.8,
    delayTime: 6.0,
    thrustPoints: [
      { time: 0, thrust: 0 },
      { time: 0.1, thrust: 40 },
      { time: 0.2, thrust: 45 },
      { time: 0.4, thrust: 35 },
      { time: 0.8, thrust: 30 },
      { time: 1.2, thrust: 25 },
      { time: 1.6, thrust: 20 },
      { time: 1.8, thrust: 0 }
    ]
  }
];
