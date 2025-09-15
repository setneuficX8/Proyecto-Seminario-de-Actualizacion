import ReactLogoDark from '../assets/React_dark.svg';
import GitHubLogo from '../assets/GitHub_dark.svg';
import './Ruta.css';

export default function Ruta() {
  return (
    <section>
      <h1>PARA SABER MÁS...</h1>
      
      <div className="cards-container">
        <div className="ingresoGitHub">
          <p>
            Si gustas saber más sobre nuestro proyecto, visita nuestro repositorio en GitHub
          </p>

          <a href="https://github.com/setneuficX8/Proyecto-Seminario-de-Actualizacion.git" target="_blank" rel="noopener noreferrer">
            <img src={GitHubLogo} alt="Logo de GitHub" width={50} height={50} className='logo-github' />
          </a>
        </div>

        <div className="ingresoReact">
          <p>
            Si gustas saber más sobre React, visita la página oficial de React
          </p>

          <a href="https://es.react.dev/" target="_blank" rel="noopener noreferrer">
            <img src={ReactLogoDark} alt="Logo de React" width={50} height={50} className='logo-react' />
          </a>
        </div>

      </div>

    </section>
  );
}