import React, { use } from 'react';
import { useEffect, useState } from "react";
import { testService } from "./services/testservice";
import './App.css';

function App() {
  const [pingdata, setPingData] = useState<string>("Loading...");
  const [simplipydata, setSimplipyData] = useState<string>("Loading...");

  useEffect(() => {
    testService.ping().then(res => setPingData(res));
  }, []);

  useEffect(() => {
    testService.callLlamaTest().then(res => setSimplipyData(res));
  }, []);

  return (
    <div>
      <p>Ping data: {pingdata}</p>
      <p>Simplipy data: {simplipydata}</p>
    </div>
  );
}

export default App;
