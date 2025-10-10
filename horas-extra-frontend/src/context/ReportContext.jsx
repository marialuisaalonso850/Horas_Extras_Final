import { createContext, useContext, useState } from "react";

// 1. Crear contexto
const ReportContext = createContext();

// 2. Hook para consumir el contexto facilmente

// 3. Provider
export const ReportProvider = ({ children }) => {
  
  const [ reporte, setReporte ] = useState([]);

  
  console.log(reporte);
}


export const useReport = () => useContext(ReportContext);

