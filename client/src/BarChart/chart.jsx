import "./style.css";
// import Chart from 'chart.js'
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";


export default function Chart(props) {
  // console.log(props.chartData)
  // console.log();

  const dt = [];
  for (const i of props.chartData) {
    const existing = dt.find(item => item.LineID === i.LineID);
    // console.log(i, existing);
    if (existing) {
      existing.LineProduction += i.LineProduction;
    }
    else {
      // console.log(i.LineProduction);
      dt.push({ ...i });
      // dt.push(i)
    }
  }
  // console.log(props.chartData);
  if (dt.length === 0) {
    return <div>Loading...</div>;
  }
  return (
      <ResponsiveContainer >
        <BarChart
          data={dt} //props.chartData
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="LineID" sort="ascending"/> //LineID
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="LineProduction" fill="#8884d8" /> //LineProduction
          {/* <Bar dataKey="pv" fill="#888" stackId="a" /> //LineProduction */}
          {/* <Bar dataKey="amt" fill="#88878" /> //LineProduction */}
        </BarChart>
      </ResponsiveContainer>
  );
}