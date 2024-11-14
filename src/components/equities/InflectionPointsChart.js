"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useLayoutEffect,
} from "react";
import * as d3 from "d3";
import debounce from "lodash.debounce";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Define inflection points
const inflectionPoints = [
  {
    date: "2000-03-24",
    level: 1527,
    pe: 25.2,
    change: "+106%",
    note: "Dot-com Peak",
    boxTitle: "Tech Bubble Peak",
  },
  {
    date: "2002-10-09",
    level: 777,
    pe: 14.1,
    change: "-49%",
    note: "Post Dot-com Bottom",
    boxTitle: "Market Bottom",
  },
  {
    date: "2007-10-09",
    level: 1565,
    pe: 15.1,
    change: "+101%",
    note: "Pre-Financial Crisis Peak",
    boxTitle: "Housing Bubble Peak",
  },
  {
    date: "2009-03-09",
    level: 677,
    pe: 10.4,
    change: "-57%",
    note: "Financial Crisis Bottom",
    boxTitle: "GFC Bottom",
  },
  {
    date: "2020-02-19",
    level: 3386,
    pe: 19.2,
    change: "+401%",
    note: "Pre-Covid Peak",
    boxTitle: "Pre-Pandemic Peak",
  },
  {
    date: "2020-03-23",
    level: 2237,
    pe: 13.3,
    change: "-34%",
    note: "Covid Bottom",
    boxTitle: "Pandemic Bottom",
  },
  {
    date: "2022-01-03",
    level: 4797,
    pe: 21.4,
    change: "+114%",
    note: "Pre-Inflation Peak",
    boxTitle: "Market Peak",
  },
  {
    date: "2022-10-12",
    level: 3577,
    pe: 15.7,
    change: "-25%",
    note: "Inflation Era Bottom",
    boxTitle: "Fed Tightening Bottom",
  },
  {
    date: "2024-10-31",
    level: 5705,
    pe: 21.3,
    change: "+60%",
    note: "Current Level",
    boxTitle: "Current Market",
  },
];

const indexConfig = {
  sp500: { color: "#2e8b57", name: "S&P 500", primary: true },
  nasdaq: { color: "#1e88e5", name: "NASDAQ", primary: false },
  growth: { color: "#9c27b0", name: "Russell Growth", primary: false },
  value: { color: "#ff9800", name: "Russell Value", primary: false },
};

function LineChart({ data, width, inflectionPoints, visibleIndices }) {
  const height = 800;
  const padding = { top: 100, right: 180, bottom: 100, left: 100 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const parseDate = d3.utcParse("%Y-%m-%d");

  useEffect(() => {
    if (!svgRef.current || !data.sp500?.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Add title
    svg
      .append("text")
      .attr("x", padding.left + chartWidth / 2)
      .attr("y", padding.top / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "24px")
      .attr("font-weight", "bold")
      .attr("fill", "#1a202c")
      .text("S&P 500 Index at Market Inflection Points");

    const tooltip = d3
      .select(tooltipRef.current)
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "rgba(255, 255, 255, 0.95)")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("padding", "10px")
      .style("box-shadow", "0 2px 8px rgba(0,0,0,0.1)")
      .style("opacity", 0);

    // Determine active indices
    const activeIndices = Object.keys(visibleIndices).filter(
      (index) => visibleIndices[index]
    );
    const secondaryIndices = activeIndices.filter(
      (index) => !indexConfig[index].primary
    );

    // Create scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data.sp500, (d) => parseDate(d.date)))
      .range([0, chartWidth]);

    const yScales = {};
    activeIndices.forEach((index) => {
      yScales[index] = d3
        .scaleLinear()
        .domain([0, d3.max(data[index], (d) => d.value) * 1.05])
        .range([chartHeight, 0]);
    });

    // Create chart area with clip path
    const defs = svg.append("defs");
    defs
      .append("clipPath")
      .attr("id", "chart-clip")
      .append("rect")
      .attr("width", chartWidth)
      .attr("height", chartHeight);

    const content = svg
      .append("g")
      .attr("transform", `translate(${padding.left}, ${padding.top})`)
      .attr("clip-path", "url(#chart-clip)");

    // Add grid lines
    content
      .append("g")
      .attr("class", "grid-lines")
      .selectAll("line")
      .data(yScales.sp500.ticks(10))
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", chartWidth)
      .attr("y1", (d) => yScales.sp500(d))
      .attr("y2", (d) => yScales.sp500(d))
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", 0.5);

    // Create line generators
    const lineGenerators = {};
    activeIndices.forEach((index) => {
      lineGenerators[index] = d3
        .line()
        .x((d) => xScale(parseDate(d.date)))
        .y((d) => yScales[index](d.value))
        .curve(d3.curveMonotoneX);
    });
    // Draw lines
    activeIndices.forEach((index) => {
      content
        .append("path")
        .datum(data[index])
        .attr("class", `line-${index}`)
        .attr("fill", "none")
        .attr("stroke", indexConfig[index].color)
        .attr("stroke-width", 2)
        .attr("d", lineGenerators[index]);
    });

    // Add annotations
    const annotationGroup = content.append("g").attr("class", "annotations");

    const annotations = annotationGroup
      .selectAll(".annotation")
      .data(inflectionPoints)
      .enter()
      .append("g")
      .attr("class", "annotation");

    annotations.each(function (point) {
      const x = xScale(parseDate(point.date));
      const y = yScales.sp500(point.level);

      const annotation = d3.select(this);

      const boxWidth = 180;
      const boxHeight = 110;
      const margin = 12;

      // Smart positioning to avoid overlap
      const isRightHalf = x > chartWidth / 2;
      const isTopHalf = y < chartHeight / 2;

      let boxX = isRightHalf ? x - boxWidth - margin : x + margin;
      let boxY = isTopHalf ? y + margin : y - boxHeight - margin;

      boxX = Math.max(0, Math.min(chartWidth - boxWidth, boxX));
      boxY = Math.max(0, Math.min(chartHeight - boxHeight, boxY));

      const connectorEndX = isRightHalf ? boxX + boxWidth : boxX;
      const connectorEndY = boxY + boxHeight / 2;

      // Connector line
      annotation
        .append("path")
        .attr("class", "connector")
        .attr(
          "d",
          `M ${x} ${y} L ${
            x + (isRightHalf ? -10 : 10)
          } ${y} L ${connectorEndX} ${connectorEndY}`
        )
        .attr("fill", "none")
        .attr("stroke", "#2c3e50")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3,3")
        .attr("opacity", 0.7);

      // Point
      annotation
        .append("circle")
        .attr("class", "point")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 4)
        .attr("fill", "#2c3e50")
        .attr("opacity", 0.8);

      // Label box group
      const labelGroup = annotation
        .append("g")
        .attr("class", "label-group")
        .attr("transform", `translate(${boxX}, ${boxY})`);

      // Box background
      labelGroup
        .append("rect")
        .attr("width", boxWidth)
        .attr("height", boxHeight)
        .attr("fill", "white")
        .attr("stroke", "#e2e8f0")
        .attr("stroke-width", 1)
        .attr("rx", 4)
        .attr("opacity", 0.9);

      // Box Title
      labelGroup
        .append("text")
        .attr("x", margin)
        .attr("y", margin + 12)
        .attr("font-size", "13px")
        .attr("font-weight", "700")
        .attr("fill", "#1a202c")
        .text(point.boxTitle);

      // Divider
      labelGroup
        .append("line")
        .attr("x1", margin)
        .attr("x2", boxWidth - margin)
        .attr("y1", margin + 20)
        .attr("y2", margin + 20)
        .attr("stroke", "#e2e8f0")
        .attr("stroke-width", 1);

      // Date
      labelGroup
        .append("text")
        .attr("x", margin)
        .attr("y", margin + 40)
        .attr("font-size", "12px")
        .attr("fill", "#2c3e50")
        .text(d3.timeFormat("%B %d, %Y")(parseDate(point.date)));

      // Level
      labelGroup
        .append("text")
        .attr("x", margin)
        .attr("y", margin + 60)
        .attr("font-size", "12px")
        .attr("fill", "#2c3e50")
        .text(`Level: ${point.level.toLocaleString()}`);

      // P/E Ratio
      labelGroup
        .append("text")
        .attr("x", margin)
        .attr("y", margin + 80)
        .attr("font-size", "12px")
        .attr("fill", "#2c3e50")
        .text(`P/E (fwd.) = ${point.pe}x`);

      // Change percentage
      if (point.change) {
        labelGroup
          .append("text")
          .attr("x", boxWidth - margin)
          .attr("y", margin + 40)
          .attr("text-anchor", "end")
          .attr("font-size", "12px")
          .attr("font-weight", "600")
          .attr("fill", point.change.includes("+") ? "#38a169" : "#e53e3e")
          .text(point.change);
      }
    });

    // Add zoom behavior with annotation updates
    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 5])
      .extent([
        [0, 0],
        [chartWidth, chartHeight],
      ])
      .translateExtent([
        [0, -Infinity],
        [chartWidth, Infinity],
      ])
      .on("zoom", zoomed);

    function zoomed(event) {
      const newXScale = event.transform.rescaleX(xScale);

      // Update lines
      activeIndices.forEach((index) => {
        content.select(`.line-${index}`).attr(
          "d",
          lineGenerators[index].x((d) => newXScale(parseDate(d.date)))
        );
      });

      // Update annotations
      content.selectAll(".annotation").each(function (point) {
        const annotation = d3.select(this);
        const x = newXScale(parseDate(point.date));
        const y = yScales.sp500(point.level);

        const boxWidth = 180;
        const boxHeight = 110;
        const margin = 12;

        const isRightHalf = x > chartWidth / 2;
        const isTopHalf = y < chartHeight / 2;

        let boxX = isRightHalf ? x - boxWidth - margin : x + margin;
        let boxY = isTopHalf ? y + margin : y - boxHeight - margin;

        boxX = Math.max(0, Math.min(chartWidth - boxWidth, boxX));
        boxY = Math.max(0, Math.min(chartHeight - boxHeight, boxY));

        const connectorEndX = isRightHalf ? boxX + boxWidth : boxX;
        const connectorEndY = boxY + boxHeight / 2;

        // Update point position
        annotation.select(".point").attr("cx", x).attr("cy", y);

        // Update connector line
        annotation
          .select(".connector")
          .attr(
            "d",
            `M ${x} ${y} L ${
              x + (isRightHalf ? -10 : 10)
            } ${y} L ${connectorEndX} ${connectorEndY}`
          );

        // Update label group position
        annotation
          .select(".label-group")
          .attr("transform", `translate(${boxX}, ${boxY})`);
      });

      // Update x-axis
      svg.select(".x-axis").call(xAxis.scale(newXScale));
    }
    // Add axes
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(d3.timeYear.every(2))
      .tickFormat(d3.timeFormat("%Y"));

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr(
        "transform",
        `translate(${padding.left}, ${padding.top + chartHeight})`
      )
      .call(xAxis);

    // Primary Y-axis (left)
    const primaryYAxis = d3
      .axisLeft(yScales.sp500)
      .ticks(10)
      .tickFormat(d3.format(",.0f"));

    svg
      .append("g")
      .attr("class", "y-axis-primary")
      .attr("transform", `translate(${padding.left}, ${padding.top})`)
      .call(primaryYAxis);

    // Secondary Y-axes (right)
    secondaryIndices.forEach((index, i) => {
      const secondaryYAxis = d3
        .axisRight(yScales[index])
        .ticks(10)
        .tickFormat(d3.format(",.0f"));

      svg
        .append("g")
        .attr("class", `y-axis-${index}`)
        .attr(
          "transform",
          `translate(${padding.left + chartWidth + i * 60}, ${padding.top})`
        )
        .call(secondaryYAxis);
    });

    // Add legend
    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${padding.left}, ${padding.top - 40})`);

    activeIndices.forEach((index, i) => {
      const legendItem = legend
        .append("g")
        .attr("transform", `translate(${i * 150}, 0)`);

      legendItem
        .append("line")
        .attr("x1", 0)
        .attr("x2", 20)
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("stroke", indexConfig[index].color)
        .attr("stroke-width", 2);

      legendItem
        .append("text")
        .attr("x", 30)
        .attr("y", 4)
        .text(indexConfig[index].name)
        .attr("font-size", "12px")
        .attr("fill", "#333");
    });

    svg.call(zoom);
  }, [data, width, height, inflectionPoints, visibleIndices]);

  return (
    <>
      <div ref={tooltipRef}></div>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-full"
      ></svg>
    </>
  );
}

// Main wrapper component
export default function InflectionPointsChart() {
  const [containerWidth, setContainerWidth] = useState(0);
  const [data, setData] = useState({
    sp500: [],
    nasdaq: [],
    growth: [],
    value: [],
  });
  const [visibleIndices, setVisibleIndices] = useState({
    sp500: true,
    nasdaq: false,
    growth: false,
    value: false,
  });
  const [isLoading, setIsLoading] = useState({
    sp500: true,
    nasdaq: false,
    growth: false,
    value: false,
  });
  const [error, setError] = useState(null);

  const containerRef = useRef(null);

  const handleResize = useMemo(
    () =>
      debounce(() => {
        if (containerRef.current) {
          setContainerWidth(containerRef.current.getBoundingClientRect().width);
        }
      }, 250),
    []
  );

  useLayoutEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      handleResize.cancel();
    };
  }, [handleResize]);

  useEffect(() => {
    const fetchData = async (index) => {
      if (!visibleIndices[index] || data[index].length > 0) return;

      try {
        setIsLoading((prev) => ({ ...prev, [index]: true }));
        setError(null);

        const response = await axios.get(`/api/historical-data/${index}`);

        if (response.data && Array.isArray(response.data.data)) {
          setData((prev) => ({
            ...prev,
            [index]: response.data.data.map((item) => ({
              date: item.date,
              value: item.value,
            })),
          }));
        } else {
          throw new Error("Invalid data format");
        }
      } catch (err) {
        console.error(`Error fetching ${index} data:`, err);
        setError(
          `Failed to load ${indexConfig[index].name} data. Please try again later.`
        );
      } finally {
        setIsLoading((prev) => ({ ...prev, [index]: false }));
      }
    };

    fetchData("sp500");
    Object.keys(visibleIndices)
      .filter((index) => index !== "sp500" && visibleIndices[index])
      .forEach(fetchData);
  }, [visibleIndices]);

  const toggleIndex = (index) => {
    if (index === "sp500") return;
    setVisibleIndices((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Market Indices Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          {/* Market Statistics Table */}
          <div className="w-full overflow-x-auto mb-6">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 text-left border">Characteristic</th>
                  <th className="p-2 text-right border">Mar 2000</th>
                  <th className="p-2 text-right border">Oct 2007</th>
                  <th className="p-2 text-right border">Feb 2020</th>
                  <th className="p-2 text-right border">Jan 2022</th>
                  <th className="p-2 text-right border">Oct 2024</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border font-medium">Index Level</td>
                  <td className="p-2 border text-right">1,527</td>
                  <td className="p-2 border text-right">1,565</td>
                  <td className="p-2 border text-right">3,386</td>
                  <td className="p-2 border text-right">4,797</td>
                  <td className="p-2 border text-right">5,705</td>
                </tr>
                <tr>
                  <td className="p-2 border font-medium">P/E Ratio (fwd.)</td>
                  <td className="p-2 border text-right">25.2x</td>
                  <td className="p-2 border text-right">15.1x</td>
                  <td className="p-2 border text-right">19.2x</td>
                  <td className="p-2 border text-right">21.4x</td>
                  <td className="p-2 border text-right">21.3x</td>
                </tr>
                <tr>
                  <td className="p-2 border font-medium">Dividend Yield</td>
                  <td className="p-2 border text-right">1.4%</td>
                  <td className="p-2 border text-right">1.9%</td>
                  <td className="p-2 border text-right">1.9%</td>
                  <td className="p-2 border text-right">1.3%</td>
                  <td className="p-2 border text-right">1.4%</td>
                </tr>
                <tr>
                  <td className="p-2 border font-medium">10-yr. Treasury</td>
                  <td className="p-2 border text-right">6.2%</td>
                  <td className="p-2 border text-right">4.7%</td>
                  <td className="p-2 border text-right">1.6%</td>
                  <td className="p-2 border text-right">1.6%</td>
                  <td className="p-2 border text-right">4.3%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Index Toggle Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            {Object.entries(indexConfig).map(([index, config]) => (
              <button
                key={index}
                onClick={() => toggleIndex(index)}
                disabled={isLoading[index] || index === "sp500"}
                className={`
            relative px-4 py-2 rounded-md transition-all
            ${
              visibleIndices[index]
                ? "bg-blue-500 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }
            ${isLoading[index] ? "opacity-70 cursor-wait" : ""}
            ${index === "sp500" ? "cursor-not-allowed opacity-90" : ""}
          `}
              >
                <span className="flex items-center gap-2">
                  {config.name}
                  {isLoading[index] && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                </span>
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Chart Container */}
          <div ref={containerRef} className="relative min-h-[800px]">
            {containerWidth > 0 && data.sp500.length > 0 ? (
              <LineChart
                data={data}
                width={containerWidth}
                inflectionPoints={inflectionPoints}
                visibleIndices={visibleIndices}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-500">Loading chart data...</p>
                </div>
              </div>
            )}
          </div>

          {/* Source Attribution */}
          <div className="text-xs text-gray-500 mt-4 text-right">
            Source:{" "}
            <a
              href="https://financialmodelingprep.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Financial Modeling Prep
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
