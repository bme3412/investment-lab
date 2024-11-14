import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Label,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const CYCLE_PHASES = {
  EARLY_UPTURN: {
    name: "Early Upturn",
    characteristics: [
      "Inventory normalization",
      "Improving orders",
      "Stabilizing prices",
    ],
    range: { min: 0, max: 0.3 },
  },
  MID_UPTURN: {
    name: "Mid Upturn",
    characteristics: [
      "Rising utilization",
      "Lead time extension",
      "Price increases",
    ],
    range: { min: 0.3, max: 0.6 },
  },
  LATE_UPTURN: {
    name: "Late Upturn",
    characteristics: [
      "Peak utilization",
      "Double ordering",
      "Maximum pricing power",
    ],
    range: { min: 0.6, max: 1.0 },
  },
  EARLY_DOWNTURN: {
    name: "Early Downturn",
    characteristics: [
      "Order cancellations",
      "Initial inventory build",
      "Price pressure",
    ],
    range: { min: -0.3, max: 0 },
  },
  MID_DOWNTURN: {
    name: "Mid Downturn",
    characteristics: [
      "Inventory correction",
      "Utilization drops",
      "Price erosion",
    ],
    range: { min: -0.6, max: -0.3 },
  },
  LATE_DOWNTURN: {
    name: "Late Downturn",
    characteristics: [
      "Inventory depletion",
      "Minimum utilization",
      "Price stabilization",
    ],
    range: { min: -1.0, max: -0.6 },
  },
};

const HISTORICAL_PERIODS = [
  {
    period: "2016-2018",
    name: "Memory Super Cycle",
    phase: "Boom",
    start: "2016-01-01",
    end: "2018-12-31",
    description: "DRAM & NAND shortages",
    color: "rgba(4, 120, 87, 0.1)",
  },
  {
    period: "2019",
    name: "Trade War & Memory Downturn",
    phase: "Bust",
    start: "2019-01-01",
    end: "2019-12-31",
    description: "US-China tensions",
    color: "rgba(220, 38, 38, 0.1)",
  },
  {
    period: "2020-2021",
    name: "Chip Shortage",
    phase: "Boom",
    start: "2020-03-01",
    end: "2021-12-31",
    description: "Supply chain disruption",
    color: "rgba(4, 120, 87, 0.1)",
  },
  {
    period: "2022-2023",
    name: "Inventory Correction",
    phase: "Bust",
    start: "2022-01-01",
    end: "2023-06-30",
    description: "Post-COVID adjustment",
    color: "rgba(220, 38, 38, 0.1)",
  },
  {
    period: "2023-2024",
    name: "AI Driven Recovery",
    phase: "Early Upturn",
    start: "2023-07-01",
    end: "2024-12-31",
    description: "Data center & AI demand",
    color: "rgba(4, 120, 87, 0.1)",
  },
];

const METHODOLOGY = {
  demand: {
    name: "Demand Indicators (40%)",
    components: [
      {
        name: "Revenue Growth",
        weight: 25,
        description: "YoY organic growth excluding M&A",
      },
      {
        name: "Bookings Trend",
        weight: 15,
        description: "Book-to-bill ratio & backlog changes",
      },
    ],
  },
  pricing: {
    name: "Pricing Power (25%)",
    components: [
      {
        name: "Gross Margins",
        weight: 15,
        description: "Sequential & YoY changes",
      },
      {
        name: "ASP Trends",
        weight: 10,
        description: "Product pricing momentum",
      },
    ],
  },
  supply: {
    name: "Supply Metrics (35%)",
    components: [
      {
        name: "Inventory Levels",
        weight: 20,
        description: "DOI & channel inventory",
      },
      {
        name: "Utilization Rates",
        weight: 15,
        description: "Fab & equipment utilization",
      },
    ],
  },
};

const COMPANIES_BY_SEGMENT = {
    'Fabless': [
      'NVDA', // NVIDIA
      'AMD',  // Advanced Micro Devices
      'QCOM', // Qualcomm
      'MRVL', // Marvell
      'NXPI', // NXP
      'AVGO', // Broadcom
      'SIMO', // Silicon Motion
      'OIIM'  // O2Micro
    ],
    'Foundry': [
      'TSM',   // TSMC
      'UMC',   // United Microelectronics
      'SUMCF', // SMIC
      'SSNLF'  // Samsung Electronics
    ],
    'IDM': [
      'INTC',  // Intel
      'TXN',   // Texas Instruments
      'SILC',  // Silicom
      'VSH'    // Vishay
    ],
    'Memory': [
      'MU',    // Micron
      'WDC',   // Western Digital
      'STX',   // Seagate
      'KIOXF', // Kioxia
      'NTDOF'  // Nanya Technology
    ],
    'Equipment & Materials': [
      'ASML',  // ASML Holding
      'AMAT',  // Applied Materials
      'KLAC',  // KLA Corporation
      'LRCX',  // Lam Research
      'TOELY', // Tokyo Electron
      'CCMP',  // CMC Materials
      'MKSI',  // MKS Instruments
      'TER',   // Teradyne
      'ACLS',  // Axcelis Technologies
      'UCTT',  // Ultra Clean Holdings
      'GWGRF'  // Siltronic
    ],
    'Analog & Mixed Signal': [
      'ADI',   // Analog Devices
      'ON',    // ON Semiconductor
      'TXN'    // Texas Instruments (also in IDM)
    ]
  };

const SemiconductorCycleChart = ({ data }) => {
  const formattedData = data.map((d) => ({
    ...d,
    formattedDate: new Date(d.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    }),
    composite_score: Math.max(Math.min(d.composite_score || 0, 1), -1),
  }));

  const currentStatus = data[data.length - 1] || {};
  const currentPhase = currentStatus.cycle_phase || "Unknown";

  const determinePhase = (score) => {
    for (const phase of Object.values(CYCLE_PHASES)) {
      if (score >= phase.range.min && score <= phase.range.max) {
        return phase.name;
      }
    }
    return "Unknown";
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length && payload[0].payload) {
      const data = payload[0].payload;
      const phase = determinePhase(data.composite_score);
      const phaseInfo = Object.values(CYCLE_PHASES).find(
        (p) => p.name === phase
      );

      return (
        <div className="bg-white p-4 border rounded shadow-lg min-w-[200px]">
          <p className="font-bold text-gray-800 border-b pb-2">
            {data.formattedDate}
          </p>
          <div className="mt-2 space-y-2">
            <div>
              <p className="text-blue-600 font-medium text-lg">
                {(data.composite_score || 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">Cycle Score</p>
            </div>
            <div className="pt-2 border-t">
              <p className="font-medium text-gray-700">{phase}</p>
              {phaseInfo && (
                <ul className="mt-1 text-xs text-gray-600 list-disc pl-4">
                  {phaseInfo.characteristics.map((char, idx) => (
                    <li key={idx}>{char}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardContent>
        

        {/* Methodology and Guide Grid - Made more compact */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Left Panel - Analysis Components */}
          <div className="bg-gray-50 rounded-lg p-3 border">
            <h3 className="text-xs font-semibold mb-2 text-gray-700">
              Cycle Analysis Components
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(METHODOLOGY).map((category) => (
                <div key={category.name} className="space-y-1">
                  <p className="text-xs font-medium text-gray-700">
                    {category.name}
                  </p>
                  {category.components.map((component) => (
                    <div
                      key={component.name}
                      className="flex items-center space-x-1"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      <div className="text-xs">
                        <span className="font-medium">{component.name}</span>
                        <span className="text-gray-500 ml-1">
                          ({component.weight}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Simplified How to Read Guide */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <h3 className="text-xs font-semibold mb-2 text-gray-700">
              How to Read This Chart
            </h3>

            <div className="space-y-3">
              {/* Cycle Scale Guide */}
              <div className="space-y-1">
                <div className="relative h-8 bg-gradient-to-r from-red-100 via-gray-100 to-green-100 rounded-lg">
                  <div className="absolute w-full flex justify-between px-2 -top-1">
                    <span className="text-xs font-medium text-red-700">
                      -1.0
                    </span>
                    <span className="text-xs font-medium text-gray-600">0</span>
                    <span className="text-xs font-medium text-green-700">
                      +1.0
                    </span>
                  </div>
                  <div className="absolute w-full flex justify-between px-2 top-4">
                    <div className="text-[10px] text-red-700">
                      Deep Downcycle
                    </div>
                    <div className="text-[10px] text-gray-600">Neutral</div>
                    <div className="text-[10px] text-green-700">
                      Peak Upcycle
                    </div>
                  </div>
                </div>
              </div>

              {/* Phase Definitions - More compact */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] font-medium text-green-700 mb-1">
                    Upcycle Phases:
                  </p>
                  <div className="text-[10px] space-y-0.5">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-200 rounded-full"></div>
                      <span>Early (0 to 0.3)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      <span>Mid (0.3 to 0.6)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                      <span>Late (0.6 to 1.0)</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-red-700 mb-1">
                    Downcycle Phases:
                  </p>
                  <div className="text-[10px] space-y-0.5">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-red-200 rounded-full"></div>
                      <span>Early (0 to -0.3)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                      <span>Mid (-0.3 to -0.6)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                      <span>Late (-0.6 to -1.0)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chart - Increased height */}
        <div className="h-[700px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{ top: 40, right: 60, left: 40, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="formattedDate"
                tick={{ fill: "#374151", fontSize: 12 }}
                tickLine={{ stroke: "#374151" }}
                interval={30}
                angle={-45}
                textAnchor="end"
                height={60}
                padding={{ left: 20, right: 20 }}
                style={{ fontWeight: 500 }}
              />
              <YAxis
                domain={[-1, 1]}
                ticks={[-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1]}
                tick={{ fill: "#374151", fontSize: 12 }}
                tickLine={{ stroke: "#374151" }}
                style={{ fontWeight: 500 }}
              >
                <Label
                  value="Semiconductor Cycle Position"
                  position="insideLeft"
                  angle={-90}
                  offset={15}
                  style={{
                    textAnchor: "middle",
                    fill: "#111827",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                />
              </YAxis>
              <Tooltip content={<CustomTooltip />} />

              {/* Phase threshold lines - Improved visibility */}
              {Object.values(CYCLE_PHASES).map((phase) => (
                <ReferenceLine
                  key={phase.name}
                  y={phase.range.max}
                  stroke={phase.range.max > 0 ? "#047857" : "#dc2626"}
                  strokeDasharray="3 3"
                  strokeOpacity={0.6}
                  strokeWidth={1.5}
                >
                  <Label
                    value={phase.name}
                    position="right"
                    fontSize={11}
                    fill={phase.range.max > 0 ? "#047857" : "#dc2626"}
                    fontWeight={500}
                  />
                </ReferenceLine>
              ))}

              {/* Historical period bands - Enhanced visibility */}
              {HISTORICAL_PERIODS.map((period) => (
                <ReferenceArea
                  key={period.name}
                  x1={new Date(period.start).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                  })}
                  x2={new Date(period.end).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                  })}
                  fill={period.color}
                  strokeWidth={0}
                >
                  <Label
                    value={`${period.name}`}
                    position="top"
                    fontSize={12}
                    fill={period.phase === "Boom" ? "#047857" : "#dc2626"}
                    fontWeight={500}
                  />
                </ReferenceArea>
              ))}

              <Line
                type="linear"
                dataKey="composite_score"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={false}
                name="Industry Position"
                activeDot={{ r: 6, fill: "#2563eb" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Companies by Segment - More compact */}
        <div className="mt-4 bg-gray-50 rounded-lg p-3 border">
          <p className="text-xs font-medium mb-2">
            Tracked Companies by Segment
          </p>
          <div className="grid grid-cols-3 gap-x-6 gap-y-2">
            {Object.entries(COMPANIES_BY_SEGMENT).map(
              ([segment, companies]) => (
                <div key={segment}>
                  <div className="text-xs font-medium text-gray-700">
                    {segment}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {companies.join(", ")}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SemiconductorCycleChart;
