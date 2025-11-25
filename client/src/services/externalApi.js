import axios from 'axios';

const API_URL = 'https://www.feriadosapp.com/api/holidays.json';

export const getFeriados = async (year) => {
  try {
    const response = await axios.get(API_URL);
    const feriados = response.data.data;
    
    const feriadosFiltrados = feriados.filter(f => f.date.startsWith(year.toString()));
    
    return feriadosFiltrados;
  } catch (error) {
    console.error("Error al obtener feriados:", error);
    return []; 
  }
};