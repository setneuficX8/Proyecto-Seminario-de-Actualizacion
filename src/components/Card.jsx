import { useState } from "react"

export default function Card({Data}) {
     Name: {Data.name}
     Image: {Data.imageUrl }       
     

    return(
        <>
        <div className="card">
        <h2>{Data.name}</h2>
        <img src={Data.imageUrl} alt={Data.name} width={200} height={200}/>
        </div>
        </>
    )
}