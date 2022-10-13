import React, { useState, useEffect } from "react";
import axios from 'axios'
import { ResponsiveContainer } from "recharts";
import './App.css';
import cblLogoTransparent from './images/cbltransparent.png'
import logo from './images/logo.png'
import Chart from './BarChart/chart.jsx'
var w3cwebsocket = require('websocket').w3cwebsocket;
// const client = new w3cwebsocket('ws://10.0.0.124:8000/');

const isSame = (first, second) => (
	first.LineID === second.LineID
	&& first.ShiftID === second.ShiftID
	&& first.OverTime === second.OverTime
	// && first.ShiftDate === second.ShiftDate
);

const App = () => {
	const [chartData, setChartData] = useState([]); 

	function connect() { 
		const client = new w3cwebsocket('ws://localhost:8000/');
		client.onopen = function () {
			console.log("connected to server");
		};
      
		client.onmessage = (message) => {
			const data = JSON.parse(message.data);
			console.log(data);

			if (Array.isArray(data)) { 
				setChartData(data) 
			} else if (typeof (data) === 'object') {
				const { before, after } = data.payload;
				if (before) {
					before.ShiftDate = new Date(before.ShiftDate * 24 * 3600 * 1000);
					// console.log(before.ShiftDate)
				}
				if (after) {
					after.ShiftDate = new Date(after.ShiftDate * 24 * 3600 * 1000);
					// console.log(after.ShiftDate);
				}
				// console.log({ before, after }); 
				if (before == null && after != null) {
					//insert query  
					console.log("Insert Run");
					const exists = chartData.some((i) => isSame(i, after)) ?? false
					if(!exists){
						setChartData(ps => [...ps, after])
					}					

					// if(!exists){
					// 	setChartData(ps => [...ps, after])
					// }else{ 
					// 	console.log("Record already exists");
					// }

					// if (!exists) {
					// 	console.log("not exists");
					// 	setChartData(ps => [...ps, after])
					// }else{
					// 	console.log("exists");
					// }
					// console.log(chartData);
				} else if (before != null && after != null) {
					//update query
					console.log('update running');
					setChartData(prev => prev.map(row =>
						isSame(row, before)
							? after
							: row
					)); 
				} else if (after === null) {
					//delete query
					console.log("Delete Query Run");
					setChartData(prev => prev.filter(row =>
						!isSame(row, before)
					));
				}
			} else { 
				console.log('undefined');
			}

			// 	// setChartData(ps => [...ps, data])
			// }
			// let temp = [...chartData];
			// let data = JSON.parse(message.data);
			// temp.push(data.after)
			// setChartData(temp);
		};

		client.onclose = function (e) {
			console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
			setTimeout(function () {
				connect();
			}, 1000);
		};

		client.onerror = function (err) {
			console.error('Socket encountered error: ', err.message, 'Closing socket');
			client.close();
		};
	}

	// connect()


	useEffect(
		() => {
			connect()
		}, []
	)
	// useEffect(()=>{
	// 	axios.get('http://localhost:5003/getall')
	// 	 .then((response)=>{
	// 		// console.log(response.data)
	// 		setChartData(response.data.recordset)
	// 	 }).catch(err=>console.log(err))
	// },[])

	return (
		<div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
			<div style={{ width: '95%', height: '18%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
				<header style={{ backgroundColor: 'wheat', borderRadius: '20px', width: '100%', height: '70%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} >
					<div style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: "100%" }}>
						<img style={{ width: '100%', marginLeft: '10px' }} src={cblLogoTransparent} alt='WiMetrix' />
					</div>
					<h1 style={{ flex: 15, textAlign: 'center', color: 'GrayText', fontWeight: 'lighter', fontSize: '2.5rem' }}>Line Production</h1>
					<div style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
						<img src={logo} style={{ width: '90%', marginRight: '20px' }} alt='WiMetrix' />
					</div>
				</header>
			</div>
			<div style={{ width: '95%', height: '80%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', backgroundColor: 'rgb(232, 232, 233)' }} >
				<Chart chartData={chartData} />
			</div>
		</div>
	);
}
export default App;