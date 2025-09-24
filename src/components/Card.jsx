import { useState } from "react"
import "./Card.css" // Agregamos el import del archivo CSS

export default function Card({ Data }) {
  return (
    <div className="card">
      <h2>{Data.name}</h2>
      <img src={Data.image} alt={Data.name} width={200} height={200} />
      <p><strong>Descripcion</strong> {Data.description}</p>
      <p><strong>Ki Base:</strong> {Data.ki}</p>
      <p><strong>Ki Máximo:</strong> {Data.maxKi}</p>
    </div>
  );
}
