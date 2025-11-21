import axios from 'axios';

const API_URL = 'https://www.feriadosapp.com/api/holidays.json';

export const getFeriados = async (year) => {
  try {
    const response = await axios.get(API_URL);
    // La API devuelve todos los feriados históricos.
    // Filtramos aquí para simular la búsqueda por parámetro requerida.
    const feriados = response.data.data;
    
    // Filtramos por el año que el usuario seleccionó (ej: "2025")
    const feriadosFiltrados = feriados.filter(f => f.date.startsWith(year.toString()));
    
    return feriadosFiltrados;
  } catch (error) {
    console.error("Error al obtener feriados:", error);
    return []; // Retorna arreglo vacío si falla
  }
};