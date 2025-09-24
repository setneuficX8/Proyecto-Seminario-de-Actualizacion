import { useState } from "react"
import "./Card.css" // Agrega esta línea

export default function Card({ Data }) {
  return (
    <div className="card">
      <h2>{Data.name}</h2>
      <img src={Data.image} alt={Data.name} width={200} height={200} />
      
      <p><strong>Ki Base:</strong> {Data.ki}</p>
      <p><strong>Ki Máximo:</strong> {Data.maxKi}</p>
    </div>
  );
}
