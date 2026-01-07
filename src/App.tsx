import React from 'react';
import logo from './logo.svg';
import { useEffect, useState } from "react";
import { testService } from "./services/testservice";
import './App.css';

function App() {
  const [data, setData] = useState<string>("Loading...");

  useEffect(() => {
    testService.ping().then(res => setData(res));
  }, []);

  return (
    <div>
      <p>{data}</p>
    </div>
  );
}

export default App;
